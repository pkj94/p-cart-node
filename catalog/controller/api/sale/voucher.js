module.exports = class Voucher extends global['\Opencart\System\Engine\Controller'] {
	// Apply voucher
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('api/sale/voucher');

		const json = {};

		if ((this.request.post['voucher'])) {
			voucher = this.request.post['voucher'];
		} else {
			voucher = '';
		}

		if (voucher) {
			this.load.model('checkout/voucher',this);

			voucher_info = await this.model_checkout_voucher.getVoucher(voucher);

			if (!voucher_info) {
				json['error'] = this.language.get('error_voucher');
			}
		}

		if (!Object.keys(json).length) {
			if (voucher) {
				this.session.data['voucher'] = this.request.post['voucher'];

				json['success'] = this.language.get('text_success');
			} else {
				delete (this.session.data['voucher']);

				json['success'] = this.language.get('text_remove');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async add() {
		await this.load.language('api/sale/voucher');

		const json = {};

		// Add keys for missing post vars
		keys = [
			'from_name',
			'from_email',
			'to_name',
			'to_email',
			'voucher_theme_id',
			'message',
			'amount'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		// Add a new voucher if set
		if ((oc_strlen(this.request.post['from_name']) < 1) || (oc_strlen(this.request.post['from_name']) > 64)) {
			json['error']['from_name'] = this.language.get('error_from_name');
		}

		if ((oc_strlen(this.request.post['from_email']) > 96) || !filter_var(this.request.post['from_email'], FILTER_VALIDATE_EMAIL)) {
			json['error']['from_email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['to_name']) < 1) || (oc_strlen(this.request.post['to_name']) > 64)) {
			json['error']['to_name'] = this.language.get('error_to_name');
		}

		if ((oc_strlen(this.request.post['to_email']) > 96) || !filter_var(this.request.post['to_email'], FILTER_VALIDATE_EMAIL)) {
			json['error']['to_email'] = this.language.get('error_email');
		}

		if ((this.request.post['amount'] < this.config.get('config_voucher_min')) || (this.request.post['amount'] > this.config.get('config_voucher_max'))) {
			json['error']['amount'] = sprintf(this.language.get('error_amount'), this.currency.format(this.config.get('config_voucher_min'), this.session.data['currency']), this.currency.format(this.config.get('config_voucher_max'), this.session.data['currency']));
		}

		if (!Object.keys(json).length) {
			code = oc_token();

			this.session.data['vouchers'].push({
				'code': code,
				'description': sprintf(this.language.get('text_for'), this.currency.format(this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency')), this.session.data['currency']), this.request.post['to_name']),
				'to_name': this.request.post['to_name'],
				'to_email': this.request.post['to_email'],
				'from_name': this.request.post['from_name'],
				'from_email': this.request.post['from_email'],
				'voucher_theme_id': this.request.post['voucher_theme_id'],
				'message': this.request.post['message'],
				'amount': this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency'))
			});

			json['success'] = this.language.get('text_cart');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async remove() {
		await this.load.language('api/sale/cart');

		const json = {};

		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		} else {
			key = '';
		}

		if (!(this.session.data['vouchers'][key])) {
			json['error'] = this.language.get('error_voucher');
		}

		// Remove
		if (!Object.keys(json).length) {
			json['success'] = this.language.get('text_success');

			delete (this.session.data['vouchers'][key]);
			delete (this.session.data['reward']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
