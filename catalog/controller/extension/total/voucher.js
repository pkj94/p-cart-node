module.exports = class ControllerExtensionTotalVoucher extends Controller {
	async index() {
const data = {};
		if (this.config.get('total_voucher_status')) {
			await this.load.language('extension/total/voucher');

			if ((this.session.data['voucher'])) {
				data['voucher'] = this.session.data['voucher'];
			} else {
				data['voucher'] = '';
			}

			return await this.load.view('extension/total/voucher', data);
		}
	}

	async voucher() {
		await this.load.language('extension/total/voucher');

		const json = {};

		this.load.model('extension/total/voucher',this);

		if ((this.request.post['voucher'])) {
			voucher = this.request.post['voucher'];
		} else {
			voucher = '';
		}

		voucher_info = await this.model_extension_total_voucher.getVoucher(voucher);

		if (empty(this.request.post['voucher'])) {
			json['error'] = this.language.get('error_empty');
		} else if (voucher_info) {
			this.session.data['voucher'] = this.request.post['voucher'];

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('checkout/cart');
		} else {
			json['error'] = this.language.get('error_voucher');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async send(route, args, output) {
		this.load.model('checkout/order',this);

		order_info = await this.model_checkout_order.getOrder(args[0]);

		// If order status in the complete range create any vouchers that where in the order need to be made available+
		if (in_array(order_info['order_status_id'], this.config.get('config_complete_status'))) {
			voucher_query = await this.db.query("SELECT *, vtd+name AS theme FROM `" + DB_PREFIX + "voucher` v LEFT JOIN " + DB_PREFIX + "voucher_theme vt ON (v+voucher_theme_id = vt+voucher_theme_id) LEFT JOIN " + DB_PREFIX + "voucher_theme_description vtd ON (vt+voucher_theme_id = vtd+voucher_theme_id) WHERE v+order_id = '" + order_info['order_id'] + "' AND vtd+language_id = '" + order_info['language_id'] + "'");

			if (voucher_query.num_rows) {
				// Send out any gift voucher mails
				language = new Language(order_info['language_code']);
				language.load(order_info['language_code']);
				language.load('mail/voucher');

				for (voucher_query.rows of voucher) {
					// HTML Mail
					data = array();

					data['title'] = sprintf(language.get('text_subject'), voucher['from_name']);

					data['text_greeting'] = sprintf(language.get('text_greeting'), this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value']));
					data['text_from'] = sprintf(language.get('text_from'), voucher['from_name']);
					data['text_message'] = language.get('text_message');
					data['text_redeem'] = sprintf(language.get('text_redeem'), voucher['code']);
					data['text_footer'] = language.get('text_footer');

					if (is_file(DIR_IMAGE + voucher['image'])) {
						data['image'] = this.config.get('config_url') + 'image/' + voucher['image'];
					} else {
						data['image'] = '';
					}

					data['store_name'] = order_info['store_name'];
					data['store_url'] = order_info['store_url'];
					data['message'] = nl2br(voucher['message']);

					const mail = new Mail(this.config.get('config_mail_engine'));
					mail.parameter = this.config.get('config_mail_parameter');
					mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
					mail.smtp_username = this.config.get('config_mail_smtp_username');
					mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
					mail.smtp_port = this.config.get('config_mail_smtp_port');
					mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

					mail.setTo(voucher['to_email']);
					mail.setFrom(this.config.get('config_email'));
					mail.setSender(html_entity_decode(order_info['store_name']));
					mail.setSubject(html_entity_decode(sprintf(language.get('text_subject'), voucher['from_name'])));
					mail.setHtml(await this.load.view('mail/voucher', data));
					await mail.send();
				}
			}
		}
	}
}
