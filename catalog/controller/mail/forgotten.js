const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Forgotten extends Controller {
	// catalog/model/account/customer/editCode/after
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		if (args[0] && args[1]) {
			const data = {};
			this.load.model('account/customer', this);

			const customer_info = await this.model_account_customer.getCustomerByEmail(args[0]);

			if (customer_info.customer_id) {
				await this.load.language('mail/forgotten');

				let store_name = html_entity_decode(this.config.get('config_name'));

				let subject = sprintf(this.language.get('text_subject'), store_name);

				data['text_greeting'] = sprintf(this.language.get('text_greeting'), store_name);

				data['reset'] = await this.url.link('account/forgotten.reset', 'language=' + this.config.get('config_language') + '&email=' + encodeURIComponent(args[0]) + '&code=' + args[1], true);
				data['ip'] = (this.request.server.headers['x-forwarded-for'] ||
					this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress);

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
					mail.setTo(args[0]);
					mail.setFrom(this.config.get('config_email'));
					mail.setSender(store_name);
					mail.setSubject(subject);
					mail.setHtml(await this.load.view('mail/forgotten', data));
					await mail.send();
				}
			}
		}
	}
}
