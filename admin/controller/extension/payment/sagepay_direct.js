module.exports = class ControllerExtensionPaymentSagepayDirect extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/sagepay_direct');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_sagepay_direct', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['vendor'])) {
			data['error_vendor'] = this.error['vendor'];
		} else {
			data['error_vendor'] = '';
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
			'href' : await this.url.link('extension/payment/sagepay_direct', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/sagepay_direct', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_sagepay_direct_vendor'])) {
			data['payment_sagepay_direct_vendor'] = this.request.post['payment_sagepay_direct_vendor'];
		} else {
			data['payment_sagepay_direct_vendor'] = this.config.get('payment_sagepay_direct_vendor');
		}

		if ((this.request.post['payment_sagepay_direct_password'])) {
			data['payment_sagepay_direct_password'] = this.request.post['payment_sagepay_direct_password'];
		} else {
			data['payment_sagepay_direct_password'] = this.config.get('payment_sagepay_direct_password');
		}

		if ((this.request.post['payment_sagepay_direct_test'])) {
			data['payment_sagepay_direct_test'] = this.request.post['payment_sagepay_direct_test'];
		} else {
			data['payment_sagepay_direct_test'] = this.config.get('payment_sagepay_direct_test');
		}

		if ((this.request.post['payment_sagepay_direct_transaction'])) {
			data['payment_sagepay_direct_transaction'] = this.request.post['payment_sagepay_direct_transaction'];
		} else {
			data['payment_sagepay_direct_transaction'] = this.config.get('payment_sagepay_direct_transaction');
		}

		if ((this.request.post['payment_sagepay_direct_total'])) {
			data['payment_sagepay_direct_total'] = this.request.post['payment_sagepay_direct_total'];
		} else {
			data['payment_sagepay_direct_total'] = this.config.get('payment_sagepay_direct_total');
		}

		if ((this.request.post['payment_sagepay_direct_card'])) {
			data['payment_sagepay_direct_card'] = this.request.post['payment_sagepay_direct_card'];
		} else {
			data['payment_sagepay_direct_card'] = this.config.get('payment_sagepay_direct_card');
		}

		if ((this.request.post['payment_sagepay_direct_order_status_id'])) {
			data['payment_sagepay_direct_order_status_id'] = this.request.post['payment_sagepay_direct_order_status_id'];
		} else {
			data['payment_sagepay_direct_order_status_id'] = this.config.get('payment_sagepay_direct_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_sagepay_direct_geo_zone_id'])) {
			data['payment_sagepay_direct_geo_zone_id'] = this.request.post['payment_sagepay_direct_geo_zone_id'];
		} else {
			data['payment_sagepay_direct_geo_zone_id'] = this.config.get('payment_sagepay_direct_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_sagepay_direct_status'])) {
			data['payment_sagepay_direct_status'] = this.request.post['payment_sagepay_direct_status'];
		} else {
			data['payment_sagepay_direct_status'] = this.config.get('payment_sagepay_direct_status');
		}

		if ((this.request.post['payment_sagepay_direct_debug'])) {
			data['payment_sagepay_direct_debug'] = this.request.post['payment_sagepay_direct_debug'];
		} else {
			data['payment_sagepay_direct_debug'] = this.config.get('payment_sagepay_direct_debug');
		}

		if ((this.request.post['payment_sagepay_direct_sort_order'])) {
			data['payment_sagepay_direct_sort_order'] = this.request.post['payment_sagepay_direct_sort_order'];
		} else {
			data['payment_sagepay_direct_sort_order'] = this.config.get('payment_sagepay_direct_sort_order');
		}

		if ((this.request.post['payment_sagepay_direct_cron_job_token'])) {
			data['payment_sagepay_direct_cron_job_token'] = this.request.post['payment_sagepay_direct_cron_job_token'];
		} else if (this.config.get('payment_sagepay_direct_cron_job_token')) {
			data['payment_sagepay_direct_cron_job_token'] = this.config.get('payment_sagepay_direct_cron_job_token');
		} else {
			data['payment_sagepay_direct_cron_job_token'] = sha1(uniqid(mt_rand(), 1));
		}

		data['sagepay_direct_cron_job_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/sagepay_direct/cron&token=' + data['payment_sagepay_direct_cron_job_token'];

		if (this.config.get('payment_sagepay_direct_last_cron_job_run')) {
			data['payment_sagepay_direct_last_cron_job_run'] = this.config.get('payment_sagepay_direct_last_cron_job_run');
		} else {
			data['payment_sagepay_direct_last_cron_job_run'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/sagepay_direct', data));
	}

	async install() {
		this.load.model('extension/payment/sagepay_direct');
		await this.model_extension_payment_sagepay_direct.install();
	}

	async uninstall() {
		this.load.model('extension/payment/sagepay_direct');
		await this.model_extension_payment_sagepay_direct.uninstall();
	}

	async order() {
		if (this.config.get('payment_sagepay_direct_status')) {
			this.load.model('extension/payment/sagepay_direct');

			sagepay_direct_order = await this.model_extension_payment_sagepay_direct.getOrder(this.request.get['order_id']);

			if ((sagepay_direct_order)) {
				await this.load.language('extension/payment/sagepay_direct');

				sagepay_direct_order['total_released'] = await this.model_extension_payment_sagepay_direct.getTotalReleased(sagepay_direct_order['sagepay_direct_order_id']);

				sagepay_direct_order['total_formatted'] = this.currency.format(sagepay_direct_order['total'], sagepay_direct_order['currency_code'], false, false);
				sagepay_direct_order['total_released_formatted'] = this.currency.format(sagepay_direct_order['total_released'], sagepay_direct_order['currency_code'], false, false);

				data['sagepay_direct_order'] = sagepay_direct_order;

				data['auto_settle'] = sagepay_direct_order['settle_type'];

				data['order_id'] = this.request.get['order_id'];
				
				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/sagepay_direct_order', data);
			}
		}
	}

	async void() {
		await this.load.language('extension/payment/sagepay_direct');
		json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '') {
			this.load.model('extension/payment/sagepay_direct');

			sagepay_direct_order = await this.model_extension_payment_sagepay_direct.getOrder(this.request.post['order_id']);

			void_response = await this.model_extension_payment_sagepay_direct.void(this.request.post['order_id']);

			await this.model_extension_payment_sagepay_direct.logger('Void result', void_response);

			if (void_response['Status'] == 'OK') {
				await this.model_extension_payment_sagepay_direct.addTransaction(sagepay_direct_order['sagepay_direct_order_id'], 'void', 0.00);
				await this.model_extension_payment_sagepay_direct.updateVoidStatus(sagepay_direct_order['sagepay_direct_order_id'], 1);

				json['msg'] = this.language.get('text_void_ok');

				json['data'] = {};
				json['data']['date_added'] = date("Y-m-d H:i:s");
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (void_response['StatuesDetail']) && (void_response['StatuesDetail']) ? void_response['StatuesDetail'] : 'Unable to void';
			}
		} else {
			json['error'] = true;
			json['msg'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async release() {
		await this.load.language('extension/payment/sagepay_direct');
		json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '' && (this.request.post['amount']) && this.request.post['amount'] > 0) {
			this.load.model('extension/payment/sagepay_direct');

			sagepay_direct_order = await this.model_extension_payment_sagepay_direct.getOrder(this.request.post['order_id']);

			release_response = await this.model_extension_payment_sagepay_direct.release(this.request.post['order_id'], this.request.post['amount']);

			await this.model_extension_payment_sagepay_direct.logger('Release result', release_response);

			if (release_response['Status'] == 'OK') {
				await this.model_extension_payment_sagepay_direct.addTransaction(sagepay_direct_order['sagepay_direct_order_id'], 'payment', this.request.post['amount']);

				total_released = await this.model_extension_payment_sagepay_direct.getTotalReleased(sagepay_direct_order['sagepay_direct_order_id']);

				if (total_released >= sagepay_direct_order['total'] || sagepay_direct_order['settle_type'] == 0) {
					await this.model_extension_payment_sagepay_direct.updateReleaseStatus(sagepay_direct_order['sagepay_direct_order_id'], 1);
					release_status = 1;
					json['msg'] = this.language.get('text_release_ok_order');
				} else {
					release_status = 0;
					json['msg'] = this.language.get('text_release_ok');
				}

				json['data'] = {};
				json['data']['date_added'] = date("Y-m-d H:i:s");
				json['data']['amount'] = this.request.post['amount'];
				json['data']['release_status'] = release_status;
				json['data']['total'] = total_released;
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (release_response['StatusDetail']) && (release_response['StatusDetail']) ? release_response['StatusDetail'] : 'Unable to release';
			}
		} else {
			json['error'] = true;
			json['msg'] = this.language.get('error_data_missing');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async rebate() {
		await this.load.language('extension/payment/sagepay_direct');
		json = {};

		if ((this.request.post['order_id']) && (this.request.post['order_id'])) {
			this.load.model('extension/payment/sagepay_direct');

			sagepay_direct_order = await this.model_extension_payment_sagepay_direct.getOrder(this.request.post['order_id']);

			rebate_response = await this.model_extension_payment_sagepay_direct.rebate(this.request.post['order_id'], this.request.post['amount']);

			await this.model_extension_payment_sagepay_direct.logger('Rebate result', rebate_response);

			if (rebate_response['Status'] == 'OK') {
				await this.model_extension_payment_sagepay_direct.addTransaction(sagepay_direct_order['sagepay_direct_order_id'], 'rebate', this.request.post['amount'] * -1);

				total_rebated = await this.model_extension_payment_sagepay_direct.getTotalRebated(sagepay_direct_order['sagepay_direct_order_id']);
				total_released = await this.model_extension_payment_sagepay_direct.getTotalReleased(sagepay_direct_order['sagepay_direct_order_id']);

				if (total_released <= 0 && sagepay_direct_order['release_status'] == 1) {
					await this.model_extension_payment_sagepay_direct.updateRebateStatus(sagepay_direct_order['sagepay_direct_order_id'], 1);
					rebate_status = 1;
					json['msg'] = this.language.get('text_rebate_ok_order');
				} else {
					rebate_status = 0;
					json['msg'] = this.language.get('text_rebate_ok');
				}

				json['data'] = {};
				json['data']['date_added'] = date("Y-m-d H:i:s");
				json['data']['amount'] = this.request.post['amount'] * -1;
				json['data']['total_released'] = total_released;
				json['data']['total_rebated'] = total_rebated;
				json['data']['rebate_status'] = rebate_status;
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (rebate_response['StatusDetail']) && (rebate_response['StatusDetail']) ? rebate_response['StatusDetail'] : 'Unable to rebate';
			}
		} else {
			json['error'] = true;
			json['msg'] = 'Missing data';
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/sagepay_direct')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_sagepay_direct_vendor']) {
			this.error['vendor'] = this.language.get('error_vendor');
		}

		return Object.keys(this.error).length?false:true
	}
}
