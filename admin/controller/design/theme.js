module.exports = class ControllerDesignTheme extends Controller {
	async index() {
		await this.load.language('design/theme');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('design/theme', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		data['stores'] = {};

		this.load.model('setting/store',this);

		results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id' : result['store_id'],
				'name'     : result['name']
			});
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/theme', data));
	}

	async history() {
		await this.load.language('design/theme');

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		data['histories'] = {};

		this.load.model('design/theme');
		this.load.model('setting/store',this);

		history_total = await this.model_design_theme.getTotalThemes();

		results = await this.model_design_theme.getThemes((page - 1) * Number(this.config.get('config_limit_admin')), Number(this.config.get('config_limit_admin')));

		for (let result of results) {
			store_info = await this.model_setting_store.getStore(result['store_id']);

			if (store_info) {
				store = store_info['name'];
			} else {
				store = '';
			}

			data['histories'].push({
				'store_id'   : result['store_id'],
				'store'      : (result['store_id'] ? store : this.language.get('text_default')),
				'route'      : result['route'],
				'theme'      : result['theme'],
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit'       : await this.url.link('design/theme/template', 'user_token=' + this.session.data['user_token'], true),
				'delete'     : await this.url.link('design/theme/delete', 'user_token=' + this.session.data['user_token'] + '&theme_id=' + result['theme_id'], true)
			});
		}

		pagination = new Pagination();
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

		json = {};

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		this.load.model('setting/setting',this);

		theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		if (substr(str_replace('\\', '/', realpath(DIR_CATALOG + 'view/theme/default/template/' + path)), 0, strlen(DIR_CATALOG + 'view')) == DIR_CATALOG + 'view') {
			path_data = {};

			// We grab the files from the default theme directory first of the custom themes drops back to the default theme if selected theme files can not be found.
			files = glob(rtrim(DIR_CATALOG + 'view/theme/{default,' + theme + '}/template/' + path, '/') + '/*', GLOB_BRACE);

			if (files) {
				for(let file of files) {
					if (!in_array(basename(file), path_data))  {
						if (is_dir(file)) {
							json['directory'].push({
								'name' : basename(file),
								'path' : trim(path + '/' + basename(file), '/')
							});
						}

						if (is_file(file)) {
							json['file'].push({
								'name' : basename(file),
								'path' : trim(path + '/' + basename(file), '/')
							});
						}

						path_data.push(basename(file);
					}
				}
			}
		}

		if ((this.request.get['path'])) {
			json['back'] = array(
				'name' : this.language.get('button_back'),
				'path' : encodeURIComponent(substr(path, 0, strrpos(path, '/'))),
			});
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async template() {
		await this.load.language('design/theme');

		json = {};

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		this.load.model('setting/setting',this);

		theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		this.load.model('design/theme');

		theme_info = await this.model_design_theme.getTheme(store_id, theme, path);

		if (theme_info) {
			json['code'] = html_entity_decode(theme_info['code']);
		} else if (is_file(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path) && (substr(str_replace('\\', '/', realpath(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path)), 0, strlen(DIR_CATALOG + 'view')) == DIR_CATALOG + 'view')) {
			json['code'] = file_get_contents(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path);
		} else if (is_file(DIR_CATALOG + 'view/theme/default/template/' + path) && (substr(str_replace('\\', '/', realpath(DIR_CATALOG + 'view/theme/default/template/' + path)), 0, strlen(DIR_CATALOG + 'view')) == DIR_CATALOG + 'view')) {
			json['code'] = file_get_contents(DIR_CATALOG + 'view/theme/default/template/' + path);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async save() {
		await this.load.language('design/theme');

		json = {};

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		this.load.model('setting/setting',this);

		theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
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

		if (!json) {
			this.load.model('design/theme');

			pos = strpos(path, '.');

			await this.model_design_theme.editTheme(store_id, theme, (pos !== false) ? substr(path, 0, pos) : path, this.request.post['code']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async reset() {
		await this.load.language('design/theme');

		json = {};

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		this.load.model('setting/setting',this);

		theme = await this.model_setting_setting.getSettingValue('config_theme', store_id);

		// This is only here for compatibility with old themes.
		if (theme == 'default') {
			theme = await this.model_setting_setting.getSettingValue('theme_default_directory', store_id);
		}

		if ((this.request.get['path'])) {
			path = this.request.get['path'];
		} else {
			path = '';
		}

		if (is_file(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path) && (substr(str_replace('\\', '/', realpath(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path)), 0, strlen(DIR_CATALOG + 'view')) == DIR_CATALOG + 'view')) {
			json['code'] = file_get_contents(DIR_CATALOG + 'view/theme/' + theme + '/template/' + path);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async delete() {
		await this.load.language('design/theme');

		json = {};

		if ((this.request.get['theme_id'])) {
			theme_id = this.request.get['theme_id'];
		} else {
			theme_id = 0;
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'design/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('design/theme');

			await this.model_design_theme.deleteTheme(theme_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
