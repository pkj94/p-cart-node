module.exports = class ControllerExtensionPaymentFreeCheckout extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/payment/free_checkout');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_free_checkout', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/free_checkout', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/free_checkout', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_free_checkout_order_status_id'])) {
			data['payment_free_checkout_order_status_id'] = this.request.post['payment_free_checkout_order_status_id'];
		} else {
			data['payment_free_checkout_order_status_id'] = this.config.get('payment_free_checkout_order_status_id');
		}

		this.load.model('localisation/order_status',this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_free_checkout_status'])) {
			data['payment_free_checkout_status'] = this.request.post['payment_free_checkout_status'];
		} else {
			data['payment_free_checkout_status'] = this.config.get('payment_free_checkout_status');
		}

		if ((this.request.post['payment_free_checkout_sort_order'])) {
			data['payment_free_checkout_sort_order'] = this.request.post['payment_free_checkout_sort_order'];
		} else {
			data['payment_free_checkout_sort_order'] = this.config.get('payment_free_checkout_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/free_checkout', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/free_checkout')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}