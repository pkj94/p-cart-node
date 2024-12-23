const bin2hex = require("locutus/php/strings/bin2hex");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Voucher extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		if (!(this.session.data['vouchers'])) {
			this.session.data['vouchers'] = [];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_voucher'),
			'href': await this.url.link('checkout/voucher', 'language=' + this.config.get('config_language'))
		});

		data['help_amount'] = sprintf(this.language.get('help_amount'), this.currency.format(this.config.get('config_voucher_min'), this.session.data['currency']), this.currency.format(this.config.get('config_voucher_max'), this.session.data['currency']));

		this.session.data['voucher_token'] = bin2hex(26);

		data['save'] = await this.url.link('checkout/voucher.add', 'language=' + this.config.get('config_language') + '&voucher_token=' + this.session.data['voucher_token']);

		if (await this.customer.isLogged()) {
			data['from_name'] = await this.customer.getFirstName() + ' ' + await this.customer.getLastName();
		} else {
			data['from_name'] = '';
		}

		if (await this.customer.isLogged()) {
			data['from_email'] = await this.customer.getEmail();
		} else {
			data['from_email'] = '';
		}

		data['amount'] = this.currency.format(this.config.get('config_voucher_min'), this.config.get('config_currency'), false, false);

		this.load.model('checkout/voucher_theme', this);

		data['voucher_themes'] = await this.model_checkout_voucher_theme.getVoucherThemes();

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('checkout/voucher', data));
	}

	/**
	 * @return void
	 */
	async add() {
		await this.load.language('checkout/voucher');

		const json = { error: {} };

		let keys = [
			'to_name',
			'to_email',
			'from_name',
			'from_email',
			'voucher_theme_id',
			'amount',
			'agree'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if (!(this.request.get['voucher_token']) || !(this.session.data['voucher_token']) || (this.session.data['voucher_token'] != this.request.get['voucher_token'])) {
			json['redirect'] = await this.url.link('checkout/voucher', 'language=' + this.config.get('config_language'), true);
		}

		if ((oc_strlen(this.request.post['to_name']) < 1) || (oc_strlen(this.request.post['to_name']) > 64)) {
			json['error']['to_name'] = this.language.get('error_to_name');
		}

		if ((oc_strlen(this.request.post['to_email']) > 96) || !isEmailValid(this.request.post['to_email'])) {
			json['error']['to_email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['from_name']) < 1) || (oc_strlen(this.request.post['from_name']) > 64)) {
			json['error']['from_name'] = this.language.get('error_from_name');
		}

		if ((oc_strlen(this.request.post['from_email']) > 96) || !isEmailValid(this.request.post['from_email'])) {
			json['error']['from_email'] = this.language.get('error_email');
		}

		if (!this.request.post['voucher_theme_id']) {
			json['error']['theme'] = this.language.get('error_theme');
		}

		if ((this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency')) < this.config.get('config_voucher_min')) || (this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency')) > this.config.get('config_voucher_max'))) {
			json['error']['amount'] = sprintf(this.language.get('error_amount'), this.currency.format(this.config.get('config_voucher_min'), this.session.data['currency']), this.currency.format(this.config.get('config_voucher_max'), this.session.data['currency']));
		}

		if (!(this.request.post['agree'])) {
			json['error']['warning'] = this.language.get('error_agree');
		}

		if (!Object.keys(json.error).length) {
			let code = oc_token(10);
			this.session.data['vouchers'] = this.session.data['vouchers'] || [];
			this.session.data['vouchers'].push({
				'code': code,
				'description': sprintf(this.language.get('text_for'), this.currency.format(this.request.post['amount'], this.session.data['currency'], 1 + 0), this.request.post['to_name']),
				'to_name': this.request.post['to_name'],
				'to_email': this.request.post['to_email'],
				'from_name': this.request.post['from_name'],
				'from_email': this.request.post['from_email'],
				'voucher_theme_id': this.request.post['voucher_theme_id'],
				'message': this.request.post['message'],
				'amount': this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency'))
			});

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];

			json['redirect'] = await this.url.link('checkout/voucher.success', 'language=' + this.config.get('config_language'), true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async remove() {
		await this.load.language('checkout/voucher');

		const json = {};
		let key = '';
		if ((this.request.get['key'])) {
			key = this.request.get['key'];
		}

		if (!(this.session.data['vouchers'] && this.session.data['vouchers'] && this.session.data['vouchers'][key])) {
			json['error'] = this.language.get('error_voucher');
		}

		if (!Object.keys(json).length) {
			if (await this.cart.hasProducts()(this.session.data['vouchers'] && this.session.data['vouchers'].length)) {
				json['success'] = this.language.get('text_remove');
			} else {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
			}

			delete this.session.data['vouchers'][key];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async success() {
		const data = {};
		await this.load.language('checkout/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('checkout/voucher', 'language=' + this.config.get('config_language'))
		});

		data['continue'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}
