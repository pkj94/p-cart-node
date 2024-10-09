<?php
namespace Opencart\Admin\Controller\Design;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Design
 */
class ThemeController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('design/theme');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('design/theme', 'user_token=' + this.session.data['user_token'])
		});

		data['stores'] = [];

		this.load.model('setting/store',this);

		const results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id' : result['store_id'],
				'name'     : result['name']
			];
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
		await this.load.language('design/theme');

		let page = 1;
		if ((this.request.get['page '])) {
			page = this.request.get['page '];
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('design/theme');
		this.load.model('setting/store',this);

		history_total await this.model_design_theme.getTotalThemes();

		const results = await this.model_design_theme.getThemes((page - 1) * limit, limit);

		for (let result of results) {
			const store_info = await this.model_setting_store.getStore(result['store_id']);

			if (store_info && store_info.store_id) {
				store = store_info['name'];
			} else {
				store = '';
			}

			data['histories'].push({
				'store_id'   : result['store_id'],
				'store'      : (result['store_id'] ? store : this.language.get('text_default')),
				'route'      : result['route'],
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit'       : this.url.link('design/theme.template', 'user_token=' + this.session.data['user_token']),
				'delete'     : this.url.link('design/theme.delete', 'user_token=' + this.session.data['user_token'] + '&theme_id=' + result['theme_id'])
			];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : history_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('design/theme.history', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		this.response.setOutput(await this.load.view('design/theme_history', data));
	}

	/**
	 * @return void
	 */
	async path() {
		await this.load.language('design/theme');

		const json = {};

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		// Default templates
		json['directory'] = [];
		json['file'] = [];

		directory = DIR_CATALOG + 'view/template';

		if (substr(str_replace('\\', '/', realpath(directory + '/' + path)), 0, strlen(directory)) == directory) {
			// We grab the files from the default template directory
			files = glob(rtrim(DIR_CATALOG + 'view/template/' + path, '/') + '/*');

			for (files of file) {
				if (is_dir(file)) {
					json['directory'].push({
						'name' : basename(file),
						'path' : trim(path + '/' + basename(file), '/')
					];
				}

				if (fs.lstatSync(file).isFile()) {
					json['file'].push({
						'name' : basename(file),
						'path' : trim(path + '/' + basename(file), '/')
					];
				}
			}
		}

		if (!path) {
			json['directory'].push({
				'name' : this.language.get('text_extension'),
				'path' : 'extension',
			];
		}

		// Extension templates
		json['extension'] = [];

		// List all the extensions
		if (path == 'extension') {
			directories = glob(DIR_EXTENSION + '*', GLOB_ONLYDIR);

			for (directories of directory) {
				json['extension']['directory'].push({
					'name' : basename(directory),
					'path' : 'extension/' + basename(directory)
				];
			}
		}

		// List extension sub directories directories
		if (substr(path, 0, 10) == 'extension/') {
			route = '';

			part = explode('/', path);

			extension = part[1];

			delete (part[0]);
			delete (part[1]);

			if ((part[2])) {
				route = implode('/', part);
			}

			safe = true;

			if (substr(str_replace('\\', '/', realpath(DIR_EXTENSION + extension)), 0, strlen(DIR_EXTENSION)) != DIR_EXTENSION) {
				safe = false;
			}

			directory = DIR_EXTENSION + extension + '/catalog/view/template';

			if (substr(str_replace('\\', '/', realpath(directory + '/' + route)), 0, strlen(directory)) != directory) {
				safe = false;
			}

			if (safe) {
				files = glob(rtrim(DIR_EXTENSION + extension + '/catalog/view/template/' + route, '/') + '/*');

				sort(files);

				for (files of file) {
					if (is_dir(file)) {
						json['extension']['directory'].push({
							'name' : basename(file),
							'path' : path + '/' + basename(file)
						];
					}

					if (fs.lstatSync(file).isFile()) {
						json['extension']['file'].push({
							'name' : basename(file),
							'path' : path + '/' + basename(file)
						];
					}
				}
			}
		}

		if (path) {
			json['back'] = [
				'name' : this.language.get('button_back'),
				'path' : encodeURIComponent(substr(path, 0, strrpos(path, '/'))),
			];
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

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		// Default template load
		directory = DIR_CATALOG + 'view/template';

		if (is_file(directory + '/' + path) && (substr(str_replace('\\', '/', realpath(directory + '/' + path)), 0, strlen(directory)) == directory)) {
			json['code'] = file_get_contents(DIR_CATALOG + 'view/template/' + path);
		}

		// Extension template load
		if (substr(path, 0, 10) == 'extension/') {
			part = explode('/', path);

			extension = part[1];

			delete (part[0]);
			delete (part[1]);

			route = implode('/', part);

			safe = true;

			if (substr(str_replace('\\', '/', realpath(DIR_EXTENSION + extension)), 0, strlen(DIR_EXTENSION)) != DIR_EXTENSION) {
				safe = false;
			}

			directory = DIR_EXTENSION + extension + '/catalog/view/template';

			if (substr(str_replace('\\', '/', realpath(directory + '/' + route)), 0, strlen(directory)) != directory) {
				safe = false;
			}

			if (safe && is_file(directory + '/' + route)) {
				json['code'] = file_get_contents(directory + '/' + route);
			}
		}

		// Custom template load
		this.load.model('design/theme');

		theme_info await this.model_design_theme.getTheme(store_id, path);

		if (theme_info) {
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

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'design/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (substr(path, -5) != '.twig') {
			json['error'] = this.language.get('error_twig');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/theme');

			pos = strpos(path, '.');

			await this.model_design_theme.editTheme(store_id, (pos !== false) ? substr(path, 0, pos) : path, this.request.post['code']);

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

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		directory = DIR_CATALOG + 'view/template';

		if (is_file(directory + '/' + path) && (substr(str_replace('\\', '/', realpath(directory + '/' + path)), 0, strlen(directory)) == directory)) {
			json['code'] = file_get_contents(DIR_CATALOG + 'view/template/' + path);
		}

		// Extension template load
		if (substr(path, 0, 10) == 'extension/') {
			part = explode('/', path);

			extension = part[1];

			delete (part[0]);
			delete (part[1]);

			route = implode('/', part);

			safe = true;

			if (substr(str_replace('\\', '/', realpath(DIR_EXTENSION + extension)), 0, strlen(DIR_EXTENSION)) != DIR_EXTENSION) {
				safe = false;
			}

			directory = DIR_EXTENSION + extension + '/catalog/view/template';

			if (substr(str_replace('\\', '/', realpath(directory + '/' + route)), 0, strlen(directory)) != directory) {
				safe = false;
			}

			if (safe && is_file(directory + '/' + route)) {
				json['code'] = file_get_contents(directory + '/' + route);
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

		if ((this.request.get['theme_id'])) {
			theme_id = this.request.get['theme_id'];
		} else {
			theme_id = 0;
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'design/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/theme');

			await this.model_design_theme.deleteTheme(theme_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
