module.exports = class AuthorizeController extends global['\Opencart\System\Engine\Controller'] {
	// admin/model/user/user/editCode/after
	/**
	 * @param route
	 * @param args
	 * @param output
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

		email = this.user.getEmail();

		if ((this.session.data['code'])) {
			code = this.session.data['code'];
		} else {
			code = '';
		}

		if (email && code && (route == 'common/authorize.send') && isEmailValid(email)) {
			await this.load.language('mail/authorize');

			data['username'] = this.user.getUsername();
			data['code'] = code;
			data['ip'] = this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : '');
			data['store'] = html_entity_decode(this.config.get('config_name'));

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
				mail.setSender(this.config.get('config_name'));
				mail.setSubject(this.language.get('text_subject'));
				mail.setText(await this.load.view('mail/authorize', data));
				await mail.send();
			}
		}
	}

	// admin/model/user/user/editCode/after

	/**
	 * @param route
	 * @param args
	 * @param output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async reset(route, args, output) {
		if ((this.request.get['route'])) {
			route = this.request.get['route'];
		} else {
			route = '';
		}

		if ((args[0])) {
			email = args[0];
		} else {
			email = '';
		}

		if ((args[1])) {
			code = args[1];
		} else {
			code = '';
		}

		if (email && code && (route == 'common/authorize.confirm') && isEmailValid(email)) {
			await this.load.language('mail/authorize_reset');

			data['username'] = this.user.getUsername();
			data['reset'] = await this.url.link('common/authorize.reset', 'email=' + email + '&code=' + code, true);
			data['ip'] = this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : '');
			data['store'] = html_entity_decode(this.config.get('config_name'));

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
				mail.setSender(this.config.get('config_name'));
				mail.setSubject(this.language.get('text_subject'));
				mail.setText(await this.load.view('mail/authorize_reset', data));
				await mail.send();
			}
		}
	}
}
