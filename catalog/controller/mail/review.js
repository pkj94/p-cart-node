const nl2br = require("locutus/php/strings/nl2br");

module.exports = class Review extends global['\Opencart\System\Engine\Controller'] {
	// catalog/model/catalog/review/addReview/after
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		if (this.config.get('config_mail_alert').includes('review')) {
			const data = {};
			await this.load.language('mail/review');

			this.load.model('catalog/product', this);

			const product_info = await this.model_catalog_product.getProduct(args[0]);

			if (product_info.product_id) {
				let store_name = html_entity_decode(this.config.get('config_name'));

				let subject = sprintf(this.language.get('text_subject'), store_name);

				data['product'] = html_entity_decode(product_info['name']);
				data['reviewer'] = html_entity_decode(args[1]['name']);
				data['rating'] = args[1]['rating'];
				data['text'] = nl2br(args[1]['text']);

				data['store'] = store_name;
				data['store_url'] = this.config.get('config_url');

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
					mail.setTo(this.config.get('config_email'));
					mail.setFrom(this.config.get('config_email'));
					mail.setSender(store_name);
					mail.setSubject(subject);
					mail.setHtml(await this.load.view('mail/review', data));
					await mail.send();

					// Send to additional alert emails
					let emails = this.config.get('config_mail_alert_email').split(',');

					for (let email of emails) {
						if (email && isEmailValid(email)) {
							mail.setTo(trim(email));
							await mail.send();
						}
					}
				}
			}
		}
	}
}
