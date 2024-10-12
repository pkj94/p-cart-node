const fs = require('fs');
const expressPath = require('path');
const AdmZip = require('adm-zip');
const sprintf = require('locutus/php/strings/sprintf');
const strtotime = require('locutus/php/datetime/strtotime');

module.exports = class InstallerMarketplaceController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketplace/installer');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('marketplace/installer', 'user_token=' + this.session.data['user_token'])
		});

		// Use the  for the max file size
		data['error_upload_size'] = sprintf(this.language.get('error_file_size'), process.env.UPLOAD_MAX_FILESIZE || '2M');

		data['config_file_max_size'] = ((process.env.UPLOAD_MAX_FILESIZE || '2M').replace(/[^0-9]/g, '') * 1024 * 1024);

		data['upload'] = this.url.link('tool/installer.upload', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		if ((this.request.get['filter_extension_id'])) {
			data['filter_extension_download_id'] = this.request.get['filter_extension_download_id'];
		} else {
			data['filter_extension_download_id'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/installer', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketplace/cron');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		await this.load.language('marketplace/installer');
		let filter_extension_download_id = '';
		if ((this.request.get['filter_extension_download_id'])) {
			filter_extension_download_id = this.request.get['filter_extension_download_id'];
		}
		let sort = 'name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}

		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		this.load.model('setting/extension', this);

		// Look for any new extensions
		let files = fs.readdirSync(DIR_STORAGE + 'marketplace/').filter(a => a.indexOf('.ocmod.zip') >= 0);
		console.log(files);
		for (let file of files) {
			let code = expressPath.basename(file, '.ocmod.zip');

			const install_info = await this.model_setting_extension.getInstallByCode(code);
			// console.log('install_info',install_info)
			if (!install_info.extension_install_id) {
				// Unzip the files
				let zip = new AdmZip(DIR_STORAGE + 'marketplace/' + file);

				const zipEntries = zip.getEntries();
				// console.log('zipEntries---',zipEntries)
				let install_info = null;

				zipEntries.forEach((zipEntry) => {
					if (zipEntry.entryName === 'install.json') {
						install_info = JSON.parse(zipEntry.getData().toString('utf8'));
					}
				});
				if (install_info) {
					let extension_data = {
						'extension_id': 0,
						'extension_download_id': 0,
						'name': install_info['name'],
						'code': code,
						'version': install_info['version'],
						'author': install_info['author'],
						'link': install_info['link']
					};

					await this.model_setting_extension.addInstall(extension_data);
				}


			}
		}

		data['extensions'] = [];

		let filter_data = {
			'filter_extension_download_id': filter_extension_download_id,
			'sort': sort,
			'order': order,
			'start': (page - 1) * this.config.get('config_pagination_admin'),
			'limit': this.config.get('config_pagination_admin')
		};

		const extension_total = await this.model_setting_extension.getTotalInstalls(filter_data);

		const results = await this.model_setting_extension.getInstalls(filter_data);

		for (let result of results) {
			let link = '';
			if (result['extension_id']) {
				link = this.url.link('marketplace/marketplace.info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id']);
			} else if (result['link']) {
				link = result['link'];
			}

			data['extensions'].push({
				'name': result['name'],
				'version': result['version'],
				'author': result['author'],
				'status': result['status'],
				'link': link,
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'install': this.url.link('marketplace/installer.install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + result['extension_install_id']),
				'uninstall': this.url.link('marketplace/installer.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + result['extension_install_id']),
				'delete': this.url.link('marketplace/installer.delete', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + result['extension_install_id'])
			});
		}

		data['results'] = sprintf(this.language.get('text_pagination'), (extension_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (extension_total - this.config.get('config_pagination_admin'))) ? extension_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), extension_total, Math.ceil(extension_total / this.config.get('config_pagination_admin')));

		let url = '';

		if ((this.request.get['filter_extension_id'])) {
			url += '&filter_extension_id=' + this.request.get['filter_extension_id'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('marketplace/installer.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_version'] = this.url.link('marketplace/installer.list', 'user_token=' + this.session.data['user_token'] + '&sort=version' + url);
		data['sort_date_added'] = this.url.link('marketplace/installer.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': extension_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('marketplace/installer.list', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		});

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketplace/installer_extension', data);
	}

	/**
	 * @return void
	 */
	async upload() {
		await this.load.language('marketplace/installer');

		const json = {};

		// 1. Validate the file uploaded.
		if ((this.request.files['file']['name'])) {
			let filename = expressPath.basename(this.request.files['file']['name']);

			// 2. Validate the filename.
			if ((oc_strlen(filename) < 1) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// 3. Validate is ocmod file.
			if (filename.substring(-10) != '.ocmod.zip') {
				json['error'] = this.language.get('error_file_type');
			}

			// 4. check if there is already a file
			let file = DIR_STORAGE + 'marketplace/' + filename;

			if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
				json['error'] = this.language.get('error_file_exists');

				// fs.unlinkSync(this.request.files['file']['tmp_name']);
			}

			// if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
			// 	json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			// }

			if (this.model_setting_extension.getInstallByCode(expressPath.basename(filename, '.ocmod.zip'))) {
				json['error'] = this.language.get('error_installed');
			}
		} else {
			json['error'] = this.language.get('error_upload');
		}

		// 5. Validate if the file can be opened and there is install.json that can be read.
		if (!Object.keys(json).length) {
			try {
				await uploadFile(this.request.files['file'], file);
			} catch (e) {
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}
			// Unzip the files
			try {
				let zip = new AdmZip(file);

				const zipEntries = zip.getEntries();
				let install_info = null;

				zipEntries.forEach((zipEntry) => {
					if (zipEntry.entryName === 'install.json') {
						install_info = JSON.parse(zipEntry.getData().toString('utf8'));
					}
				});
				if (install_info) {
					if (!install_info['name']) {
						json['error'] = this.language.get('error_name');
					}

					if (!install_info['version']) {
						json['error'] = this.language.get('error_version');
					}

					if (!install_info['author']) {
						json['error'] = this.language.get('error_author');
					}

					if (!install_info['link']) {
						json['error'] = this.language.get('error_link');
					}
				} else {
					json['error'] = this.language.get('error_install');
				}
			} catch (e) {
				json['error'] = this.language.get('error_unzip');
			}

		}

		if (!Object.keys(json).length) {
			let extension_data = {
				'extension_id': 0,
				'extension_download_id': 0,
				'name': install_info['name'],
				'code': expressPath.basename(filename, '.ocmod.zip'),
				'version': install_info['version'],
				'author': install_info['author'],
				'link': install_info['link']
			};

			this.load.model('setting/extension', this);

			await this.model_setting_extension.addInstall(extension_data);

			json['success'] = this.language.get('text_upload');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('marketplace/installer');

		const json = {};
		let extension_install_id = 0;
		if ((this.request.get['extension_install_id'])) {
			extension_install_id = this.request.get['extension_install_id'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension', this);

		const extension_install_info = await this.model_setting_extension.getInstall(extension_install_id);

		if (extension_install_info) {
			const file = DIR_STORAGE + 'marketplace/' + extension_install_info['code'] + '.ocmod.zip';

			if (!fs.lstatSync(file).isFile()) {
				json['error'] = sprintf(this.language.get('error_file'), extension_install_info['code'] + '.ocmod.zip');
			}

			if (page == 1 && fs.existsSync(DIR_EXTENSION + extension_install_info['code'] + '/')) {
				json['error'] = sprintf(this.language.get('error_directory_exists'), extension_install_info['code'] + '/');
			}

			if (page > 1 && !fs.existsSync(DIR_EXTENSION + extension_install_info['code'] + '/')) {
				json['error'] = sprintf(this.language.get('error_directory'), extension_install_info['code'] + '/');
			}
		} else {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			// Unzip the files
			const zip = new AdmZip(file);

			let total = zip.getEntryCount;
			let limit = 200;

			let start = (page - 1) * limit;
			let end = start > (total - limit) ? total : (start + limit);

			// Check if any of the files already exist.
			for (let i = start; i < end; i++) {
				const zipEntry = zip.getEntryByIndex(i);
				if (zipEntry) {
					const source = zipEntry.entryName;

					const destination = str_replace('\\', '/', source);

					// Only extract the contents of the upload folder
					let path = extension_install_info['code'] + '/' + destination;
					let base = DIR_EXTENSION;
					let prefix = '';

					// image > image
					if (destination.substring(0, 6) == 'image/') {
						path = destination;
						base = substr(DIR_IMAGE, 0, -6);
					}

					// We need to store the path differently for vendor folders.
					if (destination.substring(0, 15) == 'system/storage/') {
						path = destination.substring(15);
						base = DIR_STORAGE;
						prefix = 'system/storage/';
					}

					// Must not have a path before files and directories can be moved
					let path_new = '';

					let directories = expressPath.dirname(path).split('/');

					for (let directory of directories) {
						if (!path_new) {
							path_new = directory;
						} else {
							path_new = path_new + '/' + directory;
						}

						// To fix storage location
						if (!fs.existsSync(base + path_new + '/') && fs.mkdirSync(base + path_new + '/', { recursive: true })) {
							await this.model_setting_extension.addPath(extension_install_id, prefix + path_new);
						}
					}

					// If check if the path is not directory and check there is no existing file
					if (source.substring(-1) != '/') {
						if (!zipEntry.isDirectory && !fs.existsSync(base + path)) {
							fs.writeFileSync(base + path, zipEntry.getData());
							await this.model_setting_extension.addPath(extension_install_id, prefix + path);
						}
					}
				}

			}
			await this.model_setting_extension.editStatus(extension_install_id, 1);

		}

		if (!Object.keys(json).length) {
			json['text'] = sprintf(this.language.get('text_progress'), 2, total);

			let url = '';

			if ((this.request.get['extension_install_id'])) {
				url += '&extension_install_id=' + this.request.get['extension_install_id'];
			}

			if (end < total) {
				json['next'] = this.url.link('marketplace/installer.install', 'user_token=' + this.session.data['user_token'] + url + '&page=' + (page + 1), true);
			} else {
				json['next'] = this.url.link('marketplace/installer.vendor', 'user_token=' + this.session.data['user_token'] + url, true);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.load.language('marketplace/installer');

		const json = {};
		let extension_install_id = 0;
		if ((this.request.get['extension_install_id'])) {
			extension_install_id = this.request.get['extension_install_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension', this);

		const extension_install_info = await this.model_setting_extension.getInstall(extension_install_id);

		if (extension_install_info) {
			if (extension_install_info['code'] == 'opencart') {
				json['error'] = this.language.get('error_default');
			}

			// Validate if extension being uninstalled
			const extension_total = await this.model_setting_extension.getTotalExtensionsByExtension(extension_install_info['code']);

			if (extension_total) {
				json['error'] = sprintf(this.language.get('error_uninstall'), extension_total);
			}
		} else {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			let files = [];

			// Make path into an array
			let directory = [DIR_EXTENSION + extension_install_info['code'] + '/'];

			// While the path array is still populated keep looping through
			while (directory.length != 0) {
				let next = directory.shift();

				if (fs.lstatSync(next).isDirectory()) {
					for (let file of fs.existsSync(rtrim(next, '/'))) {
						// If directory add to path array
						directory.push(file);
					}
				}

				// Add the file to the files to be deleted array
				files.push(next);
			}

			// Reverse sort the file array
			files = files.reverse();

			for (let file of files) {
				// If file just delete
				if (fs.lstatSync(file).isFile()) {
					fs.unlinkSync(file);
				}

				// If directory use the remove directory function
				if (fs.lstatSync(file).isDirectory()) {
					fs.rmdirSync(file);
				}
			}

			// Remove extension directory and files
			const results = await this.model_setting_extension.getPathsByExtensionInstallId(extension_install_id);

			results = results.reverse();

			for (let result of results) {
				let path = '';

				// Remove images
				if (result['path'].substring(0, 6) == 'image/') {
					path = DIR_IMAGE + substr(result['path'], 6);
				}

				// Remove vendor files or any connected extensions that was also installed.
				if (result['path'].substring(0, 15) == 'system/storage/') {
					path = DIR_STORAGE + substr(result['path'], 15);
				}

				// Check if the location exists or not
				const path_total = await this.model_setting_extension.getTotalPaths(result['path']);

				if (path_total < 2) {
					if (fs.lstatSync(path).isFile()) {
						fs.unlinkSync(path);
					}

					if (fs.lstatSync(path).isDirectory()) {
						fs.rmdirSync(path);
					}
				}

				await this.model_setting_extension.deletePath(result['extension_path_id']);
			}

			// Remove extension directory
			await this.model_setting_extension.editStatus(extension_install_id, 0);

			let url = '';

			if ((this.request.get['extension_install_id'])) {
				url += '&extension_install_id=' + this.request.get['extension_install_id'];
			}

			json['next'] = this.url.link('marketplace/installer.vendor', 'user_token=' + this.session.data['user_token'] + url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/* Generate new autoloader file */
	/**
	 * @return void
	 */
	async vendor() {
		await this.load.language('marketplace/installer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			// Generate php autoload file
			let code = 'module.export=' + "\n";

			let files = fs.readdirSync(DIR_STORAGE + 'vendor/*/*/composer.json');

			// for (files of file) {
			// 	output = JSON.parse(file_get_contents(file), true);

			// 	code += '// ' + output['name'] + "\n";

			// 	if ((output['autoload'])) {
			// 		directory = substr(dirname(file), strlen(DIR_STORAGE + 'vendor/'));

			// 		// Autoload psr-4 files
			// 		if ((output['autoload']['psr-4'])) {
			// 			autoload = output['autoload']['psr-4'];

			// 			for (autoload of namespace : path) {
			// 				if (!is_array(path)) {
			// 					code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(path, '/') + '/' + '\', true);' + "\n";
			// 				} else {
			// 					for (path of value) {
			// 						code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(value, '/') + '/' + '\', true);' + "\n";
			// 					}
			// 				}
			// 			}
			// 		}

			// 		// Autoload psr-0 files
			// 		if ((output['autoload']['psr-0'])) {
			// 			autoload = output['autoload']['psr-0'];

			// 			for (autoload of namespace : path) {
			// 				if (!is_array(path)) {
			// 					code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(path, '/') + '/' + '\', true);' + "\n";
			// 				} else {
			// 					for (path of value) {
			// 						code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(value, '/') + '/' + '\', true);' + "\n";
			// 					}
			// 				}
			// 			}
			// 		}

			// 		// Autoload classmap
			// 		if ((output['autoload']['classmap'])) {
			// 			autoload = [];

			// 			classmaps = output['autoload']['classmap'];

			// 			for (classmaps of classmap) {
			// 				directories = [dirname(file) + '/' + classmap];

			// 				while (count(directories) != 0) {
			// 					next = array_shift(directories);

			// 					if (is_dir(next)) {
			// 						for (glob(trim(next, '/') + '/{*,.[!.]*,..?*}', GLOB_BRACE) of file) {
			// 							if (is_dir(file)) {
			// 								directories[] = file + '/';
			// 							}

			// 							if (fs.lstatSync(file).isFile()) {
			// 								namespace = substr(dirname(file), strlen(DIR_STORAGE + 'vendor/' + directory + classmap) + 1);

			// 								if (namespace) {
			// 									autoload[namespace] = substr(dirname(file), strlen(DIR_STORAGE + 'vendor/'));
			// 								}
			// 							}
			// 						}
			// 					}
			// 				}
			// 			}

			// 			for (autoload of namespace : path) {
			// 				code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + rtrim(path, '/') + '/' + '\', true);' + "\n";
			// 			}
			// 		}

			// 		// Autoload files
			// 		if ((output['autoload']['files'])) {
			// 			files = output['autoload']['files'];

			// 			for (files of file) {
			// 				code += 'require_once(DIR_STORAGE + \'vendor/' + directory + '/' + file + '\');' + "\n";
			// 			}
			// 		}
			// 	}

			// 	code += "\n";
			// }

			// file_put_contents(DIR_SYSTEM + 'vendor.php', trim(code));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('marketplace/installer');

		const json = {};
		let extension_install_id = 0;
		if ((this.request.get['extension_install_id'])) {
			extension_install_id = this.request.get['extension_install_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension', this);

		let extension_install_info = await this.model_setting_extension.getInstall(extension_install_id);

		if (extension_install_info && extension_install_info['code'] == 'opencart') {
			json['error'] = this.language.get('error_default');
		}

		if (!extension_install_info) {
			json['error'] = this.language.get('error_extension');
		}

		extension_install_info = await this.model_setting_extension.getInstall(extension_install_id);

		if (!Object.keys(json).length) {
			let file = DIR_STORAGE + 'marketplace/' + extension_install_info['code'] + '.ocmod.zip';

			// Remove file
			if (fs.lstatSync(file).isFile()) {
				fs.unlinkSync(file);
			}

			await this.model_setting_extension.deleteInstall(extension_install_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
