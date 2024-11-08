const nl2br = require("locutus/php/strings/nl2br");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Voucher extends Controller {
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		const data = {};
		this.load.model('checkout/order', this);

		const order_info = await this.model_checkout_order.getOrder(args[0]);

		// If order status in the complete range create any vouchers that where in the order need to be made available+
		if (order_info.order_id && this.config.get('config_complete_status').includes(order_info['order_status_id'])) {
			// Send out any gift voucher mails
			const voucher_query = await this.db.query("SELECT *, vtd+name AS theme FROM `" + DB_PREFIX + "voucher` v LEFT JOIN `" + DB_PREFIX + "voucher_theme` vt ON (v.`voucher_theme_id` = vt.`voucher_theme_id`) LEFT JOIN `" + DB_PREFIX + "voucher_theme_description` vtd ON (vt.`voucher_theme_id` = vtd.`voucher_theme_id`) WHERE v.`order_id` = '" + order_info['order_id'] + "' AND vtd.`language_id` = '" + order_info['language_id'] + "'");

			if (voucher_query.num_rows) {
				// Send the email in the correct language
				this.load.model('localisation/language', this);

				const language_info = await this.model_localisation_language.getLanguage(order_info['language_id']);
				let language_code = this.config.get('config_language');
				if (language_info.language_id) {
					language_code = language_info['code'];
				}

				// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool+
				await this.load.language('default', 'mail', language_code);
				await this.load.language('mail/voucher', 'mail', language_code);

				// Add language vars to the template folder
				const results = this.language.all('mail');

				for (let [key, value] of Object.entries(results)) {
					data[key] = value;
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

					const mail = new global['\Opencart\System\Library\Mail'](this.config.get('config_mail_engine'), mail_option);

					for (let voucher of voucher_query.rows) {
						const data = {};
						let from_name = html_entity_decode(voucher['from_name']);

						// HTML Mail
						let subject = sprintf(this.language.get('mail_text_subject'), from_name);

						data['title'] = sprintf(this.language.get('mail_text_subject'), from_name);

						data['text_greeting'] = sprintf(this.language.get('mail_text_greeting'), this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value']));
						data['text_from'] = sprintf(this.language.get('mail_text_from'), from_name);
						data['text_redeem'] = sprintf(this.language.get('mail_text_redeem'), voucher['code']);

						if (voucher['image'] && is_file(DIR_IMAGE + voucher['image'])) {
							data['image'] = this.config.get('config_url') + 'image/' + voucher['image'];
						} else {
							data['image'] = '';
						}

						data['message'] = nl2br(voucher['message']);

						data['store_name'] = order_info['store_name'];
						data['store_url'] = order_info['store_url'];

						mail.setTo(voucher['to_email']);
						mail.setFrom(this.config.get('config_email'));
						mail.setSender(html_entity_decode(order_info['store_name']));
						mail.setSubject(subject);
						mail.setHtml(await this.load.view('mail/voucher', data));
						await mail.send();
					}
				}
			}
		}
	}
}
