module.exports = class ControllerExtensionPaymentFirstdataRemote extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/firstdata_remote');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_firstdata_remote', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['error_merchant_id'])) {
			data['error_merchant_id'] = this.error['error_merchant_id'];
		} else {
			data['error_merchant_id'] = '';
		}

		if ((this.error['error_user_id'])) {
			data['error_user_id'] = this.error['error_user_id'];
		} else {
			data['error_user_id'] = '';
		}

		if ((this.error['error_password'])) {
			data['error_password'] = this.error['error_password'];
		} else {
			data['error_password'] = '';
		}

		if ((this.error['error_certificate'])) {
			data['error_certificate'] = this.error['error_certificate'];
		} else {
			data['error_certificate'] = '';
		}

		if ((this.error['error_key'])) {
			data['error_key'] = this.error['error_key'];
		} else {
			data['error_key'] = '';
		}

		if ((this.error['error_key_pw'])) {
			data['error_key_pw'] = this.error['error_key_pw'];
		} else {
			data['error_key_pw'] = '';
		}

		if ((this.error['error_ca'])) {
			data['error_ca'] = this.error['error_ca'];
		} else {
			data['error_ca'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/firstdata_remote', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		);

		data['action'] = await this.url.link('extension/payment/firstdata_remote', 'user_token=' + this.session.data['user_token'], true);
		
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['firstdata_remote_merchant_id'])) {
			data['firstdata_remote_merchant_id'] = this.request.post['firstdata_remote_merchant_id'];
		} else {
			data['firstdata_remote_merchant_id'] = this.config.get('firstdata_remote_merchant_id');
		}

		if ((this.request.post['firstdata_remote_user_id'])) {
			data['firstdata_remote_user_id'] = this.request.post['firstdata_remote_user_id'];
		} else {
			data['firstdata_remote_user_id'] = this.config.get('firstdata_remote_user_id');
		}

		if ((this.request.post['firstdata_remote_password'])) {
			data['firstdata_remote_password'] = this.request.post['firstdata_remote_password'];
		} else {
			data['firstdata_remote_password'] = this.config.get('firstdata_remote_password');
		}

		if ((this.request.post['firstdata_remote_certificate'])) {
			data['firstdata_remote_certificate'] = this.request.post['firstdata_remote_certificate'];
		} else {
			data['firstdata_remote_certificate'] = this.config.get('firstdata_remote_certificate');
		}

		if ((this.request.post['firstdata_remote_key'])) {
			data['firstdata_remote_key'] = this.request.post['firstdata_remote_key'];
		} else {
			data['firstdata_remote_key'] = this.config.get('firstdata_remote_key');
		}

		if ((this.request.post['firstdata_remote_key_pw'])) {
			data['firstdata_remote_key_pw'] = this.request.post['firstdata_remote_key_pw'];
		} else {
			data['firstdata_remote_key_pw'] = this.config.get('firstdata_remote_key_pw');
		}

		if ((this.request.post['firstdata_remote_ca'])) {
			data['firstdata_remote_ca'] = this.request.post['firstdata_remote_ca'];
		} else {
			data['firstdata_remote_ca'] = this.config.get('firstdata_remote_ca');
		}

		if ((this.request.post['firstdata_remote_geo_zone_id'])) {
			data['firstdata_remote_geo_zone_id'] = this.request.post['firstdata_remote_geo_zone_id'];
		} else {
			data['firstdata_remote_geo_zone_id'] = this.config.get('firstdata_remote_geo_zone_id');
		}

		if ((this.request.post['firstdata_remote_total'])) {
			data['firstdata_remote_total'] = this.request.post['firstdata_remote_total'];
		} else {
			data['firstdata_remote_total'] = this.config.get('firstdata_remote_total');
		}

		if ((this.request.post['firstdata_remote_sort_order'])) {
			data['firstdata_remote_sort_order'] = this.request.post['firstdata_remote_sort_order'];
		} else {
			data['firstdata_remote_sort_order'] = this.config.get('firstdata_remote_sort_order');
		}

		if ((this.request.post['firstdata_remote_status'])) {
			data['firstdata_remote_status'] = this.request.post['firstdata_remote_status'];
		} else {
			data['firstdata_remote_status'] = this.config.get('firstdata_remote_status');
		}

		if ((this.request.post['firstdata_remote_debug'])) {
			data['firstdata_remote_debug'] = this.request.post['firstdata_remote_debug'];
		} else {
			data['firstdata_remote_debug'] = this.config.get('firstdata_remote_debug');
		}
		if ((this.request.post['firstdata_remote_auto_settle'])) {
			data['firstdata_remote_auto_settle'] = this.request.post['firstdata_remote_auto_settle'];
		} else if (!(this.request.post['payment_firstdata_auto_settle']) && this.config.get('firstdata_remote_auto_settle') != '') {
			data['firstdata_remote_auto_settle'] = this.config.get('firstdata_remote_auto_settle');
		} else {
			data['firstdata_remote_auto_settle'] = 1;
		}

		if ((this.request.post['firstdata_remote_3d'])) {
			data['firstdata_remote_3d'] = this.request.post['firstdata_remote_3d'];
		} else {
			data['firstdata_remote_3d'] = this.config.get('firstdata_remote_3d');
		}

		if ((this.request.post['firstdata_remote_liability'])) {
			data['firstdata_remote_liability'] = this.request.post['firstdata_remote_liability'];
		} else {
			data['firstdata_remote_liability'] = this.config.get('firstdata_remote_liability');
		}

		if ((this.request.post['firstdata_remote_order_status_success_settled_id'])) {
			data['firstdata_remote_order_status_success_settled_id'] = this.request.post['firstdata_remote_order_status_success_settled_id'];
		} else {
			data['firstdata_remote_order_status_success_settled_id'] = this.config.get('firstdata_remote_order_status_success_settled_id');
		}

		if ((this.request.post['firstdata_remote_order_status_success_unsettled_id'])) {
			data['firstdata_remote_order_status_success_unsettled_id'] = this.request.post['firstdata_remote_order_status_success_unsettled_id'];
		} else {
			data['firstdata_remote_order_status_success_unsettled_id'] = this.config.get('firstdata_remote_order_status_success_unsettled_id');
		}

		if ((this.request.post['firstdata_remote_order_status_decline_id'])) {
			data['firstdata_remote_order_status_decline_id'] = this.request.post['firstdata_remote_order_status_decline_id'];
		} else {
			data['firstdata_remote_order_status_decline_id'] = this.config.get('firstdata_remote_order_status_decline_id');
		}

		if ((this.request.post['firstdata_remote_order_status_void_id'])) {
			data['firstdata_remote_order_status_void_id'] = this.request.post['firstdata_remote_order_status_void_id'];
		} else {
			data['firstdata_remote_order_status_void_id'] = this.config.get('firstdata_remote_order_status_void_id');
		}

		if ((this.request.post['firstdata_remote_order_status_refunded_id'])) {
			data['firstdata_remote_order_status_refunded_id'] = this.request.post['firstdata_remote_order_status_refunded_id'];
		} else {
			data['firstdata_remote_order_status_refunded_id'] = this.config.get('firstdata_remote_order_status_refunded_id');
		}

		if ((this.request.post['firstdata_remote_card_storage'])) {
			data['firstdata_remote_card_storage'] = this.request.post['firstdata_remote_card_storage'];
		} else {
			data['firstdata_remote_card_storage'] = this.config.get('firstdata_remote_card_storage');
		}

		data['cards'] = {};

		data['cards'].push({
			'text'  : this.language.get('text_mastercard'),
			'value' : 'mastercard'
		);

		data['cards'].push({
			'text'  : this.language.get('text_visa'),
			'value' : 'visa'
		);

		data['cards'].push({
			'text'  : this.language.get('text_diners'),
			'value' : 'diners'
		);

		data['cards'].push({
			'text'  : this.language.get('text_amex'),
			'value' : 'amex'
		);

		data['cards'].push({
			'text'  : this.language.get('text_maestro'),
			'value' : 'maestro'
		);

		if ((this.request.post['firstdata_remote_cards_accepted'])) {
			data['firstdata_remote_cards_accepted'] = this.request.post['firstdata_remote_cards_accepted'];
		} else if (this.config.get('firstdata_remote_cards_accepted')) {
			data['firstdata_remote_cards_accepted'] = this.config.get('firstdata_remote_cards_accepted');
		} else {
			data['firstdata_remote_cards_accepted'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/firstdata_remote', data));
	}

	async install() {
		this.load.model('extension/payment/firstdata_remote');
		await this.model_extension_payment_firstdata_remote.install();
	}

	async uninstall() {
		this.load.model('extension/payment/firstdata_remote');
		await this.model_extension_payment_firstdata_remote.uninstall();
	}

	async order() {
		if (this.config.get('firstdata_remote_status')) {
			this.load.model('extension/payment/firstdata_remote');

			firstdata_order = await this.model_extension_payment_firstdata_remote.getOrder(this.request.get['order_id']);

			if ((firstdata_order)) {
				await this.load.language('extension/payment/firstdata_remote');

				firstdata_order['total_captured'] = await this.model_extension_payment_firstdata_remote.getTotalCaptured(firstdata_order['firstdata_remote_order_id']);

				firstdata_order['total_formatted'] = this.currency.format(firstdata_order['total'], firstdata_order['currency_code'], 1, true);
				firstdata_order['total_captured_formatted'] = this.currency.format(firstdata_order['total_captured'], firstdata_order['currency_code'], 1, true);

				data['firstdata_order'] = firstdata_order;

				data['text_payment_info'] = this.language.get('text_payment_info');
				data['text_order_ref'] = this.language.get('text_order_ref');
				data['text_order_total'] = this.language.get('text_order_total');
				data['text_total_captured'] = this.language.get('text_total_captured');
				data['text_capture_status'] = this.language.get('text_capture_status');
				data['text_void_status'] = this.language.get('text_void_status');
				data['text_refund_status'] = this.language.get('text_refund_status');
				data['text_transactions'] = this.language.get('text_transactions');
				data['text_yes'] = this.language.get('text_yes');
				data['text_no'] = this.language.get('text_no');
				data['text_column_amount'] = this.language.get('text_column_amount');
				data['text_column_type'] = this.language.get('text_column_type');
				data['text_column_date_added'] = this.language.get('text_column_date_added');
				data['text_confirm_void'] = this.language.get('text_confirm_void');
				data['text_confirm_capture'] = this.language.get('text_confirm_capture');
				data['text_confirm_refund'] = this.language.get('text_confirm_refund');

				data['button_capture'] = this.language.get('button_capture');
				data['button_refund'] = this.language.get('button_refund');
				data['button_void'] = this.language.get('button_void');

				data['order_id'] = this.request.get['order_id'];
				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/firstdata_remote_order', data);
			}
		}
	}

	async void() {
		await this.load.language('extension/payment/firstdata_remote');

		json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '') {
			this.load.model('extension/payment/firstdata_remote');

			firstdata_order = await this.model_extension_payment_firstdata_remote.getOrder(this.request.post['order_id']);

			void_response = await this.model_extension_payment_firstdata_remote.void(firstdata_order['order_ref'], firstdata_order['tdate']);

			await this.model_extension_payment_firstdata_remote.logger('Void result:\r\n' + print_r(void_response, 1));

			if (strtoupper(void_response['transaction_result']) == 'APPROVED') {
				await this.model_extension_payment_firstdata_remote.addTransaction(firstdata_order['firstdata_remote_order_id'], 'void', 0.00);

				await this.model_extension_payment_firstdata_remote.updateVoidStatus(firstdata_order['firstdata_remote_order_id'], 1);

				json['msg'] = this.language.get('text_void_ok');
				json['data'] = {};
				json['data']['column_date_added'] = date('Y-m-d H:i:s');
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (void_response['error']) && (void_response['error']) ? void_response['error'] : 'Unable to void';
			}
		} else {
			json['error'] = true;
			json['msg'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async capture() {
		await this.load.language('extension/payment/firstdata');
		json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '') {
			this.load.model('extension/payment/firstdata_remote');

			firstdata_order = await this.model_extension_payment_firstdata_remote.getOrder(this.request.post['order_id']);

			capture_response = await this.model_extension_payment_firstdata_remote.capture(firstdata_order['order_ref'], firstdata_order['total'], firstdata_order['currency_code']);

			await this.model_extension_payment_firstdata_remote.logger('Settle result:\r\n' + print_r(capture_response, 1));

			if (strtoupper(capture_response['transaction_result']) == 'APPROVED') {
				await this.model_extension_payment_firstdata_remote.addTransaction(firstdata_order['firstdata_remote_order_id'], 'payment', firstdata_order['total']);
				total_captured = await this.model_extension_payment_firstdata_remote.getTotalCaptured(firstdata_order['firstdata_remote_order_id']);

				await this.model_extension_payment_firstdata_remote.updateCaptureStatus(firstdata_order['firstdata_remote_order_id'], 1);
				capture_status = 1;
				json['msg'] = this.language.get('text_capture_ok_order');
				json['data'] = {};
				json['data']['column_date_added'] = date("Y-m-d H:i:s");
				json['data']['amount'] = firstdata_order['total'];
				json['data']['capture_status'] = capture_status;
				json['data']['total'] = total_captured;
				json['data']['total_formatted'] = this.currency.format(total_captured, firstdata_order['currency_code'], 1, true);
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (capture_response['error']) && (capture_response['error']) ? capture_response['error'] : 'Unable to capture';

			}
		} else {
			json['error'] = true;
			json['msg'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async refund() {
		await this.load.language('extension/payment/firstdata_remote');

		json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '') {
			this.load.model('extension/payment/firstdata_remote');

			firstdata_order = await this.model_extension_payment_firstdata_remote.getOrder(this.request.post['order_id']);

			refund_response = await this.model_extension_payment_firstdata_remote.refund(firstdata_order['order_ref'], firstdata_order['total'], firstdata_order['currency_code']);

			await this.model_extension_payment_firstdata_remote.logger('Refund result:\r\n' + print_r(refund_response, 1));

			if (strtoupper(refund_response['transaction_result']) == 'APPROVED') {
				await this.model_extension_payment_firstdata_remote.addTransaction(firstdata_order['firstdata_remote_order_id'], 'refund', firstdata_order['total'] * -1);

				total_refunded = await this.model_extension_payment_firstdata_remote.getTotalRefunded(firstdata_order['firstdata_remote_order_id']);
				total_captured = await this.model_extension_payment_firstdata_remote.getTotalCaptured(firstdata_order['firstdata_remote_order_id']);

				if (total_captured <= 0 && firstdata_order['capture_status'] == 1) {
					await this.model_extension_payment_firstdata_remote.updateRefundStatus(firstdata_order['firstdata_remote_order_id'], 1);
					refund_status = 1;
					json['msg'] = this.language.get('text_refund_ok_order');
				} else {
					refund_status = 0;
					json['msg'] = this.language.get('text_refund_ok');
				}

				json['data'] = {};
				json['data']['column_date_added'] = date("Y-m-d H:i:s");
				json['data']['amount'] = firstdata_order['total'] * -1;
				json['data']['total_captured'] = total_captured;
				json['data']['total_refunded'] = total_refunded;
				json['data']['refund_status'] = refund_status;
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (refund_response['error']) && (refund_response['error']) ? refund_response['error'] : 'Unable to refund';
			}
		} else {
			json['error'] = true;
			json['msg'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/firstdata_remote')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['firstdata_remote_merchant_id']) {
			this.error['error_merchant_id'] = this.language.get('error_merchant_id');
		}

		if (!this.request.post['firstdata_remote_user_id']) {
			this.error['error_user_id'] = this.language.get('error_user_id');
		}

		if (!this.request.post['firstdata_remote_password']) {
			this.error['error_password'] = this.language.get('error_password');
		}

		if (!this.request.post['firstdata_remote_certificate']) {
			this.error['error_certificate'] = this.language.get('error_certificate');
		}

		if (!this.request.post['firstdata_remote_key']) {
			this.error['error_key'] = this.language.get('error_key');
		}

		if (!this.request.post['firstdata_remote_key_pw']) {
			this.error['error_key_pw'] = this.language.get('error_key_pw');
		}

		if (!this.request.post['firstdata_remote_ca']) {
			this.error['error_ca'] = this.language.get('error_ca');
		}

		return Object.keys(this.error).length?false:true
	}
}