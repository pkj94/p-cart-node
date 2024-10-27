module.exports = class Gdpr extends global['\Opencart\System\Engine\Controller'] {
	// catalog/model/account/gdpr/addGdpr
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		// args[0] code
		// args[1] email
		// args[2] action

		if ((args[0])) {
			code = args[0];
		} else {
			code = '';
		}

		if ((args[1])) {
			email = args[1];
		} else {
			email = '';
		}

		if ((args[2])) {
			action = args[2];
		} else {
			action = '';
		}

		await this.load.language('mail/gdpr');

		store_name = html_entity_decode(this.config.get('config_name'));

		if (this.config.get('config_logo')) {
			data['logo'] = this.config.get('config_url') + 'image/' + html_entity_decode(this.config.get('config_logo'));
		} else {
			data['logo'] = '';
		}

		data['text_request'] = this.language.get('text_' + action);

		data['button_confirm'] = this.language.get('button_' + action);

		data['confirm'] = await this.url.link('information/gdpr+success', 'language=' + this.config.get('config_language') + '&code=' + code, true);

		data['ip'] = (this.request.server.headers['x-forwarded-for'] ||
			this.request.server.connection.remoteAddress ||
			this.request.server.socket.remoteAddress ||
			this.request.server.connection.socket.remoteAddress);

		data['store_name'] = store_name;
		data['store_url'] = this.config.get('config_url');

		if (this.config.get('config_mail_engine') && email) {
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
			mail.setSubject(sprintf(this.language.get('text_subject'), store_name));
			mail.setHtml(await this.load.view('mail/gdpr', data));
			await mail.send();
		}
	}

	// catalog/model/account/gdpr/editStatus/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async remove(route, args, output) {
		if ((args[0])) {
			gdpr_id = args[0];
		} else {
			gdpr_id = 0;
		}

		if ((args[1])) {
			status = args[1];
		} else {
			status = 0;
		}

		this.load.model('account/gdpr');

		gdpr_info = await this.model_account_gdpr.getGdpr(gdpr_id);

		if (gdpr_info && gdpr_info['action'] == 'remove' && status == 3) {
			this.load.model('setting/store', this);

			const store_info = await this.model_setting_store.getStore(gdpr_info['store_id']);

			if (store_info) {
				this.load.model('setting/setting', this);

				store_logo = html_entity_decode(await this.model_setting_setting.getValue('config_logo', store_info['store_id']));
				store_name = html_entity_decode(store_info['name']);
				store_url = store_info['url'];
			} else {
				store_logo = html_entity_decode(this.config.get('config_logo'));
				store_name = html_entity_decode(this.config.get('config_name'));
				store_url = HTTP_SERVER;
			}

			// Send the email in the correct language
			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(gdpr_info['language_id']);

			if (language_info) {
				language_code = language_info['code'];
			} else {
				language_code = this.config.get('config_language');
			}

			// Load the language for any mails using a different country code and prefixing it so that it does not pollute the main data pool+
			await this.load.language('default', 'mail', language_code);
			await this.load.language('mail/gdpr_delete', 'mail', language_code);

			// Add language vars to the template folder
			const results = this.language.all('mail');

			for (let [key, value] of Object.entries(results)) {
				data[key] = value;
			}

			subject = sprintf(this.language.get('mail_text_subject'), store_name);

			this.load.model('tool/image', this);

			if (is_file(DIR_IMAGE + store_logo)) {
				data['logo'] = store_url + 'image/' + store_logo;
			} else {
				data['logo'] = '';
			}

			this.load.model('account/customer', this);

			customer_info = await this.model_account_customer.getCustomerByEmail(gdpr_info['email']);

			if (customer_info.customer_id) {
				data['text_hello'] = sprintf(this.language.get('mail_text_hello'), html_entity_decode(customer_info['firstname']));
			} else {
				data['text_hello'] = sprintf(this.language.get('mail_text_hello'), this.language.get('mail_text_user'));
			}

			data['store_name'] = store_name;
			data['store_url'] = store_url;
			data['contact'] = store_url + 'information/contact';

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
				mail.setTo(gdpr_info['email']);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(store_name);
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/gdpr_delete', data));
				await mail.send();
			}
		}
	}
}
