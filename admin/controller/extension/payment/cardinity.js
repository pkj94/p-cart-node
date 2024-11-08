module.exports = class ControllerExtensionPaymentCardinity extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/cardinity');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_cardinity', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['key'])) {
			data['error_key'] = this.error['key'];
		} else {
			data['error_key'] = '';
		}

		if ((this.error['secret'])) {
			data['error_secret'] = this.error['secret'];
		} else {
			data['error_secret'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/cardinity', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/cardinity', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_cardinity_key'])) {
			data['payment_cardinity_key'] = this.request.post['payment_cardinity_key'];
		} else {
			data['payment_cardinity_key'] = this.config.get('payment_cardinity_key');
		}

		if ((this.request.post['payment_cardinity_secret'])) {
			data['payment_cardinity_secret'] = this.request.post['payment_cardinity_secret'];
		} else {
			data['payment_cardinity_secret'] = this.config.get('payment_cardinity_secret');
		}

		if ((this.request.post['payment_cardinity_debug'])) {
			data['payment_cardinity_debug'] = this.request.post['payment_cardinity_debug'];
		} else {
			data['payment_cardinity_debug'] = this.config.get('payment_cardinity_debug');
		}

		if ((this.request.post['payment_cardinity_total'])) {
			data['payment_cardinity_total'] = this.request.post['payment_cardinity_total'];
		} else {
			data['payment_cardinity_total'] = this.config.get('payment_cardinity_total');
		}

		if ((this.request.post['payment_cardinity_order_status_id'])) {
			data['payment_cardinity_order_status_id'] = this.request.post['payment_cardinity_order_status_id'];
		} else {
			data['payment_cardinity_order_status_id'] = this.config.get('payment_cardinity_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_cardinity_geo_zone_id'])) {
			data['payment_cardinity_geo_zone_id'] = this.request.post['payment_cardinity_geo_zone_id'];
		} else {
			data['payment_cardinity_geo_zone_id'] = this.config.get('payment_cardinity_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_cardinity_status'])) {
			data['payment_cardinity_status'] = this.request.post['payment_cardinity_status'];
		} else {
			data['payment_cardinity_status'] = this.config.get('payment_cardinity_status');
		}

		if ((this.request.post['payment_cardinity_sort_order'])) {
			data['payment_cardinity_sort_order'] = this.request.post['payment_cardinity_sort_order'];
		} else {
			data['payment_cardinity_sort_order'] = this.config.get('payment_cardinity_sort_order');
		}
		
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/cardinity', data));
	}

	async order() {
		await this.load.language('extension/payment/cardinity');

		data['user_token'] = this.session.data['user_token'];
		data['order_id'] = this.request.get['order_id'];

		return await this.load.view('extension/payment/cardinity_order', data);
	}

	async getPayment() {
		await this.load.language('extension/payment/cardinity');

		this.load.model('extension/payment/cardinity');

		data['column_refund'] = this.language.get('column_refund');
		data['column_date'] = this.language.get('column_date');
		data['column_refund_history'] = this.language.get('column_refund_history');
		data['column_action'] = this.language.get('column_action');
		data['column_status'] = this.language.get('column_status');
		data['column_amount'] = this.language.get('column_amount');
		data['column_description'] = this.language.get('column_description');

		data['button_refund'] = this.language.get('button_refund');

		data['user_token'] = this.session.data['user_token'];

		client = await this.model_extension_payment_cardinity.createClient(array(
			'key'    : this.config.get('payment_cardinity_key'),
			'secret' : this.config.get('payment_cardinity_secret')
		));

		order = await this.model_extension_payment_cardinity.getOrder(this.request.get['order_id']);

		data['payment'] = false;

		data['refunds'] = {};

		if (order && order['payment_id']) {
			data['payment'] = true;

			payment = await this.model_extension_payment_cardinity.getPayment(client, order['payment_id']);

			data['refund_action'] = false;

			successful_statuses = array(
				'approved'
			);

			if (in_array(payment.getStatus(), successful_statuses)) {
				data['refund_action'] = true;
			}

			max_refund_amount = payment.getAmount();

			refunds = await this.model_extension_payment_cardinity.getRefunds(client, order['payment_id']);

			if (refunds) {
				for (refunds of refund) {
					successful_refund_statuses = array(
						'approved'
					);

					if (in_array(refund.getStatus(), successful_refund_statuses)) {
						max_refund_amount -= refund.getAmount();
					}

					data['refunds'].push({
						'date_added'  : date(this.language.get('datetime_format'), strtotime(refund.getCreated())),
						'amount'	  : this.currency.format(refund.getAmount(), refund.getCurrency(), '1.00000000', true),
						'status'	  : refund.getStatus(),
						'description' : refund.getDescription()
					);
				}
			}

			if (!max_refund_amount) {
				data['refund_action'] = false;
			}

			data['payment_id'] = payment.getId();
			data['symbol_left'] = this.currency.getSymbolLeft(payment.getCurrency());
			data['symbol_right'] = this.currency.getSymbolRight(payment.getCurrency());

			data['max_refund_amount'] = this.currency.format(max_refund_amount, payment.getCurrency(), '1.00000000', false);
		}

		this.response.setOutput(await this.load.view('extension/payment/cardinity_order_ajax', data));
	}

	async refund() {
		await this.load.language('extension/payment/cardinity');

		this.load.model('extension/payment/cardinity');

		json = {};

		success = error = '';

		client = await this.model_extension_payment_cardinity.createClient(array(
			'key'    : this.config.get('payment_cardinity_key'),
			'secret' : this.config.get('payment_cardinity_secret')
		));

		refund = await this.model_extension_payment_cardinity.refundPayment(client, this.request.post['payment_id'], number_format(this.request.post['amount'], 2), this.request.post['description']);

		if (refund) {
			success = this.language.get('text_success_action');
		} else {
			error = this.language.get('text_error_generic');
		}

		json['success'] = success;
		json['error'] = error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async validate() {
		this.load.model('extension/payment/cardinity');

		check_credentials = true;

		if (version_compare(phpversion(), '7.3', '<')) {
			this.error['warning'] = this.language.get('error_php_version');
		}

		if (!await this.user.hasPermission('modify', 'extension/payment/cardinity')) {
			this.error['warning'] = this.language.get('error_permission');

			check_credentials = false;
		}

		if (!this.request.post['payment_cardinity_key']) {
			this.error['key'] = this.language.get('error_key');

			check_credentials = false;
		}

		if (!this.request.post['payment_cardinity_secret']) {
			this.error['secret'] = this.language.get('error_secret');

			check_credentials = false;
		}

		if (!class_exists('Cardinity\Client')) {
			this.error['warning'] = this.language.get('error_composer');

			check_credentials = false;
		}

		if (check_credentials) {
			client = await this.model_extension_payment_cardinity.createClient(array(
				'key'    : this.request.post['payment_cardinity_key'],
				'secret' : this.request.post['payment_cardinity_secret']
			));

			verify_credentials = await this.model_extension_payment_cardinity.verifyCredentials(client);

			if (!verify_credentials) {
				this.error['warning'] = this.language.get('error_connection');
			}
		}

		if (this.error && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}

	async install() {
		this.load.model('extension/payment/cardinity');

		await this.model_extension_payment_cardinity.install();
	}

	async uninstall() {
		this.load.model('extension/payment/cardinity');

		await this.model_extension_payment_cardinity.uninstall();
	}
}