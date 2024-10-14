const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
const nl2br = require("locutus/php/strings/nl2br");
module.exports = class VoucherController extends Controller {
	/**
	 * @param int voucher_id
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(voucher_id) {
		const data = {};
		this.load.model('sale/order', this);

		const voucher_info = await this.model_sale_voucher.getVoucher(voucher_id);
		if (voucher_info.voucher_id) {
			// If voucher does not belong to an order
			await this.load.language('mail/voucher');
			let order_id = 0;
			if (voucher_info['order_id']) {
				order_id = voucher_info['order_id'];
			}

			const order_info = await this.model_sale_order.getOrder(order_id);
			let subject;
			let store_name;
			// If voucher belongs to an order
			if (order_info.order_id) {
				this.load.model('localisation/language', this);

				const language_info = await this.model_localisation_language.getLanguage(order_info['language_id']);
				let language_code = this.config.get('config_language');
				if (language_info) {
					language_code = language_info['code'];
				}

				await this.load.language('default', 'mail', language_code);
				await this.load.language('mail/voucher', 'mail', language_code);

				store_name = html_entity_decode(order_info['store_name']);

				// Add language vars to the template folder
				let results = this.language.all('mail');

				for (let [key, value] of Object.entries(results)) {
					data[key] = value;
				}

				let from_name = html_entity_decode(voucher_info['from_name']);

				subject = sprintf(this.language.get('mail_text_subject'), from_name);

				// HTML Mail
				data['title'] = sprintf(this.language.get('mail_text_subject'), from_name);

				data['text_greeting'] = sprintf(this.language.get('mail_text_greeting'), this.currency.format(voucher_info['amount'], ((order_info['currency_code']) ? order_info['currency_code'] : this.config.get('config_currency')), ((order_info['currency_value']) ? order_info['currency_value'] : this.currency.getValue(this.config.get('config_currency')))));
				data['text_from'] = sprintf(this.language.get('mail_text_from'), from_name);
				data['text_redeem'] = sprintf(this.language.get('mail_text_redeem'), voucher_info['code']);

				this.load.model('sale/voucher_theme', this);

				const voucher_theme_info = await this.model_sale_voucher_theme.getVoucherTheme(voucher_info['voucher_theme_id']);

				if (voucher_theme_info.voucher_theme_id && voucher_theme_info['image'] && fs.existsSync(DIR_IMAGE + voucher_theme_info['image'])) {
					data['image'] = HTTP_CATALOG + 'image/' + voucher_theme_info['image'];
				} else {
					data['image'] = '';
				}

				data['message'] = nl2br(voucher_info['message']);

				data['store_name'] = store_name;
				data['store_url'] = order_info['store_url'];
			} else {
				store_name = html_entity_decode(this.config.get('config_name'));

				let from_name = html_entity_decode(voucher_info['from_name']);

				subject = html_entity_decode(sprintf(this.language.get('text_subject'), from_name));

				data['title'] = sprintf(this.language.get('text_subject'), from_name);

				data['text_greeting'] = sprintf(this.language.get('text_greeting'), this.currency.format(voucher_info['amount'], this.config.get('config_currency')));
				data['text_from'] = sprintf(this.language.get('text_from'), from_name);
				data['text_redeem'] = sprintf(this.language.get('text_redeem'), voucher_info['code']);

				this.load.model('sale/voucher_theme', this);

				const voucher_theme_info = await this.model_sale_voucher_theme.getVoucherTheme(voucher_info['voucher_theme_id']);

				if (voucher_theme_info && voucher_theme_info['image'] && fs.existsSync(DIR_IMAGE + voucher_theme_info['image'])) {
					data['image'] = HTTP_CATALOG + 'image/' + voucher_theme_info['image'];
				} else {
					data['image'] = '';
				}

				data['message'] = nl2br(voucher_info['message']);

				data['store_name'] = store_name;
				data['store_url'] = HTTP_CATALOG;
			}
			
			if (this.config.get('config_mail_engine')) {
				let mail_option = {
					'parameter': this.config.get('config_mail_parameter'),
					'smtp_hostname': this.config.get('config_mail_smtp_hostname'),
					'smtp_username': this.config.get('config_mail_smtp_username'),
					'smtp_password': html_entity_decode(this.config.get('config_mail_smtp_password')),
					'smtp_port': this.config.get('config_mail_smtp_port'),
					'smtp_timeout': this.config.get('config_mail_smtp_timeout')
				};
				console.log(this.config.get('config_mail_engine'), mail_option);
				const mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
				mail.setTo(voucher_info['to_email']);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(store_name);
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/voucher', data));
				await mail.send();
			}
		}
	}
}
