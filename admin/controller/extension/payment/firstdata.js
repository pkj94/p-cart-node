module.exports = class ControllerExtensionPaymentFirstdata extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/firstdata');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_firstdata', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		data['notify_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/firstdata/notify';

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

		if ((this.error['error_secret'])) {
			data['error_secret'] = this.error['error_secret'];
		} else {
			data['error_secret'] = '';
		}

		if ((this.error['error_live_url'])) {
			data['error_live_url'] = this.error['error_live_url'];
		} else {
			data['error_live_url'] = '';
		}

		if ((this.error['error_demo_url'])) {
			data['error_demo_url'] = this.error['error_demo_url'];
		} else {
			data['error_demo_url'] = '';
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
			'href' : await this.url.link('extension/payment/firstdata', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/firstdata', 'user_token=' + this.session.data['user_token'], true);
		
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_firstdata_merchant_id'])) {
			data['payment_firstdata_merchant_id'] = this.request.post['payment_firstdata_merchant_id'];
		} else {
			data['payment_firstdata_merchant_id'] = this.config.get('payment_firstdata_merchant_id');
		}

		if ((this.request.post['payment_firstdata_secret'])) {
			data['payment_firstdata_secret'] = this.request.post['payment_firstdata_secret'];
		} else {
			data['payment_firstdata_secret'] = this.config.get('payment_firstdata_secret');
		}

		if ((this.request.post['payment_firstdata_live_demo'])) {
			data['payment_firstdata_live_demo'] = this.request.post['payment_firstdata_live_demo'];
		} else {
			data['payment_firstdata_live_demo'] = this.config.get('payment_firstdata_live_demo');
		}

		if ((this.request.post['payment_firstdata_geo_zone_id'])) {
			data['payment_firstdata_geo_zone_id'] = this.request.post['payment_firstdata_geo_zone_id'];
		} else {
			data['payment_firstdata_geo_zone_id'] = this.config.get('payment_firstdata_geo_zone_id');
		}

		if ((this.request.post['payment_firstdata_total'])) {
			data['payment_firstdata_total'] = this.request.post['payment_firstdata_total'];
		} else {
			data['payment_firstdata_total'] = this.config.get('payment_firstdata_total');
		}

		if ((this.request.post['payment_firstdata_sort_order'])) {
			data['payment_firstdata_sort_order'] = this.request.post['payment_firstdata_sort_order'];
		} else {
			data['payment_firstdata_sort_order'] = this.config.get('payment_firstdata_sort_order');
		}

		if ((this.request.post['payment_firstdata_status'])) {
			data['payment_firstdata_status'] = this.request.post['payment_firstdata_status'];
		} else {
			data['payment_firstdata_status'] = this.config.get('payment_firstdata_status');
		}

		if ((this.request.post['payment_firstdata_debug'])) {
			data['payment_firstdata_debug'] = this.request.post['payment_firstdata_debug'];
		} else {
			data['payment_firstdata_debug'] = this.config.get('payment_firstdata_debug');
		}

		if ((this.request.post['payment_firstdata_auto_settle'])) {
			data['payment_firstdata_auto_settle'] = this.request.post['payment_firstdata_auto_settle'];
		} else if (!(this.request.post['payment_firstdata_auto_settle']) && this.config.get('payment_firstdata_auto_settle') != '') {
			data['payment_firstdata_auto_settle'] = this.config.get('payment_firstdata_auto_settle');
		} else {
			data['payment_firstdata_auto_settle'] = 1;
		}

		if ((this.request.post['payment_firstdata_order_status_success_settled_id'])) {
			data['payment_firstdata_order_status_success_settled_id'] = this.request.post['payment_firstdata_order_status_success_settled_id'];
		} else {
			data['payment_firstdata_order_status_success_settled_id'] = this.config.get('payment_firstdata_order_status_success_settled_id');
		}

		if ((this.request.post['payment_firstdata_order_status_success_unsettled_id'])) {
			data['payment_firstdata_order_status_success_unsettled_id'] = this.request.post['payment_firstdata_order_status_success_unsettled_id'];
		} else {
			data['payment_firstdata_order_status_success_unsettled_id'] = this.config.get('payment_firstdata_order_status_success_unsettled_id');
		}

		if ((this.request.post['payment_firstdata_order_status_decline_id'])) {
			data['payment_firstdata_order_status_decline_id'] = this.request.post['payment_firstdata_order_status_decline_id'];
		} else {
			data['payment_firstdata_order_status_decline_id'] = this.config.get('payment_firstdata_order_status_decline_id');
		}

		if ((this.request.post['payment_firstdata_order_status_void_id'])) {
			data['payment_firstdata_order_status_void_id'] = this.request.post['payment_firstdata_order_status_void_id'];
		} else {
			data['payment_firstdata_order_status_void_id'] = this.config.get('payment_firstdata_order_status_void_id');
		}

		if ((this.request.post['payment_firstdata_live_url'])) {
			data['payment_firstdata_live_url'] = this.request.post['payment_firstdata_live_url'];
		} else {
			data['payment_firstdata_live_url'] = this.config.get('payment_firstdata_live_url');
		}

		if (empty(data['payment_firstdata_live_url'])) {
			data['payment_firstdata_live_url'] = 'https://ipg-online.com/connect/gateway/processing';
		}

		if ((this.request.post['payment_firstdata_demo_url'])) {
			data['payment_firstdata_demo_url'] = this.request.post['payment_firstdata_demo_url'];
		} else {
			data['payment_firstdata_demo_url'] = this.config.get('payment_firstdata_demo_url');
		}

		if ((this.request.post['payment_firstdata_card_storage'])) {
			data['payment_firstdata_card_storage'] = this.request.post['payment_firstdata_card_storage'];
		} else {
			data['payment_firstdata_card_storage'] = this.config.get('payment_firstdata_card_storage');
		}

		if (empty(data['payment_firstdata_demo_url'])) {
			data['payment_firstdata_demo_url'] = 'https://test.ipg-online.com/connect/gateway/processing';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/firstdata', data));
	}

	async install() {
		this.load.model('extension/payment/firstdata');
		await this.model_extension_payment_firstdata.install();
	}

	async uninstall() {
		this.load.model('extension/payment/firstdata');
		await this.model_extension_payment_firstdata.uninstall();
	}

	async order() {
		if (this.config.get('payment_firstdata_status')) {
			this.load.model('extension/payment/firstdata');

			firstdata_order = await this.model_extension_payment_firstdata.getOrder(this.request.get['order_id']);

			if ((firstdata_order)) {
				await this.load.language('extension/payment/firstdata');

				firstdata_order['total_captured'] = await this.model_extension_payment_firstdata.getTotalCaptured(firstdata_order['firstdata_order_id']);
				firstdata_order['total_formatted'] = this.currency.format(firstdata_order['total'], firstdata_order['currency_code'], 1, true);
				firstdata_order['total_captured_formatted'] = this.currency.format(firstdata_order['total_captured'], firstdata_order['currency_code'], 1, true);

				data['firstdata_order'] = firstdata_order;
				data['merchant_id'] = this.config.get('payment_firstdata_merchant_id');
				data['currency'] = await this.model_extension_payment_firstdata.mapCurrency(firstdata_order['currency_code']);
				data['amount'] = number_format(firstdata_order['total'], 2);

				data['request_timestamp'] = date("Y:m:d-H:i:s");

				data['hash'] = sha1(bin2hex(data['merchant_id'] + data['request_timestamp'] + data['amount'] + data['currency'] + this.config.get('payment_firstdata_secret')));

				data['void_url'] = await this.url.link('extension/payment/firstdata/void', 'user_token=' + this.session.data['user_token'], true);
				data['capture_url'] = await this.url.link('extension/payment/firstdata/capture', 'user_token=' + this.session.data['user_token'], true);
				data['notify_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/firstdata/notify';

				if (this.config.get('payment_firstdata_live_demo') == 1) {
					data['action_url'] = this.config.get('payment_firstdata_live_url');
				} else {
					data['action_url'] = this.config.get('payment_firstdata_demo_url');
				}

				if ((this.session.data['void_success'])) {
					data['void_success'] = this.session.data['void_success'];

					delete this.session.data['void_success']);
				} else {
					data['void_success'] = '';
				}

				if ((this.session.data['void_error'])) {
					data['void_error'] = this.session.data['void_error'];

					delete this.session.data['void_error']);
				} else {
					data['void_error'] = '';
				}

				if ((this.session.data['capture_success'])) {
					data['capture_success'] = this.session.data['capture_success'];

					delete this.session.data['capture_success']);
				} else {
					data['capture_success'] = '';
				}

				if ((this.session.data['capture_error'])) {
					data['capture_error'] = this.session.data['capture_error'];

					delete this.session.data['capture_error']);
				} else {
					data['capture_error'] = '';
				}

				data['text_payment_info'] = this.language.get('text_payment_info');
				data['text_order_ref'] = this.language.get('text_order_ref');
				data['text_order_total'] = this.language.get('text_order_total');
				data['text_total_captured'] = this.language.get('text_total_captured');
				data['text_capture_status'] = this.language.get('text_capture_status');
				data['text_void_status'] = this.language.get('text_void_status');
				data['text_transactions'] = this.language.get('text_transactions');
				data['text_yes'] = this.language.get('text_yes');
				data['text_no'] = this.language.get('text_no');
				data['text_column_amount'] = this.language.get('text_column_amount');
				data['text_column_type'] = this.language.get('text_column_type');
				data['text_column_date_added'] = this.language.get('text_column_date_added');
				data['button_capture'] = this.language.get('button_capture');
				data['button_void'] = this.language.get('button_void');
				data['text_confirm_void'] = this.language.get('text_confirm_void');
				data['text_confirm_capture'] = this.language.get('text_confirm_capture');

				data['order_id'] = this.request.get['order_id'];
				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/firstdata_order', data);
			}
		}
	}

	async void() {
		await this.load.language('extension/payment/firstdata');

		if (this.request.post['status'] == 'FAILED') {
			if ((this.request.post['fail_reason'])) {
				this.session.data['void_error'] = this.request.post['fail_reason'];
			} else {
				this.session.data['void_error'] = this.language.get('error_void_error');
			}
		}

		if (this.request.post['status'] == 'DECLINED') {
			this.session.data['void_success'] = this.language.get('success_void');
		}

		this.response.setRedirect(await this.url.link('sale/order/info', 'order_id=' + this.request.post['order_id'] + '&user_token=' + this.session.data['user_token'], true));
	}

	async capture() {
		await this.load.language('extension/payment/firstdata');

		if (this.request.post['status'] == 'FAILED') {
			if ((this.request.post['fail_reason'])) {
				this.session.data['capture_error'] = this.request.post['fail_reason'];
			} else {
				this.session.data['capture_error'] = this.language.get('error_capture_error');
			}
		}

		if (this.request.post['status'] == 'APPROVED') {
			this.session.data['capture_success'] = this.language.get('success_capture');
		}

		this.response.setRedirect(await this.url.link('sale/order/info', 'order_id=' + this.request.post['order_id'] + '&user_token=' + this.session.data['user_token'], true));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/firstdata')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_firstdata_merchant_id']) {
			this.error['error_merchant_id'] = this.language.get('error_merchant_id');
		}

		if (!this.request.post['payment_firstdata_secret']) {
			this.error['error_secret'] = this.language.get('error_secret');
		}

		if (!this.request.post['payment_firstdata_live_url']) {
			this.error['error_live_url'] = this.language.get('error_live_url');
		}

		if (!this.request.post['payment_firstdata_demo_url']) {
			this.error['error_demo_url'] = this.language.get('error_demo_url');
		}

		return Object.keys(this.error).length?false:true
	}
}