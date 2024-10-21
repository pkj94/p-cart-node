module.exports=class PaymentMethodController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('account/payment_method');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/payment_method', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('account/payment_method', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete (this.session.data['success']);
		} else {
			data['success'] = '';
		}

		data['list'] = await this.getList();

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['language'] = this.config.get('config_language');

		data['customer_token'] = this.session.data['customer_token'];

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/payment_method', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('account/payment_method');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/payment_method', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		data['payment_methods'] = [];

		this.load.model('account/payment_method');

		this.load.model('setting/extension',this);

		const results = await this.model_setting_extension.getExtensionsByType('payment');

		for (let result of results) {
			if (this.config.get('payment_' + result['code'] + '_status')) {
				this.load.model('extension/' + result['extension'] + '/payment/' + result['code']);

				//payment_method = this.{'model_extension_' + result['extension'] + '_payment_' + result['code']}.getMethods(payment_address);

				if (payment_method) {
					method_data[result['code']] = payment_method;
				}
			}
		}


		for (let result of results) {
			data['payment_methods'].push({
				'code'        : result['code'],
				'name'        : result['name'],
				'image'       : result['image'],
				'type'        : result['type'],
				'date_expire' : date('m-Y', new Date(result['date_expire'])),
				'delete'      : await this.url.link('account/payment_method.delete', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&customer_payment_id=' + result['customer_payment_id'])
			];
		}

		return await this.load.view('account/payment_method_list', data);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('account/payment_method');

		const json = {};

		if ((this.request.get['customer_payment_id'])) {
			customer_payment_id = this.request.get['customer_payment_id'];
		} else {
			customer_payment_id = 0;
		}

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/payment_method', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			this.load.model('account/payment_method');

			payment_method_info = await this.model_account_payment_method.getPaymentMethod(await this.customer.getId(), customer_payment_id);

			if (!payment_method_info) {
				json['error'] = this.language.get('error_payment_method');
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('extension/' + payment_method_info['extension'] + '/payment/' + payment_method_info['code']);

			if (this.{'model_extension_' + payment_method_info['extension'] + '_payment_' + payment_method_info['code']}.delete(customer_payment_id)) {

			}

			// Delete payment method from database+
			await this.model_account_payment_method.deletePaymentMethod(customer_payment_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
