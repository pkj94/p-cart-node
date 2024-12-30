const mt_rand = require("locutus/php/math/mt_rand");

module.exports = class ControllerApiVoucher extends Controller {
	async index() {
		await this.load.language('api/voucher');

		// Delete past voucher in case there is an error
		delete this.session.data['voucher'];

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/total/voucher', this);
			let voucher = '';
			if ((this.request.post['voucher'])) {
				voucher = this.request.post['voucher'];
			}

			const voucher_info = await this.model_extension_total_voucher.getVoucher(voucher);

			if (voucher_info.voucher_id) {
				this.session.data['voucher'] = this.request.post['voucher'];

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_voucher');
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async add() {
		await this.load.language('api/voucher');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error']['warning'] = this.language.get('error_permission');
		} else {
			// Add keys for missing post vars
			const keys = [
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

			if ((this.request.post['voucher'])) {
				this.session.data['vouchers'] = {};

				for (let voucher of this.request.post['voucher']) {
					if ((voucher['code']) && (voucher['to_name']) && (voucher['to_email']) && (voucher['from_name']) && (voucher['from_email']) && (voucher['voucher_theme_id']) && (voucher['message']) && (voucher['amount'])) {
						this.session.data['vouchers'][voucher['code']] = {
							'code': voucher['code'],
							'description': sprintf(this.language.get('text_for'), this.currency.format(this.currency.convert(voucher['amount'], this.session.data['currency'], this.config.get('config_currency')), this.session.data['currency']), voucher['to_name']),
							'to_name': voucher['to_name'],
							'to_email': voucher['to_email'],
							'from_name': voucher['from_name'],
							'from_email': voucher['from_email'],
							'voucher_theme_id': voucher['voucher_theme_id'],
							'message': voucher['message'],
							'amount': this.currency.convert(voucher['amount'], this.session.data['currency'], this.config.get('config_currency'))
						};
					}
				}

				json['success'] = this.language.get('text_cart');

				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
			} else {
				// Add a new voucher if set
				if ((utf8_strlen(this.request.post['from_name']) < 1) || (utf8_strlen(this.request.post['from_name']) > 64)) {
					json['error'] = json['error'] || {};
					json['error']['from_name'] = this.language.get('error_from_name');
				}

				if ((utf8_strlen(this.request.post['from_email']) > 96) || !isEmailValid(this.request.post['from_email'])) {
					json['error'] = json['error'] || {};
					json['error']['from_email'] = this.language.get('error_email');
				}

				if ((utf8_strlen(this.request.post['to_name']) < 1) || (utf8_strlen(this.request.post['to_name']) > 64)) {
					json['error'] = json['error'] || {};
					json['error']['to_name'] = this.language.get('error_to_name');
				}

				if ((utf8_strlen(this.request.post['to_email']) > 96) || !isEmailValid(this.request.post['to_email'])) {
					json['error'] = json['error'] || {};
					json['error']['to_email'] = this.language.get('error_email');
				}

				if ((this.request.post['amount'] < this.config.get('config_voucher_min')) || (this.request.post['amount'] > this.config.get('config_voucher_max'))) {
					json['error'] = json['error'] || {};
					json['error']['amount'] = sprintf(this.language.get('error_amount'), this.currency.format(this.config.get('config_voucher_min'), this.session.data['currency']), this.currency.format(this.config.get('config_voucher_max'), this.session.data['currency']));
				}

				if (!Object.keys(json).length) {
					const code = mt_rand();
					this.session.data['vouchers'] = this.session.data['vouchers'] || {};
					this.session.data['vouchers'][code] = {
						'code': code,
						'description': sprintf(this.language.get('text_for'), this.currency.format(this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency')), this.session.data['currency']), this.request.post['to_name']),
						'to_name': this.request.post['to_name'],
						'to_email': this.request.post['to_email'],
						'from_name': this.request.post['from_name'],
						'from_email': this.request.post['from_email'],
						'voucher_theme_id': this.request.post['voucher_theme_id'],
						'message': this.request.post['message'],
						'amount': this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency'))
					};

					json['success'] = this.language.get('text_cart');

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
					delete this.session.data['payment_method'];
					delete this.session.data['payment_methods'];
				}
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
