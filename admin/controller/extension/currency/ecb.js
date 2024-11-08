module.exports = class ControllerExtensionCurrencyEcb extends Controller {

	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/currency/ecb');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('currency_ecb', this.request.post);
			this.session.data['success'] = this.language.get('text_success');
			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=currency', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['ip'])) {
			data['error_ip'] = this.error['ip'];
		} else {
			data['error_ip'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=currency', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/currency/ecb', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/currency/ecb', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=currency', true);
		data['refresh'] = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'], true);

		data['text_edit'] = this.language.get('text_edit');
		data['text_edit'] = str_replace('%1', await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'], true), data['text_edit']);
		data['text_edit'] = str_replace('%2', await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true), data['text_edit']);

		data['currency_ecb_cron'] = 'curl -s &quot;' + HTTPS_CATALOG + '?route=extension/currency/ecb/refresh&quot;';

		if ((this.request.post['currency_ecb_ip'])) {
			data['currency_ecb_ip'] = this.request.post['currency_ecb_ip'];
		} else {
			data['currency_ecb_ip'] = this.config.get('currency_ecb_ip');
		}

		if ((this.request.post['currency_ecb_status'])) {
			data['currency_ecb_status'] = this.request.post['currency_ecb_status'];
		} else {
			data['currency_ecb_status'] = this.config.get('currency_ecb_status');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/currency/ecb', data));
	}


	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/currency/ecb')) {
			this.error['warning'] = this.language.get('error_permission');
		} else {
			if ((this.request.post['currency_ecb_status'])) {
				this.load.model('localisation/currency', this);
				const euro_currency = await this.model_localisation_currency.getCurrencyByCode('EUR');
				if (!euro_currency) {
					this.error['warning'] = this.language.get('error_euro');
				}
			}
			if ((this.request.post['currency_ecb_ip'])) {
				if (!ValidateIPaddress(this.request.post['currency_ecb_ip'])) {
					this.error['ip'] = this.language.get('error_ip');
				}
			}
		}
		return Object.keys(this.error).length ? false : true
	}


	async install() {
	}


	async uninstall() {
	}


	async currency() {
		this.load.model('extension/currency/ecb', this);
		await this.model_extension_currency_ecb.refresh();
		return null;
	}
}
