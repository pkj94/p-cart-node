module.exports = class FreeCheckoutPaymentController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/payment/free_checkout');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: this.url.link('extension/opencart/payment/free_checkout', 'user_token=' + this.session.data.user_token)
		});

		data.save = this.url.link('extension/opencart/payment/free_checkout.save', 'user_token=' + this.session.data.user_token);
		data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment');

		data.payment_free_checkout_order_status_id = this.config.get('payment_free_checkout_order_status_id');

		this.load.model('localisation/order_status', this);

		data.order_statuses = await this.model_localisation_order_status.getOrderStatuses();

		data.payment_free_checkout_status = this.config.get('payment_free_checkout_status');
		data.payment_free_checkout_sort_order = this.config.get('payment_free_checkout_sort_order');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/payment/free_checkout', data));
	}

	async save() {
		await this.load.language('extension/opencart/payment/free_checkout');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/payment/free_checkout')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('payment_free_checkout', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

