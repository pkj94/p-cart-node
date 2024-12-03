const rtrim = require('locutus/php/strings/rtrim');
const trim = require('locutus/php/strings/trim');

module.exports = class ControllerDesignTheme extends Controller {
	async index() {
		const data = {};
		await this.load.language('design/theme');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('design/theme', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		data['stores'] = [];

		this.load.model('setting/store', this);

		const results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id': result['store_id'],
				'name': result['name']
			});
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/theme', data));
	}

	async history() {
		const data = {};
		await this.load.language('design/theme');
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['histories'] = [];

		this.load.model('design/theme', this);
		this.load.model('setting/store', this);

		const history_total = await this.model_design_theme.getTotalThemes();

		const results = await this.model_design_theme.getThemes((page - 1) * Number(this.config.get('config_limit_admin')), Number(this.config.get('config_limit_admin')));

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
				'theme': result['theme'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'edit': await this.url.link('design/theme/template', 'user_token=' + this.session.data['user_token'], true),
				'delete': await this.url.link('design/theme/delete', 'user_token=' + this.session.data['user_token'] + '&theme_id=' + result['theme_id'], true)
			});
		}

		const pagination = new Pagination();
		pagination.total = history_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('design/theme/history', 'user_token=' + this.session.data['user_token'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (history_total - Number(this.config.get('config_limit_admin')))) ? history_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), history_total, Math.ceil(history_total / Number(this.config.get('config_limit_admin'))));

		this.response.setOutput(await this.load.view('design/theme_history', data));
	}

	async path() {
		await this.load.language('design/theme');

		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}

		this.load.model('setting/setting', this);

		let theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);
		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		if (fs.realpathSync(DIR_CATALOG + 'view/theme/default/template/' + path).replaceAll('\\', '/').substr(0, (DIR_CATALOG + 'view').length) == DIR_CATALOG + 'view') {
			let path_data = [];

			// We grab the files from the default theme directory first of the custom themes drops back to the default theme if selected theme files can not be found.
			let files = require('glob').sync(rtrim(DIR_CATALOG + 'view/theme/{default,' + theme + '}/template/' + path, '/') + '/*');
			json['directory'] = [];
			json['file'] = [];
			if (files.length) {
				for (let file of files.sort()) {
					if (!path_data.includes(expressPath.basename(file))) {
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

						path_data.push(expressPath.basename(file));
					}
				}
			}
		}

		if ((this.request.get['path'])) {
			json['back'] = {
				'name': this.language.get('button_back'),
				'path': encodeURIComponent(substr(path, 0, strrpos(path, '/'))),
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async template() {
		await this.load.language('design/theme');

		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}

		this.load.model('setting/setting', this);

		let theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		this.load.model('design/theme', this);

		const theme_info = await this.model_design_theme.getTheme(store_id, theme, path);

		if (theme_info.theme_id) {
			json['code'] = html_entity_decode(theme_info['code']);
		} else if (is_file(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path) && (fs.realpathSync(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path).replaceAll('\\', '/').substr(0, (DIR_CATALOG + 'view').length) == DIR_CATALOG + 'view')) {
			json['code'] = fs.readFileSync(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path, 'utf-8');
		} else if (is_file(DIR_CATALOG + 'view/theme/default/template/' + path) && (fs.realpathSync(DIR_CATALOG + 'view/theme/default/template/' + path).replace('\\', '/').substr(0, (DIR_CATALOG + 'view').length) == DIR_CATALOG + 'view')) {
			json['code'] = fs.readFileSync(DIR_CATALOG + 'view/theme/default/template/' + path);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async save() {
		await this.load.language('design/theme');

		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}

		this.load.model('setting/setting', this);

		let theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'design/theme')) {
			json['error'] = this.language.get('error_permission');
		}
		if (path.substr(-5) != '.twig') {
			json['error'] = this.language.get('error_twig');
		}

		if (!json.error) {
			this.load.model('design/theme', this);

			let pos = path.indexOf('.');

			await this.model_design_theme.editTheme(store_id, theme, (pos !== false) ? path.substr(0, pos) : path, this.request.post['code']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async reset() {
		await this.load.language('design/theme');

		const json = {};
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}

		this.load.model('setting/setting', this);

		let theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}
		let path = '';
		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		}

		if (is_file(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path) && (fs.realpathSync(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path).replaceAll('\\', '/').substr(0, (DIR_CATALOG + 'view').length) == DIR_CATALOG + 'view')) {
			json['code'] = fs.readFileSync(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path, 'utf-8');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

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

		if (!json.error) {
			this.load.model('design/theme', this);

			await this.model_design_theme.deleteTheme(theme_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
