module.exports = class CustomerController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async approve(route, args, output) {
		const data = {};
		if ((args[0])) {
			customer_id = args[0];
		} else {
			customer_id = 0;
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info) {
			this.load.model('setting/store', this);

			const store_info = await this.model_setting_store.getStore(customer_info['store_id']);
			let store_logo = html_entity_decode(this.config.get('config_logo'));
			let store_name = html_entity_decode(this.config.get('config_name'));
			let store_url = HTTP_CATALOG;
			if (store_info && store_info.store_id) {
				this.load.model('setting/setting', this);

				store_logo = html_entity_decode(this.model_setting_setting.getValue('config_logo', store_info['store_id']));
				store_name = html_entity_decode(store_info['name']);
				store_url = store_info['url'];
			}

			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(customer_info['language_id']);

			let language_code = this.config.get('config_language');
			if (language_info) {
				language_code = language_info['code'];
			}

			// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool.
			await this.load.language('default', 'mail', language_code);
			await this.load.language('mail/customer_approve', 'mail', language_code);

			// Add language vars to the template folder
			const results = this.language.all('mail');

			for (let [key, value] of Object.entries(results)) {
				data[key] = value;
			}

			this.load.model('tool/image', this);

			if (is_file(DIR_IMAGE + store_logo)) {
				data['logo'] = store_url + 'image/' + store_logo;
			} else {
				data['logo'] = '';
			}

			subject = sprintf(this.language.get('mail_text_subject'), store_name);

			data['text_welcome'] = sprintf(this.language.get('mail_text_welcome'), store_name);

			data['login'] = store_url + 'account/login';

			data['store'] = store_name;
			data['store_url'] = store_url;

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
				mail.setTo(customer_info['email']);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(store_name);
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/customer_approve', data));
				await mail.send();
			}
		}
	}

	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async deny(route, args, output) {
		if ((args[0])) {
			customer_id = args[0];
		} else {
			customer_id = 0;
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info) {
			this.load.model('setting/store', this);

			const store_info = await this.model_setting_store.getStore(customer_info['store_id']);

			if (store_info && store_info.store_id) {
				this.load.model('setting/setting', this);

				store_logo = html_entity_decode(this.model_setting_setting.getValue('config_logo', customer_info['store_id']));
				store_name = html_entity_decode(store_info['name']);
				store_url = store_info['url'];
			} else {
				store_logo = html_entity_decode(this.config.get('config_logo'));
				store_name = html_entity_decode(this.config.get('config_name'));
				store_url = HTTP_CATALOG;
			}

			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(customer_info['language_id']);

			let language_code = this.config.get('config_language');
			if (language_info) {
				language_code = language_info['code'];
			}

			// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool.
			await this.load.language('default', 'mail', language_code);
			await this.load.language('mail/customer_deny', 'mail', language_code);

			// Add language vars to the template folder
			const results = this.language.all('mail');

			for (let [key, value] of Object.entries(results)) {
				data[key] = value;
			}

			this.load.model('tool/image', this);

			if (is_file(DIR_IMAGE + store_logo)) {
				data['logo'] = store_url + 'image/' + store_logo;
			} else {
				data['logo'] = '';
			}

			subject = sprintf(this.language.get('mail_text_subject'), store_name);

			data['text_welcome'] = sprintf(this.language.get('mail_text_welcome'), store_name);

			data['contact'] = store_url + 'information/contact';

			data['store'] = store_name;
			data['store_url'] = store_url;

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
				mail.setTo(customer_info['email']);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(store_name);
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/customer_deny', data));
				await mail.send();
			}
		}
	}
}
