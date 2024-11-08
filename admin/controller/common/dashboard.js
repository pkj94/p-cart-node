module.exports = class ControllerCommonDashboard extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/dashboard');

		this.document.setTitle(this.language.get('heading_title'));

		data['user_token'] = this.session.data['user_token'];

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		// Check install directory exists
		if (is_dir(DIR_CATALOG + '../install')) {
			data['error_install'] = this.language.get('error_install');
		} else {
			data['error_install'] = '';
		}

		// Dashboard Extensions
		let dashboards = [];

		this.load.model('setting/extension', this);

		// Get a list of installed modules
		const extensions = await this.model_setting_extension.getInstalled('dashboard');

		// Add all the modules which have multiple settings for each module
		for (let code of extensions) {
			if (this.config.get('dashboard_' + code + '_status') && await this.user.hasPermission('access', 'extension/dashboard/' + code)) {
				let output = await this.load.controller('extension/dashboard/' + code + '/dashboard');

				if (output) {
					dashboards.push({
						'code': code,
						'width': this.config.get('dashboard_' + code + '_width'),
						'sort_order': this.config.get('dashboard_' + code + '_sort_order'),
						'output': output
					});
				}
			}
		}
		dashboards = dashboards.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

		// Split the array so the columns width is not more than 12 on each row.
		let width = 0;
		let column = [];
		data['rows'] = [];

		for (let dashboard of dashboards) {
			column.push(dashboard);

			width = (width + dashboard['width']);

			if (width >= 12) {
				data['rows'].push(column);

				width = 0;
				column = [];
			}
		}

		if (column.length) {
			data['rows'].push(column);
		}
		if (DIR_STORAGE == DIR_SYSTEM + 'storage/') {
			data['security'] = await this.load.controller('common/security');
		} else {
			data['security'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		// Run currency update
		if (this.config.get('config_currency_auto')) {
			let config_currency_engine = this.config.get('config_currency_engine');
			if (config_currency_engine) {
				await this.load.controller('extension/currency/' + config_currency_engine + '/currency');
			}
		}
		this.response.setOutput(await this.load.view('common/dashboard', data));
	}
}
