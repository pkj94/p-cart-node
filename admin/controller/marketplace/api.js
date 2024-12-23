module.exports = class ApiMarketplaceController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketplace/api');
			
		data['user_token'] = this.session.data['user_token'];	
			
		this.response.setOutput(await this.load.view('marketplace/api', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('marketplace/api');

		const json = {error:{}};
		
		if (!await this.user.hasPermission('modify', 'marketplace/api')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['opencart_username']) {
			json['error']['username'] = this.language.get('error_username');
		}

		if (!this.request.post['opencart_secret']) {
			json['error']['secret'] = this.language.get('error_secret');
		}		

		if (!Object.keys(json.error).length) {
			this.load.model('setting/setting',this);
			
			await this.model_setting_setting.editSetting('opencart', this.request.post);
			
			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}