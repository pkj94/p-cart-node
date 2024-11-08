module.exports = class ControllerExtensionTotalLowOrderFee extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/total/low_order_fee');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('total_low_order_fee', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/total/low_order_fee', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/total/low_order_fee', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true);

		if ((this.request.post['total_low_order_fee_total'])) {
			data['total_low_order_fee_total'] = this.request.post['total_low_order_fee_total'];
		} else {
			data['total_low_order_fee_total'] = this.config.get('total_low_order_fee_total');
		}

		if ((this.request.post['total_low_order_fee_fee'])) {
			data['total_low_order_fee_fee'] = this.request.post['total_low_order_fee_fee'];
		} else {
			data['total_low_order_fee_fee'] = this.config.get('total_low_order_fee_fee');
		}

		if ((this.request.post['total_low_order_fee_tax_class_id'])) {
			data['total_low_order_fee_tax_class_id'] = this.request.post['total_low_order_fee_tax_class_id'];
		} else {
			data['total_low_order_fee_tax_class_id'] = this.config.get('total_low_order_fee_tax_class_id');
		}

		this.load.model('localisation/tax_class');

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['total_low_order_fee_status'])) {
			data['total_low_order_fee_status'] = this.request.post['total_low_order_fee_status'];
		} else {
			data['total_low_order_fee_status'] = this.config.get('total_low_order_fee_status');
		}

		if ((this.request.post['total_low_order_fee_sort_order'])) {
			data['total_low_order_fee_sort_order'] = this.request.post['total_low_order_fee_sort_order'];
		} else {
			data['total_low_order_fee_sort_order'] = this.config.get('total_low_order_fee_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/total/low_order_fee', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/total/low_order_fee')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}