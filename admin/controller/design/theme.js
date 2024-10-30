const rtrim = require("locutus/php/strings/rtrim");
const sprintf = require("locutus/php/strings/sprintf");
const trim = require("locutus/php/strings/trim");

module.exports = class Theme extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('design/theme');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('design/theme', 'user_token=' + this.session.data['user_token'])
		});

		data['stores'] = [];

		this.load.model('setting/store', this);

		const results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id': result['store_id'],
				'name': result['name']
			});
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/theme', data));
	}

	/**
	 * @return void
	 */
	async history() {
		const data = {}
		await this.load.language('design/theme');
		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}
		let limit = 10;

		data['histories'] = [];

		this.load.model('design/theme', this);
		this.load.model('setting/store', this);

		const history_total = await this.model_design_theme.getTotalThemes();

		const results = await this.model_design_theme.getThemes((page - 1) * limit, limit);

		for (let result of results) {
			const store_info = await this.model_setting_store.getStore(result['store_id']);
			let store = '';
			if (store_info.store_id) {
				store = store_info['name'];
			}

			data['histories'].push({
				'store_id': result['store_id'],
				'store': (result['store_id'] ? store : this.language.get('text_default')),
				'route': result['route'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'edit': await this.url.link('design/theme+template', 'user_token=' + this.session.data['user_token']),
				'delete': await this.url.link('design/theme+delete', 'user_token=' + this.session.data['user_token'] + '&theme_id=' + result['theme_id'])
			});
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': history_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('design/theme+history', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		this.response.setOutput(await this.load.view('design/theme_history', data));
	}

	/**
	 * @return void
	 */
	async path() {
		await this.load.language('design/theme');

		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		// Default templates
		json['directory'] = [];
		json['file'] = [];

		let directory = DIR_CATALOG + 'view/template';

		if (fs.realpathSync(directory + '/' + path).replaceAll('\\', '/').substring(0, directory.length) == directory) {
			// We grab the files from the default template directory
			let files = require('glob').sync(rtrim(DIR_CATALOG + 'view/template/' + path, '/') + '/*');
			files = files.sort();
			for (let file of files) {
				if (is_dir(file)) {
					json['directory'].push({
						'name': expressPath.basename(file),
						'path': trim(path + '/' + expressPath.basename(file), '/')
					});
				}

				if (is_file(file)) {
					json['file'].push({
						'name': expressPath.basename(file),
						'path': trim(path + '/' + expressPath.basename(file), '/')
					});
				}
			}
		}

		if (!path) {
			json['directory'].push({
				'name': this.language.get('text_extension'),
				'path': 'extension',
			});
		}

		// Extension templates
		json['extension'] = [];

		// List all the extensions
		if (path == 'extension') {
			let directories = require('glob').sync(DIR_EXTENSION + '*', { nodir: '/' });
			directories = directories.sort();
			for (let directory of directories) {
				json['extension']['directory'].push({
					'name': expressPath.basename(directory),
					'path': 'extension/' + expressPath.basename(directory)
				});
			}
		}

		// List extension sub directories directories
		if (path.substring(0, 10) == 'extension/') {
			let route = '';

			let part = path.split('/');

			let extension = part[1];

			delete part[0];
			delete part[1];

			if ((part[2])) {
				route = part.join('/');
			}

			let safe = true;

			if (fs.realpathSync(DIR_EXTENSION + extension).replaceAll('\\', '/').substring(0, DIR_EXTENSION.length) != DIR_EXTENSION) {
				safe = false;
			}

			let directory = DIR_EXTENSION + extension + '/catalog/view/template';

			if (fs.realpathSync(directory + '/' + route).replaceAll('\\', '/').substring(0, directory.length) != directory) {
				safe = false;
			}

			if (safe) {
				let files = require('glob').sync(rtrim(DIR_EXTENSION + extension + '/catalog/view/template/' + route, '/') + '/*');

				files = files.sort();

				for (let file of files) {
					if (is_dir(file)) {
						json['extension']['directory'].push({
							'name': expressPath.basename(file),
							'path': path + '/' + expressPath.basename(file)
						});
					}

					if (is_file(file)) {
						json['extension']['file'].push({
							'name': expressPath.basename(file),
							'path': path + '/' + expressPath.basename(file)
						});
					}
				}
			}
		}

		if (path) {
			json['back'] = {
				'name': this.language.get('button_back'),
				'path': encodeURIComponent(path.substring(0, path.indexOf('/'))),
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async template() {
		await this.load.language('design/theme');
		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		// Default template load
		let directory = DIR_CATALOG + 'view/template';
		if (is_file(directory + '/' + path) && (fs.realpathSync(directory + '/' + path).replaceAll('\\', '/').substring(0, directory.length) == directory)) {
			json['code'] = fs.readFileSync(DIR_CATALOG + 'view/template/' + path).toString();
		}

		// Extension template load
		if (path.substring(0, 10) == 'extension/') {
			let part = path.split('/');

			let extension = part[1];

			delete part[0];
			delete part[1];

			let route = part.join('/');

			let safe = true;

			if (fs.realpathSync(DIR_EXTENSION + extension).replaceAll('\\', '/').substring(0, DIR_EXTENSION.length) != DIR_EXTENSION) {
				safe = false;
			}

			let directory = DIR_EXTENSION + extension + '/catalog/view/template';

			if (fs.realpathSync(directory + '/' + route).replaceAll('\\', '/').substring(0, directory.length) != directory) {
				safe = false;
			}
			if (safe && is_file(directory + '/' + route)) {
				json['code'] = fs.readFileSync(directory + '/' + route).toString();
			}
		}

		// Custom template load
		this.load.model('design/theme', this);

		const theme_info = await this.model_design_theme.getTheme(store_id, path.split(".").shift());
		// console.log('=====',theme_info,path)
		if (theme_info.theme_id) {
			json['code'] = html_entity_decode(theme_info['code']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('design/theme');

		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}
		// Check user has permission
		if (!await this.user.hasPermission('modify', 'design/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (substr(path, -5) != '.twig') {
			json['error'] = this.language.get('error_twig');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/theme', this);

			let pos = path.indexOf('.');

			await this.model_design_theme.editTheme(store_id, (pos !== false) ? path.substring(0, pos) : path, this.request.post['code']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async reset() {
		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		let directory = DIR_CATALOG + 'view/template';

		if (is_file(directory + '/' + path) && (fs.realpathSync(directory + '/' + path).replaceAll('\\', '/').substring(0, directory.length) == directory)) {
			json['code'] = fs.readFileSync(DIR_CATALOG + 'view/template/' + path).toString();
		}

		// Extension template load
		if (path.substring(0, 10) == 'extension/') {
			let part = explode('/', path);

			let extension = part[1];

			delete part[0];
			delete part[1];

			let route = part.split('/');

			let safe = true;

			if (fs.realpathSync(DIR_EXTENSION + extension).replaceAll('\\', '/').substring(0, DIR_EXTENSION.length) != DIR_EXTENSION) {
				safe = false;
			}

			let directory = DIR_EXTENSION + extension + '/catalog/view/template';

			if (fs.realpathSync(directory + '/' + route).replaceAll('\\', '/').substring(0, directory.length) != directory) {
				safe = false;
			}

			if (safe && is_file(directory + '/' + route)) {
				json['code'] = fs.readFileSync(directory + '/' + route).toString();
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('design/theme');

		const json = {};
		let theme_id = 0;
		if ((this.request.get['theme_id'])) {
			theme_id = this.request.get['theme_id'];
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'design/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/theme', this);

			await this.model_design_theme.deleteTheme(theme_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
