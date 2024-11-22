module.exports = class ControllerExtensionPaymentWorldpay extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/worldpay');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_worldpay', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['error_service_key'])) {
			data['error_service_key'] = this.error['error_service_key'];
		} else {
			data['error_service_key'] = '';
		}

		if ((this.error['error_client_key'])) {
			data['error_client_key'] = this.error['error_client_key'];
		} else {
			data['error_client_key'] = '';
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
			'href' : await this.url.link('extension/payment/worldpay', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/worldpay', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_worldpay_service_key'])) {
			data['payment_worldpay_service_key'] = this.request.post['payment_worldpay_service_key'];
		} else {
			data['payment_worldpay_service_key'] = this.config.get('payment_worldpay_service_key');
		}

		if ((this.request.post['payment_worldpay_client_key'])) {
			data['payment_worldpay_client_key'] = this.request.post['payment_worldpay_client_key'];
		} else {
			data['payment_worldpay_client_key'] = this.config.get('payment_worldpay_client_key');
		}

		if ((this.request.post['payment_worldpay_total'])) {
			data['payment_worldpay_total'] = this.request.post['payment_worldpay_total'];
		} else {
			data['payment_worldpay_total'] = this.config.get('payment_worldpay_total');
		}

		if ((this.request.post['payment_worldpay_card'])) {
			data['payment_worldpay_card'] = this.request.post['payment_worldpay_card'];
		} else {
			data['payment_worldpay_card'] = this.config.get('payment_worldpay_card');
		}

		if ((this.request.post['payment_worldpay_order_status_id'])) {
			data['payment_worldpay_order_status_id'] = this.request.post['payment_worldpay_order_status_id'];
		} else {
			data['payment_worldpay_order_status_id'] = this.config.get('payment_worldpay_order_status_id');
		}

		if ((this.request.post['payment_worldpay_geo_zone_id'])) {
			data['payment_worldpay_geo_zone_id'] = this.request.post['payment_worldpay_geo_zone_id'];
		} else {
			data['payment_worldpay_geo_zone_id'] = this.config.get('payment_worldpay_geo_zone_id');
		}

		if ((this.request.post['payment_worldpay_status'])) {
			data['payment_worldpay_status'] = this.request.post['payment_worldpay_status'];
		} else {
			data['payment_worldpay_status'] = this.config.get('payment_worldpay_status');
		}

		if ((this.request.post['payment_worldpay_debug'])) {
			data['payment_worldpay_debug'] = this.request.post['payment_worldpay_debug'];
		} else {
			data['payment_worldpay_debug'] = this.config.get('payment_worldpay_debug');
		}

		if ((this.request.post['payment_worldpay_sort_order'])) {
			data['payment_worldpay_sort_order'] = this.request.post['payment_worldpay_sort_order'];
		} else {
			data['payment_worldpay_sort_order'] = this.config.get('payment_worldpay_sort_order');
		}

		if ((this.request.post['payment_worldpay_secret_token'])) {
			data['payment_worldpay_secret_token'] = this.request.post['payment_worldpay_secret_token'];
		} else if (this.config.get('payment_worldpay_secret_token')) {
			data['payment_worldpay_secret_token'] = this.config.get('payment_worldpay_secret_token');
		} else {
			data['payment_worldpay_secret_token'] = sha1(uniqid(mt_rand(), 1));
		}

		data['payment_worldpay_webhook_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/worldpay/webhook&token=' + data['payment_worldpay_secret_token'];

		data['payment_worldpay_cron_job_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/worldpay/cron&token=' + data['payment_worldpay_secret_token'];

		if (this.config.get('payment_worldpay_last_cron_job_run')) {
			data['payment_worldpay_last_cron_job_run'] = this.config.get('payment_worldpay_last_cron_job_run');
		} else {
			data['payment_worldpay_last_cron_job_run'] = '';
		}
		
		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();
		
		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_worldpay_success_status_id'])) {
			data['payment_worldpay_success_status_id'] = this.request.post['payment_worldpay_success_status_id'];
		} else {
			data['payment_worldpay_success_status_id'] = this.config.get('payment_worldpay_success_status_id');
		}

		if ((this.request.post['payment_worldpay_failed_status_id'])) {
			data['payment_worldpay_failed_status_id'] = this.request.post['payment_worldpay_failed_status_id'];
		} else {
			data['payment_worldpay_failed_status_id'] = this.config.get('payment_worldpay_failed_status_id');
		}

		if ((this.request.post['payment_worldpay_settled_status_id'])) {
			data['payment_worldpay_settled_status_id'] = this.request.post['payment_worldpay_settled_status_id'];
		} else {
			data['payment_worldpay_settled_status_id'] = this.config.get('payment_worldpay_settled_status_id');
		}

		if ((this.request.post['payment_worldpay_refunded_status_id'])) {
			data['payment_worldpay_refunded_status_id'] = this.request.post['payment_worldpay_refunded_status_id'];
		} else {
			data['payment_worldpay_refunded_status_id'] = this.config.get('payment_worldpay_refunded_status_id');
		}

		if ((this.request.post['payment_worldpay_partially_refunded_status_id'])) {
			data['payment_worldpay_partially_refunded_status_id'] = this.request.post['payment_worldpay_partially_refunded_status_id'];
		} else {
			data['payment_worldpay_partially_refunded_status_id'] = this.config.get('payment_worldpay_partially_refunded_status_id');
		}

		if ((this.request.post['payment_worldpay_charged_back_status_id'])) {
			data['payment_worldpay_charged_back_status_id'] = this.request.post['payment_worldpay_charged_back_status_id'];
		} else {
			data['payment_worldpay_charged_back_status_id'] = this.config.get('payment_worldpay_charged_back_status_id');
		}

		if ((this.request.post['payment_worldpay_information_requested_status_id'])) {
			data['payment_worldpay_information_requested_status_id'] = this.request.post['payment_worldpay_information_requested_status_id'];
		} else {
			data['payment_worldpay_information_requested_status_id'] = this.config.get('payment_worldpay_information_requested_status_id');
		}

		if ((this.request.post['payment_worldpay_information_supplied_status_id'])) {
			data['payment_worldpay_information_supplied_status_id'] = this.request.post['payment_worldpay_information_supplied_status_id'];
		} else {
			data['payment_worldpay_information_supplied_status_id'] = this.config.get('payment_worldpay_information_supplied_status_id');
		}

		if ((this.request.post['payment_worldpay_chargeback_reversed_status_id'])) {
			data['payment_worldpay_chargeback_reversed_status_id'] = this.request.post['payment_worldpay_chargeback_reversed_status_id'];
		} else {
			data['payment_worldpay_chargeback_reversed_status_id'] = this.config.get('payment_worldpay_chargeback_reversed_status_id');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/worldpay', data));
	}

	async install() {
		this.load.model('extension/payment/worldpay');
		await this.model_extension_payment_worldpay.install();
	}

	async uninstall() {
		this.load.model('extension/payment/worldpay');
		await this.model_extension_payment_worldpay.uninstall();
	}

	async order() {

		if (this.config.get('payment_worldpay_status')) {

			this.load.model('extension/payment/worldpay');

			worldpay_order = await this.model_extension_payment_worldpay.getOrder(this.request.get['order_id']);

			if ((worldpay_order)) {
				await this.load.language('extension/payment/worldpay');

				worldpay_order['total_released'] = await this.model_extension_payment_worldpay.getTotalReleased(worldpay_order['payment_worldpay_order_id']);

				worldpay_order['total_formatted'] = this.currency.format(worldpay_order['total'], worldpay_order['currency_code'], false);
				worldpay_order['total_released_formatted'] = this.currency.format(worldpay_order['total_released'], worldpay_order['currency_code'], false);

				data['payment_worldpay_order'] = worldpay_order;

				data['order_id'] = this.request.get['order_id'];
				
				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/worldpay_order', data);
			}
		}
	}

	async refund() {
		await this.load.language('extension/payment/worldpay');
		json = {};

		if ((this.request.post['order_id']) && (this.request.post['order_id'])) {
			this.load.model('extension/payment/worldpay');

			worldpay_order = await this.model_extension_payment_worldpay.getOrder(this.request.post['order_id']);

			refund_response = await this.model_extension_payment_worldpay.refund(this.request.post['order_id'], this.request.post['amount']);

			await this.model_extension_payment_worldpay.logger('Refund result: ' + print_r(refund_response, 1));

			if (refund_response['status'] == 'success') {
				await this.model_extension_payment_worldpay.addTransaction(worldpay_order['payment_worldpay_order_id'], 'refund', this.request.post['amount'] * -1);

				total_refunded = await this.model_extension_payment_worldpay.getTotalRefunded(worldpay_order['payment_worldpay_order_id']);
				total_released = await this.model_extension_payment_worldpay.getTotalReleased(worldpay_order['payment_worldpay_order_id']);

				await this.model_extension_payment_worldpay.updateRefundStatus(worldpay_order['payment_worldpay_order_id'], 1);

				json['msg'] = this.language.get('text_refund_ok_order');
				json['data'] = {};
				json['data']['created'] = date("Y-m-d H:i:s");
				json['data']['amount'] = this.currency.format((this.request.post['amount'] * -1), worldpay_order['currency_code'], false);
				json['data']['total_released'] = this.currency.format(total_released, worldpay_order['currency_code'], false);
				json['data']['total_refund'] = this.currency.format(total_refunded, worldpay_order['currency_code'], false);
				json['data']['refund_status'] = 1;
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (refund_response['message']) && (refund_response['message']) ? refund_response['message'] : 'Unable to refund';
			}
		} else {
			json['error'] = true;
			json['msg'] = 'Missing data';
		}

		this.response.setOutput(json);
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/worldpay')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_worldpay_service_key']) {
			this.error['error_service_key'] = this.language.get('error_service_key');
		}

		if (!this.request.post['payment_worldpay_client_key']) {
			this.error['error_client_key'] = this.language.get('error_client_key');
		}

		return Object.keys(this.error).length?false:true
	}
}
