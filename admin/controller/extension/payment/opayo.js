module.exports = class ControllerExtensionPaymentOpayo extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/opayo');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_opayo', this.request.post);

			this.session.data['success'] = this.language.get('success_save');
			
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
			'text' : this.language.get('text_extensions'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/opayo', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/opayo', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		
		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			server = HTTPS_SERVER;
			catalog = HTTPS_CATALOG;
		} else {
			server = HTTP_SERVER;
			catalog = HTTP_CATALOG;
		}
		
		// Setting 		
		_config = new Config();
		_config.load('opayo');
		
		data['setting'] = _config.get('opayo_setting');
		
		if ((this.request.post['payment_opayo_setting'])) {
			data['setting'] = array_replace_recursive(data['setting'], this.request.post['payment_opayo_setting']);
		} else {
			data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_opayo_setting'));
		}
		
		if ((this.request.post['payment_opayo_vendor'])) {
			data['vendor'] = this.request.post['payment_opayo_vendor'];
		} else {
			data['vendor'] = this.config.get('payment_opayo_vendor');
		}

		if ((this.request.post['payment_opayo_total'])) {
			data['total'] = this.request.post['payment_opayo_total'];
		} else {
			data['total'] = this.config.get('payment_opayo_total');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_opayo_geo_zone_id'])) {
			data['geo_zone_id'] = this.request.post['payment_opayo_geo_zone_id'];
		} else {
			data['geo_zone_id'] = this.config.get('payment_opayo_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_opayo_status'])) {
			data['status'] = this.request.post['payment_opayo_status'];
		} else {
			data['status'] = this.config.get('payment_opayo_status');
		}

		if ((this.request.post['payment_opayo_sort_order'])) {
			data['sort_order'] = this.request.post['payment_opayo_sort_order'];
		} else {
			data['sort_order'] = this.config.get('payment_opayo_sort_order');
		}
		
		if (!data['setting']['cron']['token']) {
			data['setting']['cron']['token'] = sha1(uniqid(mt_rand(), 1));
		}

		if (!data['setting']['cron']['url']) {
			data['setting']['cron']['url'] = catalog + 'index.php?route=extension/payment/opayo/cron&token=' + data['setting']['cron']['token'];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/opayo/opayo', data));
	}

	async install() {
		this.load.model('extension/payment/opayo');
		
		await this.model_extension_payment_opayo.install();
	}

	async uninstall() {
		this.load.model('extension/payment/opayo');
		
		await this.model_extension_payment_opayo.uninstall();
	}

	async order() {
		if (this.config.get('payment_opayo_status')) {
			this.load.model('extension/payment/opayo');

			opayo_order = await this.model_extension_payment_opayo.getOrder(this.request.get['order_id']);

			if ((opayo_order)) {
				await this.load.language('extension/payment/opayo');

				opayo_order['total_released'] = await this.model_extension_payment_opayo.getTotalReleased(opayo_order['opayo_order_id']);

				opayo_order['total_formatted'] = this.currency.format(opayo_order['total'], opayo_order['currency_code'], false, false);
				opayo_order['total_released_formatted'] = this.currency.format(opayo_order['total_released'], opayo_order['currency_code'], false, false);

				data['opayo_order'] = opayo_order;

				data['auto_settle'] = opayo_order['settle_type'];

				data['order_id'] = this.request.get['order_id'];
				
				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/opayo/order', data);
			}
		}
	}

	async void() {
		await this.load.language('extension/payment/opayo');
		
		json = {};

		if ((this.request.post['order_id'])) {
			this.load.model('extension/payment/opayo');

			opayo_order = await this.model_extension_payment_opayo.getOrder(this.request.post['order_id']);

			void_response = await this.model_extension_payment_opayo.void(this.request.post['order_id']);

			await this.model_extension_payment_opayo.log('Void result', void_response);

			if ((void_response) && void_response['Status'] == 'OK') {
				await this.model_extension_payment_opayo.addOrderTransaction(opayo_order['opayo_order_id'], 'void', 0.00);
				await this.model_extension_payment_opayo.updateVoidStatus(opayo_order['opayo_order_id'], 1);

				json['msg'] = this.language.get('success_void_ok');

				json['data'] = {};
				json['data']['date_added'] = date('Y-m-d H:i:s');
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
		await this.load.language('extension/payment/opayo');
		
		json = {};

		if ((this.request.post['order_id']) && (this.request.post['amount']) && this.request.post['amount'] > 0) {
			this.load.model('extension/payment/opayo');

			opayo_order = await this.model_extension_payment_opayo.getOrder(this.request.post['order_id']);

			release_response = await this.model_extension_payment_opayo.release(this.request.post['order_id'], this.request.post['amount']);

			await this.model_extension_payment_opayo.log('Release result', release_response);

			if ((release_response) && release_response['Status'] == 'OK') {
				await this.model_extension_payment_opayo.addOrderTransaction(opayo_order['opayo_order_id'], 'payment', this.request.post['amount']);

				total_released = await this.model_extension_payment_opayo.getTotalReleased(opayo_order['opayo_order_id']);

				if (total_released >= opayo_order['total'] || opayo_order['settle_type'] == 0) {
					await this.model_extension_payment_opayo.updateReleaseStatus(opayo_order['opayo_order_id'], 1);
					release_status = 1;
					json['msg'] = this.language.get('success_release_ok_order');
				} else {
					release_status = 0;
					json['msg'] = this.language.get('success_release_ok');
				}

				json['data'] = {};
				json['data']['date_added'] = date('Y-m-d H:i:s');
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
		await this.load.language('extension/payment/opayo');
		
		json = {};

		if ((this.request.post['order_id'])) {
			this.load.model('extension/payment/opayo');

			opayo_order = await this.model_extension_payment_opayo.getOrder(this.request.post['order_id']);

			rebate_response = await this.model_extension_payment_opayo.rebate(this.request.post['order_id'], this.request.post['amount']);

			await this.model_extension_payment_opayo.log('Rebate result', rebate_response);

			if ((rebate_response) && rebate_response['Status'] == 'OK') {
				await this.model_extension_payment_opayo.addOrderTransaction(opayo_order['opayo_order_id'], 'rebate', this.request.post['amount'] * -1);

				total_rebated = await this.model_extension_payment_opayo.getTotalRebated(opayo_order['opayo_order_id']);
				total_released = await this.model_extension_payment_opayo.getTotalReleased(opayo_order['opayo_order_id']);

				if ((total_released <= 0) && (opayo_order['release_status'] == 1)) {
					await this.model_extension_payment_opayo.updateRebateStatus(opayo_order['opayo_order_id'], 1);
					rebate_status = 1;
					json['msg'] = this.language.get('success_rebate_ok_order');
				} else {
					rebate_status = 0;
					json['msg'] = this.language.get('success_rebate_ok');
				}

				json['data'] = {};
				json['data']['date_added'] = date('Y-m-d H:i:s');
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
	
	async recurringButtons() {
		content = '';
		
		if ((this.request.get['order_recurring_id'])) {
			await this.load.language('extension/payment/opayo');
		
			this.load.model('sale/recurring');
			
			data['order_recurring_id'] = this.request.get['order_recurring_id'];

			order_recurring_info = await this.model_sale_recurring.getRecurring(data['order_recurring_id']);
			
			if (order_recurring_info) {
				data['recurring_status'] = order_recurring_info['status'];
				
				data['info_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/opayo/getRecurringInfo', 'user_token=' + this.session.data['user_token'] + '&order_recurring_id=' + data['order_recurring_id'], true));
				data['enable_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/opayo/enableRecurring', 'user_token=' + this.session.data['user_token'], true));
				data['disable_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/opayo/disableRecurring', 'user_token=' + this.session.data['user_token'], true));
				
				content = await this.load.view('extension/payment/opayo/recurring', data);
			}
		}
		
		return content;
	}
		
	async getRecurringInfo() {
		this.response.setOutput(this.recurringButtons());
	}
	
	async enableRecurring() {
		if ((this.request.post['order_recurring_id'])) {
			await this.load.language('extension/payment/opayo');
			
			this.load.model('extension/payment/opayo');
			
			order_recurring_id = this.request.post['order_recurring_id'];
			
			await this.model_extension_payment_opayo.editRecurringStatus(order_recurring_id, 1);
			
			data['success'] = this.language.get('success_enable_recurring');	
		}
						
		data['error'] = this.error;
				
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(data));
	}
	
	async disableRecurring() {
		if ((this.request.post['order_recurring_id'])) {
			await this.load.language('extension/payment/opayo');
			
			this.load.model('extension/payment/opayo');
			
			order_recurring_id = this.request.post['order_recurring_id'];
			
			await this.model_extension_payment_opayo.editRecurringStatus(order_recurring_id, 2);
			
			data['success'] = this.language.get('success_disable_recurring');	
		}
						
		data['error'] = this.error;
				
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(data));
	}

	private function validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/opayo')) {
			this.error['warning'] = this.language.get('error_permission');
		}
		
		this.request.post['payment_opayo_vendor'] = trim(this.request.post['payment_opayo_vendor']);

		if (!this.request.post['payment_opayo_vendor']) {
			this.error['vendor'] = this.language.get('error_vendor');
			this.error['warning'] = this.language.get('error_warning');
		} 

		return Object.keys(this.error).length?false:true
	}
}
