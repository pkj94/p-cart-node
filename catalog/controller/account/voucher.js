const mt_rand = require("locutus/php/math/mt_rand");
const is_numeric = require("locutus/php/var/is_numeric");

module.exports = class ControllerAccountVoucher extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('account/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		if (!(this.session.data['vouchers'])) {
			this.session.data['vouchers'] = [];
		}

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			this.session.data['vouchers'][mt_rand()] = {
				'description': sprintf(this.language.get('text_for'), this.currency.format(this.request.post['amount'], this.session.data['currency'], 1 + 0), this.request.post['to_name']),
				'to_name': this.request.post['to_name'],
				'to_email': this.request.post['to_email'],
				'from_name': this.request.post['from_name'],
				'from_email': this.request.post['from_email'],
				'voucher_theme_id': this.request.post['voucher_theme_id'],
				'message': this.request.post['message'],
				'amount': this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency'))
			};
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('account/voucher/success'));
		} else {

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home')
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_account'),
				'href': await this.url.link('account/account', '', true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_voucher'),
				'href': await this.url.link('account/voucher', '', true)
			});

			data['help_amount'] = sprintf(this.language.get('help_amount'), this.currency.format(this.config.get('config_voucher_min'), this.session.data['currency']), this.currency.format(this.config.get('config_voucher_max'), this.session.data['currency']));

			if ((this.error['warning'])) {
				data['error_warning'] = this.error['warning'];
			} else {
				data['error_warning'] = '';
			}

			if ((this.error['to_name'])) {
				data['error_to_name'] = this.error['to_name'];
			} else {
				data['error_to_name'] = '';
			}

			if ((this.error['to_email'])) {
				data['error_to_email'] = this.error['to_email'];
			} else {
				data['error_to_email'] = '';
			}

			if ((this.error['from_name'])) {
				data['error_from_name'] = this.error['from_name'];
			} else {
				data['error_from_name'] = '';
			}

			if ((this.error['from_email'])) {
				data['error_from_email'] = this.error['from_email'];
			} else {
				data['error_from_email'] = '';
			}

			if ((this.error['theme'])) {
				data['error_theme'] = this.error['theme'];
			} else {
				data['error_theme'] = '';
			}

			if ((this.error['amount'])) {
				data['error_amount'] = this.error['amount'];
			} else {
				data['error_amount'] = '';
			}

			data['action'] = await this.url.link('account/voucher', '', true);

			if ((this.request.post['to_name'])) {
				data['to_name'] = this.request.post['to_name'];
			} else {
				data['to_name'] = '';
			}

			if ((this.request.post['to_email'])) {
				data['to_email'] = this.request.post['to_email'];
			} else {
				data['to_email'] = '';
			}

			if ((this.request.post['from_name'])) {
				data['from_name'] = this.request.post['from_name'];
			} else if (await this.customer.isLogged()) {
				data['from_name'] = await this.customer.getFirstName() + ' ' + await this.customer.getLastName();
			} else {
				data['from_name'] = '';
			}

			if ((this.request.post['from_email'])) {
				data['from_email'] = this.request.post['from_email'];
			} else if (await this.customer.isLogged()) {
				data['from_email'] = await this.customer.getEmail();
			} else {
				data['from_email'] = '';
			}

			this.load.model('extension/total/voucher_theme', this);

			data['voucher_themes'] = await this.model_extension_total_voucher_theme.getVoucherThemes();

			if ((this.request.post['voucher_theme_id'])) {
				data['voucher_theme_id'] = this.request.post['voucher_theme_id'];
			} else {
				data['voucher_theme_id'] = '';
			}

			if ((this.request.post['message'])) {
				data['message'] = this.request.post['message'];
			} else {
				data['message'] = '';
			}

			if ((this.request.post['amount'])) {
				data['amount'] = this.request.post['amount'];
			} else {
				data['amount'] = this.currency.format(this.config.get('config_voucher_min'), this.config.get('config_currency'), false, false);
			}

			if ((this.request.post['agree'])) {
				data['agree'] = this.request.post['agree'];
			} else {
				data['agree'] = false;
			}

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			this.response.setOutput(await this.load.view('account/voucher', data));
		}
	}

	async success() {
		const data = {};
		await this.load.language('account/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/voucher')
		});

		data['continue'] = await this.url.link('checkout/cart');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}

	async validate() {
		if ((utf8_strlen(this.request.post['to_name']) < 1) || (utf8_strlen(this.request.post['to_name']) > 64)) {
			this.error['to_name'] = this.language.get('error_to_name');
		}

		if ((utf8_strlen(this.request.post['to_email']) > 96) || !isEmailValid(this.request.post['to_email'])) {
			this.error['to_email'] = this.language.get('error_email');
		}

		if ((utf8_strlen(this.request.post['from_name']) < 1) || (utf8_strlen(this.request.post['from_name']) > 64)) {
			this.error['from_name'] = this.language.get('error_from_name');
		}

		if ((utf8_strlen(this.request.post['from_email']) > 96) || !isEmailValid(this.request.post['from_email'])) {
			this.error['from_email'] = this.language.get('error_email');
		}

		if (!(this.request.post['voucher_theme_id'])) {
			this.error['theme'] = this.language.get('error_theme');
		}

		if ((!(this.request.post['amount'])) || (!is_numeric(this.request.post['amount'])) || (this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency')) < this.config.get('config_voucher_min')) || (this.currency.convert(this.request.post['amount'], this.session.data['currency'], this.config.get('config_currency')) > this.config.get('config_voucher_max'))) {
			this.error['amount'] = sprintf(this.language.get('error_amount'), this.currency.format(this.config.get('config_voucher_min'), this.session.data['currency']), this.currency.format(this.config.get('config_voucher_max'), this.session.data['currency']));
		}

		if (!(this.request.post['agree'])) {
			this.error['warning'] = this.language.get('error_agree');
		}

		return !Object.keys(this.error).length;
	}
}
