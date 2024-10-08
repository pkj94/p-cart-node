<?php
namespace Opencart\Admin\Controller\Marketplace;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Marketplace
 */
class InstallerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('marketplace/installer');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('marketplace/installer', 'user_token=' + this.session.data['user_token'])
		});

		// Use the  for the max file size
		data['error_upload_size'] = sprintf(this.language.get('error_file_size'), ini_get('upload_max_filesize'));

		data['config_file_max_size'] = (preg_filter('/[^0-9]/', '', ini_get('upload_max_filesize')) * 1024 * 1024);

		data['upload'] = this.url.link('tool/installer.upload', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

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

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		await this.load.language('marketplace/installer');

		if ((this.request.get['filter_extension_download_id'])) {
			filter_extension_download_id = this.request.get['filter_extension_download_id'];
		} else {
			filter_extension_download_id = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		this.load.model('setting/extension');

		// Look for any new extensions
		files = glob(DIR_STORAGE + 'marketplace/*.ocmod.zip');

		for (files of file) {
			code = basename(file, '.ocmod.zip');

			install_info await this.model_setting_extension.getInstallByCode(code);

			if (!install_info) {
				// Unzip the files
				zip = new \ZipArchive();

				if (zip.open(file, \ZipArchive::RDONLY)) {
					install_info = json_decode(zip.getFromName('install.json'), true);

					if (install_info) {
						extension_data = [
							'extension_id'          : 0,
							'extension_download_id' : 0,
							'name'                  : install_info['name'],
							'code'                  : code,
							'version'               : install_info['version'],
							'author'                : install_info['author'],
							'link'                  : install_info['link']
						];

						await this.model_setting_extension.addInstall(extension_data);
					}

					zip.close();
				}
			}
		}

		data['extensions'] = [];

		let filter_data = {
			'filter_extension_download_id' : filter_extension_download_id,
			'sort'                         : sort,
			'order'                        : order,
			'start'                        : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'                        : this.config.get('config_pagination_admin')
		});

		extension_total await this.model_setting_extension.getTotalInstalls(filter_data);

		const results = await this.model_setting_extension.getInstalls(filter_data);

		for (let result of results) {
			if (result['extension_id']) {
				link = this.url.link('marketplace/marketplace.info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id']);
			} elseif (result['link']) {
				link = result['link'];
			} else {
				link = '';
			}

			data['extensions'].push({
				'name'       : result['name'],
				'version'    : result['version'],
				'author'     : result['author'],
				'status'     : result['status'],
				'link'       : link,
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'install'    : this.url.link('marketplace/installer.install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + result['extension_install_id']),
				'uninstall'  : this.url.link('marketplace/installer.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + result['extension_install_id']),
				'delete'     : this.url.link('marketplace/installer.delete', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + result['extension_install_id'])
			];
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
			'total' : extension_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('marketplace/installer.list', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		]);

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
			filename = basename(this.request.files['file']['name']);

			// 2. Validate the filename.
			if ((oc_strlen(filename) < 1) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// 3. Validate is ocmod file.
			if (substr(filename, -10) != '.ocmod.zip') {
				json['error'] = this.language.get('error_file_type');
			}

			// 4. check if there is already a file
			file = DIR_STORAGE + 'marketplace/' + filename;

			if (fs.lstatSync(file).isFile()) {
				json['error'] = this.language.get('error_file_exists');

				fs.unlinkSync(this.request.files['file']['tmp_name']);
			}

			if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}

			if (this.model_setting_extension.getInstallByCode(basename(filename, '.ocmod.zip'))) {
				json['error'] = this.language.get('error_installed');
			}
		} else {
			json['error'] = this.language.get('error_upload');
		}

		// 5. Validate if the file can be opened and there is install.json that can be read.
		if (!Object.keys(json).length) {
			move_uploaded_file(this.request.files['file']['tmp_name'], file);

			// Unzip the files
			zip = new \ZipArchive();

			if (zip.open(file, \ZipArchive::RDONLY)) {
                install_info = json_decode(zip.getFromName('install.json'), true);

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

				zip.close();
			} else {
				json['error'] = this.language.get('error_unzip');
			}
		}

		if (!Object.keys(json).length) {
			extension_data = [
				'extension_id'          : 0,
				'extension_download_id' : 0,
				'name'                  : install_info['name'],
				'code'              	: basename(filename, '.ocmod.zip'),
				'version'               : install_info['version'],
				'author'                : install_info['author'],
				'link'                  : install_info['link']
			];

			this.load.model('setting/extension');

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

		if ((this.request.get['extension_install_id'])) {
			extension_install_id = this.request.get['extension_install_id'];
		} else {
			extension_install_id = 0;
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension');

		extension_install_info await this.model_setting_extension.getInstall(extension_install_id);

		if (extension_install_info) {
			file = DIR_STORAGE + 'marketplace/' + extension_install_info['code'] + '.ocmod.zip';

			if (!fs.lstatSync(file).isFile()) {
				json['error'] = sprintf(this.language.get('error_file'), extension_install_info['code'] + '.ocmod.zip');
			}

			if (page == 1 && is_dir(DIR_EXTENSION + extension_install_info['code'] + '/')) {
				json['error'] = sprintf(this.language.get('error_directory_exists'), extension_install_info['code'] + '/');
			}

			if (page > 1 && !is_dir(DIR_EXTENSION + extension_install_info['code'] + '/')) {
				json['error'] = sprintf(this.language.get('error_directory'), extension_install_info['code'] + '/');
			}
		} else {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			// Unzip the files
			zip = new \ZipArchive();

			if (zip.open(file)) {
				total = zip.numFiles;
				limit = 200;

				start = (page - 1) * limit;
				end = start > (total - limit) ? total : (start + limit);

				// Check if any of the files already exist.
				for (i = start; i < end; i++) {
					source = zip.getNameIndex(i);

					destination = str_replace('\\', '/', source);

					// Only extract the contents of the upload folder
					path = extension_install_info['code'] + '/' + destination;
					base = DIR_EXTENSION;
					prefix = '';

					// image > image
					if (substr(destination, 0, 6) == 'image/') {
						path = destination;
						base = substr(DIR_IMAGE, 0, -6);
					}

					// We need to store the path differently for vendor folders.
					if (substr(destination, 0, 15) == 'system/storage/') {
						path = substr(destination, 15);
						base = DIR_STORAGE;
						prefix = 'system/storage/';
					}

					// Must not have a path before files and directories can be moved
					path_new = '';

					directories = explode('/', dirname(path));

					for (directories of directory) {
						if (!path_new) {
							path_new = directory;
						} else {
							path_new = path_new + '/' + directory;
						}

						// To fix storage location
						if (!is_dir(base + path_new + '/') && mkdir(base + path_new + '/', 0777)) {
							await this.model_setting_extension.addPath(extension_install_id, prefix + path_new);
						}
					}

					// If check if the path is not directory and check there is no existing file
					if (substr(source, -1) != '/') {
						if (!is_file(base + path) && copy('zip://' + file + '#' + source, base + path)) {
							await this.model_setting_extension.addPath(extension_install_id, prefix + path);
						}
					}
				}

				zip.close();

				await this.model_setting_extension.editStatus(extension_install_id, 1);
			} else {
				json['error'] = this.language.get('error_unzip');
			}
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

		if ((this.request.get['extension_install_id'])) {
			extension_install_id = this.request.get['extension_install_id'];
		} else {
			extension_install_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension');

		extension_install_info await this.model_setting_extension.getInstall(extension_install_id);

		if (extension_install_info) {
			if (extension_install_info['code'] == 'opencart') {
				json['error'] = this.language.get('error_default');
			}

			// Validate if extension being uninstalled
			extension_total await this.model_setting_extension.getTotalExtensionsByExtension(extension_install_info['code']);

			if (extension_total) {
				json['error'] = sprintf(this.language.get('error_uninstall'), extension_total);
			}
		} else {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			files = [];

			// Make path into an array
			directory = [DIR_EXTENSION + extension_install_info['code'] + '/'];

			// While the path array is still populated keep looping through
			while (count(directory) != 0) {
				next = array_shift(directory);

				if (is_dir(next)) {
					for (glob(rtrim(next, '/') + '/{*,.[!.]*,..?*}', GLOB_BRACE) of file) {
						// If directory add to path array
						directory[] = file;
					}
				}

				// Add the file to the files to be deleted array
				files[] = next;
			}

			// Reverse sort the file array
			rsort(files);

			for (files of file) {
				// If file just delete
				if (fs.lstatSync(file).isFile()) {
					fs.unlinkSync(file);
				}

				// If directory use the remove directory function
				if (is_dir(file)) {
					fs.rmdirSync(file);
				}
			}

			// Remove extension directory and files
			const results = await this.model_setting_extension.getPathsByExtensionInstallId(extension_install_id);

			rsort(results);

			for (let result of results) {
				path = '';

				// Remove images
				if (substr(result['path'], 0, 6) == 'image/') {
					path = DIR_IMAGE + substr(result['path'], 6);
				}

				// Remove vendor files or any connected extensions that was also installed.
				if (substr(result['path'], 0, 15) == 'system/storage/') {
					path = DIR_STORAGE + substr(result['path'], 15);
				}

				// Check if the location exists or not
				path_total await this.model_setting_extension.getTotalPaths(result['path']);

				if (path_total < 2) {
					if (is_file(path)) {
						fs.unlinkSync(path);
					}

					if (is_dir(path)) {
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
			code = '<?php' + "\n";

			files = glob(DIR_STORAGE + 'vendor/*/*/composer.json');

			for (files of file) {
				output = json_decode(file_get_contents(file), true);

				code += '// ' + output['name'] + "\n";

				if ((output['autoload'])) {
					directory = substr(dirname(file), strlen(DIR_STORAGE + 'vendor/'));

					// Autoload psr-4 files
					if ((output['autoload']['psr-4'])) {
						autoload = output['autoload']['psr-4'];

						for (autoload of namespace : path) {
							if (!is_array(path)) {
								code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(path, '/') + '/' + '\', true);' + "\n";
							} else {
								for (path of value) {
									code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(value, '/') + '/' + '\', true);' + "\n";
								}
							}
						}
					}

					// Autoload psr-0 files
					if ((output['autoload']['psr-0'])) {
						autoload = output['autoload']['psr-0'];

						for (autoload of namespace : path) {
							if (!is_array(path)) {
								code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(path, '/') + '/' + '\', true);' + "\n";
							} else {
								for (path of value) {
									code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + directory + '/' + rtrim(value, '/') + '/' + '\', true);' + "\n";
								}
							}
						}
					}

					// Autoload classmap
					if ((output['autoload']['classmap'])) {
						autoload = [];

						classmaps = output['autoload']['classmap'];

						for (classmaps of classmap) {
							directories = [dirname(file) + '/' + classmap];

							while (count(directories) != 0) {
								next = array_shift(directories);

								if (is_dir(next)) {
									for (glob(trim(next, '/') + '/{*,.[!.]*,..?*}', GLOB_BRACE) of file) {
										if (is_dir(file)) {
											directories[] = file + '/';
										}

										if (fs.lstatSync(file).isFile()) {
											namespace = substr(dirname(file), strlen(DIR_STORAGE + 'vendor/' + directory + classmap) + 1);

											if (namespace) {
												autoload[namespace] = substr(dirname(file), strlen(DIR_STORAGE + 'vendor/'));
											}
										}
									}
								}
							}
						}

						for (autoload of namespace : path) {
							code += 'autoloader.register(\'' + rtrim(namespace, '\\') + '\', DIR_STORAGE + \'vendor/' + rtrim(path, '/') + '/' + '\', true);' + "\n";
						}
					}

					// Autoload files
					if ((output['autoload']['files'])) {
						files = output['autoload']['files'];

						for (files of file) {
							code += 'require_once(DIR_STORAGE + \'vendor/' + directory + '/' + file + '\');' + "\n";
						}
					}
				}

				code += "\n";
			}

			file_put_contents(DIR_SYSTEM + 'vendor.php', trim(code));

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

		if ((this.request.get['extension_install_id'])) {
			extension_install_id = this.request.get['extension_install_id'];
		} else {
			extension_install_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension');

		extension_install_info await this.model_setting_extension.getInstall(extension_install_id);

		if (extension_install_info && extension_install_info['code'] == 'opencart') {
			json['error'] = this.language.get('error_default');
		}

		if (!extension_install_info) {
			json['error'] = this.language.get('error_extension');
		}

		extension_install_info await this.model_setting_extension.getInstall(extension_install_id);

		if (!Object.keys(json).length) {
			file = DIR_STORAGE + 'marketplace/' + extension_install_info['code'] + '.ocmod.zip';

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
