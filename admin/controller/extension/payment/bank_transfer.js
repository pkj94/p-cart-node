module.exports = class ControllerExtensionPaymentBankTransfer extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/payment/bank_transfer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_bank_transfer', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['bank'])) {
			data['error_bank'] = this.error['bank'];
		} else {
			data['error_bank'] = {};
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/payment/bank_transfer', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/bank_transfer', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		this.load.model('localisation/language', this);

		data['payment_bank_transfer_bank'] = {};

		const languages = await this.model_localisation_language.getLanguages();

		for (let [code, language] of Object.entries(languages)) {
			if ((this.request.post['payment_bank_transfer_bank' + language['language_id']])) {
				data['payment_bank_transfer_bank'][language['language_id']] = this.request.post['payment_bank_transfer_bank' + language['language_id']];
			} else {
				data['payment_bank_transfer_bank'][language['language_id']] = this.config.get('payment_bank_transfer_bank' + language['language_id']);
			}
		}

		data['languages'] = languages;

		if ((this.request.post['payment_bank_transfer_total'])) {
			data['payment_bank_transfer_total'] = this.request.post['payment_bank_transfer_total'];
		} else {
			data['payment_bank_transfer_total'] = this.config.get('payment_bank_transfer_total');
		}

		if ((this.request.post['payment_bank_transfer_order_status_id'])) {
			data['payment_bank_transfer_order_status_id'] = this.request.post['payment_bank_transfer_order_status_id'];
		} else {
			data['payment_bank_transfer_order_status_id'] = this.config.get('payment_bank_transfer_order_status_id');
		}

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_bank_transfer_geo_zone_id'])) {
			data['payment_bank_transfer_geo_zone_id'] = this.request.post['payment_bank_transfer_geo_zone_id'];
		} else {
			data['payment_bank_transfer_geo_zone_id'] = this.config.get('payment_bank_transfer_geo_zone_id');
		}

		this.load.model('localisation/geo_zone', this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_bank_transfer_status'])) {
			data['payment_bank_transfer_status'] = this.request.post['payment_bank_transfer_status'];
		} else {
			data['payment_bank_transfer_status'] = this.config.get('payment_bank_transfer_status');
		}

		if ((this.request.post['payment_bank_transfer_sort_order'])) {
			data['payment_bank_transfer_sort_order'] = this.request.post['payment_bank_transfer_sort_order'];
		} else {
			data['payment_bank_transfer_sort_order'] = this.config.get('payment_bank_transfer_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/bank_transfer', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/bank_transfer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('localisation/language', this);

		const languages = await this.model_localisation_language.getLanguages();

		for (let [code, language] of Object.entries(languages)) {
			if (!(this.request.post['payment_bank_transfer_bank' + language['language_id']])) {
				this.error['bank'] = this.error['bank'] || {};
				this.error['bank'][language['language_id']] = this.language.get('error_bank');
			}
		}

		return Object.keys(this.error).length ? false : true
	}
}