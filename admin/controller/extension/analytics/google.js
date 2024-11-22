module.exports = class ControllerExtensionAnalyticsGoogle extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/analytics/google');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);
		
		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('analytics_google', this.request.post, this.request.get['store_id']);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=analytics', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['code'])) {
			data['error_code'] = this.error['code'];
		} else {
			data['error_code'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=analytics', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/analytics/google', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true)
		});

		data['action'] = await this.url.link('extension/analytics/google', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=analytics', true);
		
		data['user_token'] = this.session.data['user_token'];
				
		if ((this.request.post['analytics_google_code'])) {
			data['analytics_google_code'] = this.request.post['analytics_google_code'];
		} else {
			data['analytics_google_code'] = await this.model_setting_setting.getSettingValue('analytics_google_code', this.request.get['store_id']);
		}
		
		if ((this.request.post['analytics_google_status'])) {
			data['analytics_google_status'] = this.request.post['analytics_google_status'];
		} else {
			data['analytics_google_status'] = await this.model_setting_setting.getSettingValue('analytics_google_status', this.request.get['store_id']);
		}
		
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/analytics/google', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/analytics/google')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['analytics_google_code']) {
			this.error['code'] = this.language.get('error_code');
		}			

		return Object.keys(this.error).length?false:true
	}
}
