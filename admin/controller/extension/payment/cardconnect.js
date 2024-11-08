module.exports = class ControllerExtensionPaymentCardConnect extends Controller {
	error = {};

	async index() {
		this.load.model('setting/setting',this);

		this.load.model('extension/payment/cardconnect');

		await this.load.language('extension/payment/cardconnect');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_cardconnect', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
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
			'href' : await this.url.link('extension/payment/cardconnect', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/cardconnect', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_cardconnect_merchant_id'])) {
			data['payment_cardconnect_merchant_id'] = this.request.post['payment_cardconnect_merchant_id'];
		} else {
			data['payment_cardconnect_merchant_id'] = this.config.get('payment_cardconnect_merchant_id');
		}

		if ((this.request.post['cardconnect_api_username'])) {
			data['cardconnect_api_username'] = this.request.post['cardconnect_api_username'];
		} else {
			data['cardconnect_api_username'] = this.config.get('cardconnect_api_username');
		}

		if ((this.request.post['cardconnect_api_password'])) {
			data['cardconnect_api_password'] = this.request.post['cardconnect_api_password'];
		} else {
			data['cardconnect_api_password'] = this.config.get('cardconnect_api_password');
		}

		if ((this.request.post['cardconnect_token'])) {
			data['cardconnect_token'] = this.request.post['cardconnect_token'];
		} else if (this.config.has('cardconnect_token')) {
			data['cardconnect_token'] = this.config.get('cardconnect_token');
		} else {
			data['cardconnect_token'] = md5(time());
		}

		if ((this.request.post['cardconnect_transaction'])) {
			data['cardconnect_transaction'] = this.request.post['cardconnect_transaction'];
		} else {
			data['cardconnect_transaction'] = this.config.get('cardconnect_transaction');
		}

		if ((this.request.post['cardconnect_site'])) {
			data['cardconnect_site'] = this.request.post['cardconnect_site'];
		} else if (this.config.has('cardconnect_site')) {
			data['cardconnect_site'] = this.config.get('cardconnect_site');
		} else {
			data['cardconnect_site'] = 'fts';
		}

		if ((this.request.post['cardconnect_environment'])) {
			data['cardconnect_environment'] = this.request.post['cardconnect_environment'];
		} else {
			data['cardconnect_environment'] = this.config.get('cardconnect_environment');
		}

		if ((this.request.post['cardconnect_store_cards'])) {
			data['cardconnect_store_cards'] = this.request.post['cardconnect_store_cards'];
		} else {
			data['cardconnect_store_cards'] = this.config.get('cardconnect_store_cards');
		}

		if ((this.request.post['cardconnect_echeck'])) {
			data['cardconnect_echeck'] = this.request.post['cardconnect_echeck'];
		} else {
			data['cardconnect_echeck'] = this.config.get('cardconnect_echeck');
		}

		if ((this.request.post['cardconnect_total'])) {
			data['cardconnect_total'] = this.request.post['cardconnect_total'];
		} else {
			data['cardconnect_total'] = this.config.get('cardconnect_total');
		}

		if ((this.request.post['cardconnect_geo_zone'])) {
			data['cardconnect_geo_zone'] = this.request.post['cardconnect_geo_zone'];
		} else {
			data['cardconnect_geo_zone'] = this.config.get('cardconnect_geo_zone');
		}

		if ((this.request.post['cardconnect_status'])) {
			data['cardconnect_status'] = this.request.post['cardconnect_status'];
		} else {
			data['cardconnect_status'] = this.config.get('cardconnect_status');
		}

		if ((this.request.post['cardconnect_logging'])) {
			data['cardconnect_logging'] = this.request.post['cardconnect_logging'];
		} else {
			data['cardconnect_logging'] = this.config.get('cardconnect_logging');
		}

		if ((this.request.post['cardconnect_sort_order'])) {
			data['cardconnect_sort_order'] = this.request.post['cardconnect_sort_order'];
		} else {
			data['cardconnect_sort_order'] = this.config.get('cardconnect_sort_order');
		}

		data['cardconnect_cron_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/cardconnect/cron&token=' + data['cardconnect_token'];

		if (this.config.get('cardconnect_cron_time')) {
			data['cardconnect_cron_time'] = date(this.language.get('datetime_format'), strtotime(this.config.get('cardconnect_cron_time')));
		} else {
			data['cardconnect_cron_time'] = this.language.get('text_no_cron_time');
		}

		if ((this.request.post['cardconnect_order_status_id_pending'])) {
			data['cardconnect_order_status_id_pending'] = this.request.post['cardconnect_order_status_id_pending'];
		} else if (this.config.has('cardconnect_order_status_id_pending')) {
			data['cardconnect_order_status_id_pending'] = this.config.get('cardconnect_order_status_id_pending');
		} else {
			data['cardconnect_order_status_id_pending'] = '1';
		}

		if ((this.request.post['cardconnect_order_status_id_processing'])) {
			data['cardconnect_order_status_id_processing'] = this.request.post['cardconnect_order_status_id_processing'];
		} else if (this.config.has('cardconnect_order_status_id_processing')) {
			data['cardconnect_order_status_id_processing'] = this.config.get('cardconnect_order_status_id_processing');
		} else {
			data['cardconnect_order_status_id_processing'] = '2';
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.error['payment_cardconnect_merchant_id'])) {
			data['error_payment_cardconnect_merchant_id'] = this.error['payment_cardconnect_merchant_id'];
		} else {
			data['error_payment_cardconnect_merchant_id'] = '';
		}

		if ((this.error['cardconnect_api_username'])) {
			data['error_cardconnect_api_username'] = this.error['cardconnect_api_username'];
		} else {
			data['error_cardconnect_api_username'] = '';
		}

		if ((this.error['cardconnect_api_password'])) {
			data['error_cardconnect_api_password'] = this.error['cardconnect_api_password'];
		} else {
			data['error_cardconnect_api_password'] = '';
		}

		if ((this.error['cardconnect_token'])) {
			data['error_cardconnect_token'] = this.error['cardconnect_token'];
		} else {
			data['error_cardconnect_token'] = '';
		}

		if ((this.error['cardconnect_site'])) {
			data['error_cardconnect_site'] = this.error['cardconnect_site'];
		} else {
			data['error_cardconnect_site'] = '';
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/cardconnect', data));
	}

	async install() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/cardconnect');

			await this.model_extension_payment_cardconnect.install();
		}
	}

	async uninstall() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/cardconnect');

			await this.model_extension_payment_cardconnect.uninstall();
		}
	}

	async order() {
		if (this.config.get('cardconnect_status')) {
			this.load.model('extension/payment/cardconnect');

			order_id = this.request.get['order_id'];

			cardconnect_order = await this.model_extension_payment_cardconnect.getOrder(this.request.get['order_id']);

			if (cardconnect_order) {
				await this.load.language('extension/payment/cardconnect');

				if (cardconnect_order['payment_method'] == 'card') {
					cardconnect_order['payment_method'] = this.language.get('text_card');
				} else {
					cardconnect_order['payment_method'] = this.language.get('text_echeck');
				}

				cardconnect_order['total_formatted'] = this.currency.format(cardconnect_order['total'], cardconnect_order['currency_code'], false, true);

				cardconnect_order['total_captured'] = await this.model_extension_payment_cardconnect.getTotalCaptured(cardconnect_order['cardconnect_order_id']);

				cardconnect_order['total_captured_formatted'] = this.currency.format(cardconnect_order['total_captured'], cardconnect_order['currency_code'], false, true);

				for(cardconnect_order['transactions'] of &transaction) {
					switch (transaction['type']) {
						case 'payment':
							transaction['type'] = 'Payment';
							break;
						case 'auth':
							transaction['type'] = 'Authorize';
							break;
						case 'refund':
							transaction['type'] = 'Refund';
							break;
						case 'void':
							transaction['type'] = 'Void';
							break;
						default:
							transaction['type'] = 'Payment';
					}

					transaction['amount'] = this.currency.format(transaction['amount'], cardconnect_order['currency_code'], false, true);

					if (transaction['status'] == 'Y') {
						transaction['status'] = 'Accepted';
					} else if (transaction['status'] == 'N') {
						transaction['status'] = 'Rejected';
					}

					transaction['date_modified'] = date(this.language.get('datetime_format'), strtotime(transaction['date_modified']));

					transaction['date_added'] = date(this.language.get('datetime_format'), strtotime(transaction['date_added']));
				}

				data['cardconnect_order'] = cardconnect_order;

				data['order_id'] = this.request.get['order_id'];

				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/cardconnect_order', data);
			}
		}
	}

	async inquire() {
		await this.load.language('extension/payment/cardconnect');

		json = {};

		if (this.config.get('cardconnect_status')) {
			if ((this.request.post['order_id']) && (this.request.post['retref'])) {
				this.load.model('extension/payment/cardconnect');

				cardconnect_order = await this.model_extension_payment_cardconnect.getOrder(this.request.post['order_id']);

				if (cardconnect_order) {
					inquire_response = await this.model_extension_payment_cardconnect.inquire(cardconnect_order, this.request.post['retref']);

					if ((inquire_response['respstat']) && inquire_response['respstat'] == 'C') {
						json['error'] = inquire_response['resptext'];
					} else {
						await this.model_extension_payment_cardconnect.updateTransactionStatusByRetref(this.request.post['retref'], inquire_response['setlstat']);

						json['status'] = inquire_response['setlstat'];

						json['date_modified'] = date(this.language.get('datetime_format'));

						json['success'] = this.language.get('text_inquire_success');
					}
				} else {
					json['error'] = this.language.get('error_no_order');
				}
			} else {
				json['error'] = this.language.get('error_data_missing');
			}
		} else {
			json['error'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async capture() {
		await this.load.language('extension/payment/cardconnect');

		json = {};

		if (this.config.get('cardconnect_status')) {
			if ((this.request.post['order_id']) && (this.request.post['amount'])) {
				if (this.request.post['amount'] > 0) {
					this.load.model('extension/payment/cardconnect');

					cardconnect_order = await this.model_extension_payment_cardconnect.getOrder(this.request.post['order_id']);

					if (cardconnect_order) {
						capture_response = await this.model_extension_payment_cardconnect.capture(cardconnect_order, this.request.post['amount']);

						if (!(capture_response['retref'])) {
							json['error'] = this.language.get('error_invalid_response');
						} else if ((capture_response['respstat']) && capture_response['respstat'] == 'C') {
							json['error'] = capture_response['resptext'];
						} else {
							await this.model_extension_payment_cardconnect.addTransaction(cardconnect_order['cardconnect_order_id'], 'payment', capture_response['retref'], this.request.post['amount'], capture_response['setlstat']);

							total_captured = await this.model_extension_payment_cardconnect.getTotalCaptured(cardconnect_order['cardconnect_order_id']);

							json['retref'] = capture_response['retref'];
							json['amount'] = this.currency.format(this.request.post['amount'], cardconnect_order['currency_code'], false, true);
							json['status'] = capture_response['setlstat'];
							json['date_modified'] = date(this.language.get('datetime_format'));
							json['date_added'] = date(this.language.get('datetime_format'));
							json['total_captured'] = this.currency.format(total_captured, cardconnect_order['currency_code'], false, true);

							json['success'] = this.language.get('text_capture_success');
						}
					} else {
						json['error'] = this.language.get('error_no_order');
					}
				} else {
					json['error'] = this.language.get('error_amount_zero');
				}
			} else {
				json['error'] = this.language.get('error_data_missing');
			}
		} else {
			json['error'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async refund() {
		await this.load.language('extension/payment/cardconnect');

		json = {};

		if (this.config.get('cardconnect_status')) {
			if ((this.request.post['order_id']) && (this.request.post['amount'])) {
				if (this.request.post['amount'] > 0) {
					this.load.model('extension/payment/cardconnect');

					cardconnect_order = await this.model_extension_payment_cardconnect.getOrder(this.request.post['order_id']);

					if (cardconnect_order) {
						refund_response = await this.model_extension_payment_cardconnect.refund(cardconnect_order, this.request.post['amount']);

						if (!(refund_response['retref'])) {
							json['error'] = this.language.get('error_invalid_response');
						} else if ((refund_response['respstat']) && refund_response['respstat'] == 'C') {
							json['error'] = refund_response['resptext'];
						} else {
							await this.model_extension_payment_cardconnect.addTransaction(cardconnect_order['cardconnect_order_id'], 'refund', refund_response['retref'], this.request.post['amount'] * -1, refund_response['resptext']);

							total_captured = await this.model_extension_payment_cardconnect.getTotalCaptured(cardconnect_order['cardconnect_order_id']);

							json['retref'] = refund_response['retref'];
							json['amount'] = this.currency.format(this.request.post['amount'] * -1, cardconnect_order['currency_code'], false, true);
							json['status'] = refund_response['resptext'];
							json['date_modified'] = date(this.language.get('datetime_format'));
							json['date_added'] = date(this.language.get('datetime_format'));
							json['total_captured'] = this.currency.format(total_captured, cardconnect_order['currency_code'], false, true);

							json['success'] = this.language.get('text_refund_success');
						}
					} else {
						json['error'] = this.language.get('error_no_order');
					}
				} else {
					json['error'] = this.language.get('error_amount_zero');
				}
			} else {
				json['error'] = this.language.get('error_data_missing');
			}
		} else {
			json['error'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async void() {
		await this.load.language('extension/payment/cardconnect');

		json = {};

		if (this.config.get('cardconnect_status')) {
			if ((this.request.post['order_id']) && (this.request.post['retref'])) {
				this.load.model('extension/payment/cardconnect');

				cardconnect_order = await this.model_extension_payment_cardconnect.getOrder(this.request.post['order_id']);

				if (cardconnect_order) {
					void_response = await this.model_extension_payment_cardconnect.void(cardconnect_order, this.request.post['retref']);

					if (!(void_response['authcode']) || void_response['authcode'] != 'REVERS') {
						json['error'] = void_response['resptext'];
					} else {
						json['retref'] = void_response['retref'];
						json['amount'] = this.currency.format(0.00, cardconnect_order['currency_code'], false, true);
						json['status'] = void_response['resptext'];
						json['date_modified'] = date(this.language.get('datetime_format'));
						json['date_added'] = date(this.language.get('datetime_format'));
						json['success'] = this.language.get('text_void_success');
					}
				} else {
					json['error'] = this.language.get('error_no_order');
				}
			} else {
				json['error'] = this.language.get('error_data_missing');
			}
		} else {
			json['error'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/cardconnect')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_cardconnect_merchant_id']) {
			this.error['payment_cardconnect_merchant_id'] = this.language.get('error_merchant_id');
		}

		if (!this.request.post['cardconnect_api_username']) {
			this.error['cardconnect_api_username'] = this.language.get('error_api_username');
		}

		if (!this.request.post['cardconnect_api_password']) {
			this.error['cardconnect_api_password'] = this.language.get('error_api_password');
		}

		if (!this.request.post['cardconnect_token']) {
			this.error['cardconnect_token'] = this.language.get('error_token');
		}

		if (!this.request.post['cardconnect_site']) {
			this.error['cardconnect_site'] = this.language.get('error_site');
		}

		return Object.keys(this.error).length?false:true
	}
}