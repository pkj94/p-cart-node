module.exports = class ControllerExtensionDashboardMap extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/dashboard/map');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_map', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true));
		} else {

			if ((this.error['warning'])) {
				data['error_warning'] = this.error['warning'];
			} else {
				data['error_warning'] = '';
			}

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_extension'),
				'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('extension/dashboard/map', 'user_token=' + this.session.data['user_token'], true)
			});

			data['action'] = await this.url.link('extension/dashboard/map', 'user_token=' + this.session.data['user_token'], true);

			data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

			if ((this.request.post['dashboard_map_width'])) {
				data['dashboard_map_width'] = this.request.post['dashboard_map_width'];
			} else {
				data['dashboard_map_width'] = this.config.get('dashboard_map_width');
			}

			data['columns'] = [];

			for (let i = 3; i <= 12; i++) {
				data['columns'].push(i);
			}

			if ((this.request.post['dashboard_map_status'])) {
				data['dashboard_map_status'] = this.request.post['dashboard_map_status'];
			} else {
				data['dashboard_map_status'] = this.config.get('dashboard_map_status');
			}

			if ((this.request.post['dashboard_map_sort_order'])) {
				data['dashboard_map_sort_order'] = this.request.post['dashboard_map_sort_order'];
			} else {
				data['dashboard_map_sort_order'] = this.config.get('dashboard_map_sort_order');
			}

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('extension/dashboard/map_form', data));
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/map')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true;
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/map');

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/dashboard/map_info', data);
	}

	async map() {
		const json = {};

		this.load.model('extension/dashboard/map', this);

		const results = await this.model_extension_dashboard_map.getTotalOrdersByCountry();

		for (let result of results) {
			json[strtolower(result['iso_code_2'])] = {
				'total': result['total'],
				'amount': this.currency.format(result['amount'], this.config.get('config_currency'))
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
