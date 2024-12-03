module.exports = class ControllerExtensionPaymentEway extends Controller {

	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/payment/eway');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && (this.validate())) {
			await this.model_setting_setting.editSetting('payment_eway', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true));
		}

		this.load.model('localisation/geo_zone', this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['username'])) {
			data['error_username'] = this.error['username'];
		} else {
			data['error_username'] = '';
		}

		if ((this.error['password'])) {
			data['error_password'] = this.error['password'];
		} else {
			data['error_password'] = '';
		}

		if ((this.error['payment_type'])) {
			data['error_payment_type'] = this.error['payment_type'];
		} else {
			data['error_payment_type'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/payment/eway', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/eway', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true);

		if ((this.request.post['payment_eway_payment_gateway'])) {
			data['payment_eway_payment_gateway'] = this.request.post['payment_eway_payment_gateway'];
		} else {
			data['payment_eway_payment_gateway'] = this.config.get('payment_eway_payment_gateway');
		}

		if ((this.request.post['payment_eway_paymode'])) {
			data['payment_eway_paymode'] = this.request.post['payment_eway_paymode'];
		} else {
			data['payment_eway_paymode'] = this.config.get('payment_eway_paymode');
		}

		if ((this.request.post['payment_eway_test'])) {
			data['payment_eway_test'] = this.request.post['payment_eway_test'];
		} else {
			data['payment_eway_test'] = this.config.get('payment_eway_test');
		}

		if ((this.request.post['payment_eway_payment_type'])) {
			data['payment_eway_payment_type'] = this.request.post['payment_eway_payment_type'];
		} else {
			data['payment_eway_payment_type'] = this.config.get('payment_eway_payment_type');
		}

		if ((this.request.post['payment_eway_transaction'])) {
			data['payment_eway_transaction'] = this.request.post['payment_eway_transaction'];
		} else {
			data['payment_eway_transaction'] = this.config.get('payment_eway_transaction');
		}

		if ((this.request.post['payment_eway_standard_geo_zone_id'])) {
			data['payment_eway_standard_geo_zone_id'] = this.request.post['payment_eway_standard_geo_zone_id'];
		} else {
			data['payment_eway_standard_geo_zone_id'] = this.config.get('payment_eway_standard_geo_zone_id');
		}

		if ((this.request.post['payment_eway_order_status_id'])) {
			data['payment_eway_order_status_id'] = this.request.post['payment_eway_order_status_id'];
		} else {
			data['payment_eway_order_status_id'] = this.config.get('payment_eway_order_status_id');
		}

		if ((this.request.post['payment_eway_order_status_refunded_id'])) {
			data['payment_eway_order_status_refunded_id'] = this.request.post['payment_eway_order_status_refunded_id'];
		} else {
			data['payment_eway_order_status_refunded_id'] = this.config.get('payment_eway_order_status_refunded_id');
		}

		if ((this.request.post['payment_eway_order_status_auth_id'])) {
			data['payment_eway_order_status_auth_id'] = this.request.post['payment_eway_order_status_auth_id'];
		} else {
			data['payment_eway_order_status_auth_id'] = this.config.get('payment_eway_order_status_auth_id');
		}

		if ((this.request.post['payment_eway_order_status_fraud_id'])) {
			data['payment_eway_order_status_fraud_id'] = this.request.post['payment_eway_order_status_fraud_id'];
		} else {
			data['payment_eway_order_status_fraud_id'] = this.config.get('payment_eway_order_status_fraud_id');
		}

		if ((this.request.post['payment_eway_transaction_method'])) {
			data['payment_eway_transaction_method'] = this.request.post['payment_eway_transaction_method'];
		} else {
			data['payment_eway_transaction_method'] = this.config.get('payment_eway_transaction_method');
		}

		if ((this.request.post['payment_eway_username'])) {
			data['payment_eway_username'] = this.request.post['payment_eway_username'];
		} else {
			data['payment_eway_username'] = this.config.get('payment_eway_username');
		}

		if ((this.request.post['payment_eway_password'])) {
			data['payment_eway_password'] = this.request.post['payment_eway_password'];
		} else {
			data['payment_eway_password'] = this.config.get('payment_eway_password');
		}

		if ((this.request.post['payment_eway_status'])) {
			data['payment_eway_status'] = this.request.post['payment_eway_status'];
		} else {
			data['payment_eway_status'] = this.config.get('payment_eway_status');
		}

		if ((this.request.post['payment_eway_sort_order'])) {
			data['payment_eway_sort_order'] = this.request.post['payment_eway_sort_order'];
		} else {
			data['payment_eway_sort_order'] = this.config.get('payment_eway_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/eway', data));
	}

	async install() {
		this.load.model('extension/payment/eway', this);
		await this.model_extension_payment_eway.install();
	}

	async uninstall() {
		this.load.model('extension/payment/eway', this);
		await this.model_extension_payment_eway.uninstall();
	}

	// Legacy 2.0.0
	async orderAction() {
		return this.order();
	}

	// Legacy 2.0.3
	async action() {
		return this.order();
	}

	async order() {
		const data = {};
		if (Number(this.config.get('payment_eway_status'))) {
			this.load.model('extension/payment/eway', this);

			const eway_order = await this.model_extension_payment_eway.getOrder(this.request.get['order_id']);

			if ((eway_order.eway_order_id)) {
				await this.load.language('extension/payment/eway');

				eway_order['total'] = eway_order['amount'];
				eway_order['total_formatted'] = this.currency.format(eway_order['amount'], eway_order['currency_code'], 1, true);

				eway_order['total_captured'] = await this.model_extension_payment_eway.getTotalCaptured(eway_order['eway_order_id']);
				eway_order['total_captured_formatted'] = this.currency.format(eway_order['total_captured'], eway_order['currency_code'], 1, true);

				eway_order['uncaptured'] = eway_order['total'] - eway_order['total_captured'];

				eway_order['total_refunded'] = await this.model_extension_payment_eway.getTotalRefunded(eway_order['eway_order_id']);
				eway_order['total_refunded_formatted'] = this.currency.format(eway_order['total_refunded'], eway_order['currency_code'], 1, true);

				eway_order['unrefunded'] = eway_order['total_captured'] - eway_order['total_refunded'];

				data['text_payment_info'] = this.language.get('text_payment_info');
				data['text_order_total'] = this.language.get('text_order_total');
				data['text_void_status'] = this.language.get('text_void_status');
				data['text_transactions'] = this.language.get('text_transactions');
				data['text_column_amount'] = this.language.get('text_column_amount');
				data['text_column_type'] = this.language.get('text_column_type');
				data['text_column_created'] = this.language.get('text_column_created');
				data['text_column_transactionid'] = this.language.get('text_column_transactionid');
				data['btn_refund'] = this.language.get('btn_refund');
				data['btn_capture'] = this.language.get('btn_capture');
				data['text_confirm_refund'] = this.language.get('text_confirm_refund');
				data['text_confirm_capture'] = this.language.get('text_confirm_capture');

				data['text_total_captured'] = this.language.get('text_total_captured');
				data['text_total_refunded'] = this.language.get('text_total_refunded');
				data['text_capture_status'] = this.language.get('text_capture_status');
				data['text_refund_status'] = this.language.get('text_refund_status');

				data['text_empty_refund'] = this.language.get('text_empty_refund');
				data['text_empty_capture'] = this.language.get('text_empty_capture');

				data['eway_order'] = eway_order;
				data['user_token'] = this.session.data['user_token'];
				data['order_id'] = this.request.get['order_id'];

				return await this.load.view('extension/payment/eway_order', data);
			}
		}
	}

	async refund() {
		await this.load.language('extension/payment/eway');

		const order_id = this.request.post['order_id'];
		const refund_amount = this.request.post['refund_amount'];

		if (order_id && refund_amount > 0) {
			this.load.model('extension/payment/eway', this);
			const result = await this.model_extension_payment_eway.refund(order_id, refund_amount);

			// Check if any error returns
			if ((result.Errors) || result === false) {
				json['error'] = true;
				let reason = '';
				if (result === false) {
					reason = this.language.get('text_unknown_failure');
				} else {
					const errors = result.Errors.split(',');
					for (let error of errors) {
						reason += this.language.get('text_card_message_' + result.Errors);
					}
				}
				json['message'] = this.language.get('text_refund_failed') + reason;
			} else {
				const eway_order = await this.model_extension_payment_eway.getOrder(order_id);
				await this.model_extension_payment_eway.addTransaction(eway_order['eway_order_id'], result.Refund.TransactionID, 'refund', result.Refund.TotalAmount / 100, eway_order['currency_code']);

				const total_captured = await this.model_extension_payment_eway.getTotalCaptured(eway_order['eway_order_id']);
				const total_refunded = await this.model_extension_payment_eway.getTotalRefunded(eway_order['eway_order_id']);
				let refund_status = 0;

				if (total_captured == total_refunded) {
					refund_status = 1;
					await this.model_extension_payment_eway.updateRefundStatus(eway_order['eway_order_id'], refund_status);
				}

				json['data'] = {};
				json['data']['transactionid'] = result.TransactionID;
				json['data']['created'] = date("Y-m-d H:i:s");
				json['data']['amount'] = refund_amount.toFixed(2);
				json['data']['total_refunded_formatted'] = this.currency.format(total_refunded, eway_order['currency_code'], 1, true);
				json['data']['refund_status'] = refund_status;
				json['data']['remaining'] = total_captured - total_refunded;
				json['message'] = this.language.get('text_refund_success');
				json['error'] = false;
			}
		} else {
			json['error'] = true;
			json['message'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async capture() {
		await this.load.language('extension/payment/eway');

		const order_id = this.request.post['order_id'];
		const capture_amount = this.request.post['capture_amount'];

		if (order_id && capture_amount > 0) {
			this.load.model('extension/payment/eway', this);
			const eway_order = await this.model_extension_payment_eway.getOrder(order_id);
			const result = await this.model_extension_payment_eway.capture(order_id, capture_amount, eway_order['currency_code']);

			// Check if any error returns
			if ((result.Errors) || result === false) {
				json['error'] = true;
				let reason = '';
				if (result === false) {
					reason = this.language.get('text_unknown_failure');
				} else {
					const errors = result.Errors.split(',');
					for (let error of errors) {
						reason += this.language.get('text_card_message_' + result.Errors);
					}
				}
				json['message'] = this.language.get('text_capture_failed') + reason;
			} else {
				await this.model_extension_payment_eway.addTransaction(eway_order['eway_order_id'], result.TransactionID, 'payment', capture_amount, eway_order['currency_code']);

				const total_captured = await this.model_extension_payment_eway.getTotalCaptured(eway_order['eway_order_id']);
				const total_refunded = await this.model_extension_payment_eway.getTotalRefunded(eway_order['eway_order_id']);

				let remaining = eway_order['amount'] - capture_amount;
				if (remaining <= 0) {
					remaining = 0;
				}

				await this.model_extension_payment_eway.updateCaptureStatus(eway_order['eway_order_id'], 1);
				await this.model_extension_payment_eway.updateTransactionId(eway_order['eway_order_id'], result.TransactionID);

				json['data'] = {};
				json['data']['transactionid'] = result.TransactionID;
				json['data']['created'] = date("Y-m-d H:i:s");
				json['data']['amount'] = number_format(capture_amount, 2, '.', '');
				json['data']['total_captured_formatted'] = this.currency.format(total_captured, eway_order['currency_code'], 1, true);
				json['data']['capture_status'] = 1;
				json['data']['remaining'] = remaining;
				json['message'] = this.language.get('text_capture_success');
				json['error'] = false;
			}
		} else {
			json['error'] = true;
			json['message'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/eway')) {
			this.error['warning'] = this.language.get('error_permission');
		}
		if (!this.request.post['payment_eway_username']) {
			this.error['username'] = this.language.get('error_username');
		}
		if (!this.request.post['payment_eway_password']) {
			this.error['password'] = this.language.get('error_password');
		}
		if (!(this.request.post['payment_eway_payment_type'])) {
			this.error['payment_type'] = this.language.get('error_payment_type');
		}

		return Object.keys(this.error).length ? false : true
	}

}
