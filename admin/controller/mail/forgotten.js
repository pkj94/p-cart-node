module.exports = class ForgottenController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 *
	 * admin/model/user/user/editCode/after
	 *
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		if ((this.request.get['route'])) {
			route = this.request.get['route'];
		} else {
			route = '';
		}

		if ((args[0])) {
			email = decodeURIComponent(args[0]);
		} else {
			email = '';
		}

		if ((args[1])) {
			code = args[1];
		} else {
			code = '';
		}

		if (email && code && (route == 'common/forgotten.confirm') && isEmailValid(email)) {
			await this.load.language('mail/forgotten');

			store_name = html_entity_decode(this.config.get('config_name'));

			subject = sprintf(this.language.get('text_subject'), store_name);

			data['text_greeting'] = sprintf(this.language.get('text_greeting'), store_name);

			data['reset'] = await this.url.link('common/forgotten.reset', 'email=' + email + '&code=' + code, true);
			data['ip'] = this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : '');

			data['store'] = store_name;
			data['store_url'] = this.config.get('config_store_url');

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
				mail.setTo(email);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(store_name);
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/forgotten', data));
				await mail.send();
			}
		}
	}
}
