module.exports=class GdprController extends Controller {
	// admin/model/customer/gdpr/editStatus
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async index(string &route, array &args, mixed &output) {
		this.load.model('customer/gdpr',this);

		gdpr_info await this.model_customer_gdpr.getGdpr(args[0]);

		if (gdpr_info) {
			// Choose which mail to send

			// Export plus complete
			if (gdpr_info['action'] == 'export' && args[1] == 3) {
				this.export(gdpr_info);
			}

			// Approve plus processing
			if (gdpr_info['action'] == 'approve' && args[1] == 2) {
				this.approve(gdpr_info);
			}

			// Remove plus complete
			if (gdpr_info['action'] == 'remove' && args[1] == 3) {
				this.remove(gdpr_info);
			}

			// Deny
			if (args[1] == -1) {
				this.deny(gdpr_info);
			}
		}
	}

	/**
	 * @param array gdpr_info
	 *
	 * @return void
	 * @throws \Exception
	 */
	async export(array gdpr_info) {
		this.load.model('setting/store',this);

		store_info await this.model_setting_store.getStore(gdpr_info['store_id']);

		if (store_info && store_info.store_id) {
			this.load.model('setting/setting',this);

			store_logo = html_entity_decode(this.model_setting_setting.getValue('config_logo', store_info['store_id']));
			store_name = html_entity_decode(store_info['name']);
			store_url = store_info['url'];
		} else {
			store_logo = html_entity_decode(this.config.get('config_logo'));
			store_name = html_entity_decode(this.config.get('config_name'));
			store_url = HTTP_CATALOG;
		}

		// Send the email in the correct language
		this.load.model('localisation/language',this);

		const language_info = await this.model_localisation_language.getLanguage(gdpr_info['language_id']);

		if (language_info) {
			language_code = language_info['code'];
		} else {
			language_code = this.config.get('config_language');
		}

		// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool.
		await this.load.language('default', 'mail', language_code);
		await this.load.language('mail/gdpr_export', 'mail', language_code);

		// Add language vars to the template folder
		results = this.language.all('mail');

		for (let [key, value] of Object.entries(results)) {
			data[key] = value;
		}

		subject = sprintf(this.language.get('mail_text_subject'), store_name);

		if (is_file(DIR_IMAGE + store_logo)) {
			data['logo'] = store_url + 'image/' + store_logo;
		} else {
			data['logo'] = '';
		}

		this.load.model('customer/customer',this);

		const customer_info = await this.model_customer_customer.getCustomerByEmail(gdpr_info['email']);

		if (customer_info) {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), html_entity_decode(customer_info['firstname']));
		} else {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), this.language.get('mail_text_user'));
		}

		// Personal info
		if (customer_info) {
			data['customer_id'] = customer_info['customer_id'];
			data['firstname'] = customer_info['firstname'];
			data['lastname'] = customer_info['lastname'];
			data['email'] = customer_info['email'];
			data['telephone'] = customer_info['telephone'];
		}

		// Addresses
		data['addresses'] = [];

		if (customer_info) {
			const results = await this.model_customer_customer.getAddresses(customer_info['customer_id']);

			for (let result of results) {
				address = [
					'firstname' : result['firstname'],
					'lastname'  : result['lastname'],
					'address_1' : result['address_1'],
					'address_2' : result['address_2'],
					'city'      : result['city'],
					'postcode'  : result['postcode'],
					'country'   : result['country'],
					'zone'      : result['zone']
				];

				if (!in_array(address, data['addresses'])) {
					data['addresses'][] = address;
				}
			}
		}

		// Order Addresses
		this.load.model('sale/order',this);

		const results = await this.model_sale_order.getOrders(['filter_email' : gdpr_info['email']]);

		for (let result of results) {
			const order_info = await this.model_sale_order.getOrder(result['order_id']);

			if (order_info['payment_country_id']) {
				address = [
					'firstname' : order_info['payment_firstname'],
					'lastname'  : order_info['payment_lastname'],
					'address_1' : order_info['payment_address_1'],
					'address_2' : order_info['payment_address_2'],
					'city'      : order_info['payment_city'],
					'postcode'  : order_info['payment_postcode'],
					'country'   : order_info['payment_country'],
					'zone'      : order_info['payment_zone']
				];

				if (!in_array(address, data['addresses'])) {
					data['addresses'][] = address;
				}
			}

			if (order_info['shipping_country_id']) {
				address = [
					'firstname' : order_info['shipping_firstname'],
					'lastname'  : order_info['shipping_lastname'],
					'address_1' : order_info['shipping_address_1'],
					'address_2' : order_info['shipping_address_2'],
					'city'      : order_info['shipping_city'],
					'postcode'  : order_info['shipping_postcode'],
					'country'   : order_info['shipping_country'],
					'zone'      : order_info['shipping_zone']
				];

				if (!in_array(address, data['addresses'])) {
					data['addresses'][] = address;
				}
			}
		}

		// Ip's
		data['ips'] = [];

		if (customer_info) {
			const results = await this.model_customer_customer.getIps(customer_info['customer_id']);

			for (let result of results) {
				data['ips'].push({
					'ip'         : result['ip'],
					'date_added' : date(this.language.get('mail_datetime_format'), new Date(result['date_added']))
				];
			}
		}

		data['store_name'] = store_name;
		data['store_url'] = store_url;

		if (this.config.get('config_mail_engine')) {
			mail_option = [
				'parameter'     : this.config.get('config_mail_parameter'),
				'smtp_hostname' : this.config.get('config_mail_smtp_hostname'),
				'smtp_username' : this.config.get('config_mail_smtp_username'),
				'smtp_password' : html_entity_decode(this.config.get('config_mail_smtp_password')),
				'smtp_port'     : this.config.get('config_mail_smtp_port'),
				'smtp_timeout'  : this.config.get('config_mail_smtp_timeout')
			];

			mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
			mail.setTo(gdpr_info['email']);
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/gdpr_export', data));
			mail.send();
		}
	}

	/**
	 * @param array gdpr_info
	 *
	 * @return void
	 * @throws \Exception
	 */
	async approve(array gdpr_info) {
		this.load.model('setting/store',this);

		store_info await this.model_setting_store.getStore(gdpr_info['store_id']);

		if (store_info && store_info.store_id) {
			this.load.model('setting/setting',this);

			store_logo = html_entity_decode(this.model_setting_setting.getValue('config_logo', store_info['store_id']));
			store_name = html_entity_decode(store_info['name']);
			store_url = store_info['url'];
		} else {
			store_logo = html_entity_decode(this.config.get('config_logo'));
			store_name = html_entity_decode(this.config.get('config_name'));
			store_url = HTTP_CATALOG;
		}

		// Send the email in the correct language
		this.load.model('localisation/language',this);

		const language_info = await this.model_localisation_language.getLanguage(gdpr_info['language_id']);

		if (language_info) {
			language_code = language_info['code'];
		} else {
			language_code = this.config.get('config_language');
		}

		// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool.
		await this.load.language('default', 'mail', language_code);
		await this.load.language('mail/gdpr_approve', 'mail', language_code);

		// Add language vars to the template folder
		results = this.language.all('mail');

		for (let [key, value] of Object.entries(results)) {
			data[key] = value;
		}

		subject = sprintf(this.language.get('mail_text_subject'), store_name);

		this.load.model('tool/image',this);

		if (is_file(DIR_IMAGE + store_logo)) {
			data['logo'] = store_url + 'image/' + store_logo;
		} else {
			data['logo'] = '';
		}

		this.load.model('customer/customer',this);

		const customer_info = await this.model_customer_customer.getCustomerByEmail(gdpr_info['email']);

		if (customer_info) {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), html_entity_decode(customer_info['firstname']));
		} else {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), this.language.get('mail_text_user'));
		}

		data['text_gdpr'] = sprintf(this.language.get('mail_text_gdpr'), this.config.get('config_gdpr_limit'));
		data['text_a'] = sprintf(this.language.get('mail_text_a'), this.config.get('config_gdpr_limit'));

		data['store_name'] = store_name;
		data['store_url'] = store_url;

		if (this.config.get('config_mail_engine')) {
			mail_option = [
				'parameter'     : this.config.get('config_mail_parameter'),
				'smtp_hostname' : this.config.get('config_mail_smtp_hostname'),
				'smtp_username' : this.config.get('config_mail_smtp_username'),
				'smtp_password' : html_entity_decode(this.config.get('config_mail_smtp_password')),
				'smtp_port'     : this.config.get('config_mail_smtp_port'),
				'smtp_timeout'  : this.config.get('config_mail_smtp_timeout')
			];

			mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
			mail.setTo(gdpr_info['email']);
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/gdpr_approve', data));
			mail.send();
		}
	}

	/**
	 * @param array gdpr_info
	 *
	 * @return void
	 * @throws \Exception
	 */
	async deny(array gdpr_info) {
		this.load.model('setting/store',this);

		store_info await this.model_setting_store.getStore(gdpr_info['store_id']);

		if (store_info && store_info.store_id) {
			this.load.model('setting/setting',this);

			store_logo = html_entity_decode(this.model_setting_setting.getValue('config_logo', store_info['store_id']));
			store_name = html_entity_decode(store_info['name']);
			store_url = store_info['url'];
		} else {
			store_logo = html_entity_decode(this.config.get('config_logo'));
			store_name = html_entity_decode(this.config.get('config_name'));
			store_url = HTTP_CATALOG;
		}

		// Send the email in the correct language
		this.load.model('localisation/language',this);

		const language_info = await this.model_localisation_language.getLanguage(gdpr_info['language_id']);

		if (language_info) {
			language_code = language_info['code'];
		} else {
			language_code = this.config.get('config_language');
		}

		// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool.
		await this.load.language('default', 'mail', language_code);
		await this.load.language('mail/gdpr_deny', 'mail', language_code);

		// Add language vars to the template folder
		results = this.language.all('mail');

		for (let [key, value] of Object.entries(results)) {
			data[key] = value;
		}

		subject = sprintf(this.language.get('mail_text_subject'), store_name);

		this.load.model('tool/image',this);

		if (is_file(DIR_IMAGE + store_logo)) {
			data['logo'] = store_url + 'image/' + store_logo;
		} else {
			data['logo'] = '';
		}

		data['text_request'] = this.language.get('mail_text_' + gdpr_info['action']);

		this.load.model('customer/customer',this);

		const customer_info = await this.model_customer_customer.getCustomerByEmail(gdpr_info['email']);

		if (customer_info) {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), html_entity_decode(customer_info['firstname']));
		} else {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), this.language.get('mail_text_user'));
		}

		data['store_name'] = store_name;
		data['store_url'] = store_url;
		data['contact'] = store_url + 'information/contact';

		if (this.config.get('config_mail_engine')) {
			mail_option = [
				'parameter'     : this.config.get('config_mail_parameter'),
				'smtp_hostname' : this.config.get('config_mail_smtp_hostname'),
				'smtp_username' : this.config.get('config_mail_smtp_username'),
				'smtp_password' : html_entity_decode(this.config.get('config_mail_smtp_password')),
				'smtp_port'     : this.config.get('config_mail_smtp_port'),
				'smtp_timeout'  : this.config.get('config_mail_smtp_timeout')
			];

			mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
			mail.setTo(gdpr_info['email']);
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/gdpr_deny', data));
			mail.send();
		}
	}

	/**
	 * @param array gdpr_info
	 *
	 * @return void
	 * @throws \Exception
	 */
	async remove(array gdpr_info) {
		this.load.model('setting/store',this);

		store_info await this.model_setting_store.getStore(gdpr_info['store_id']);

		if (store_info && store_info.store_id) {
			this.load.model('setting/setting',this);

			store_logo = html_entity_decode(this.model_setting_setting.getValue('config_logo', store_info['store_id']));
			store_name = html_entity_decode(store_info['name']);
			store_url = store_info['url'];
		} else {
			store_logo = html_entity_decode(this.config.get('config_logo'));
			store_name = html_entity_decode(this.config.get('config_name'));
			store_url = HTTP_CATALOG;
		}

		// Send the email in the correct language
		this.load.model('localisation/language',this);

		const language_info = await this.model_localisation_language.getLanguage(gdpr_info['language_id']);

		if (language_info) {
			language_code = language_info['code'];
		} else {
			language_code = this.config.get('config_language');
		}

		// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool.
		await this.load.language('default', 'mail', language_code);
		await this.load.language('mail/gdpr_delete', 'mail', language_code);

		// Add language vars to the template folder
		results = this.language.all('mail');

		for (let [key, value] of Object.entries(results)) {
			data[key] = value;
		}

		subject = sprintf(this.language.get('mail_text_subject'), store_name);

		this.load.model('tool/image',this);

		if (is_file(DIR_IMAGE + store_logo)) {
			data['logo'] = store_url + 'image/' + store_logo;
		} else {
			data['logo'] = '';
		}

		this.load.model('customer/customer',this);

		const customer_info = await this.model_customer_customer.getCustomerByEmail(gdpr_info['email']);

		if (customer_info) {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), html_entity_decode(customer_info['firstname']));
		} else {
			data['text_hello'] = sprintf(this.language.get('mail_text_hello'), this.language.get('mail_text_user'));
		}

		data['store_name'] = store_name;
		data['store_url'] = store_url;
		data['contact'] = store_url + 'information/contact';

		if (this.config.get('config_mail_engine')) {
			mail_option = [
				'parameter'     : this.config.get('config_mail_parameter'),
				'smtp_hostname' : this.config.get('config_mail_smtp_hostname'),
				'smtp_username' : this.config.get('config_mail_smtp_username'),
				'smtp_password' : html_entity_decode(this.config.get('config_mail_smtp_password')),
				'smtp_port'     : this.config.get('config_mail_smtp_port'),
				'smtp_timeout'  : this.config.get('config_mail_smtp_timeout')
			];

			mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
			mail.setTo(gdpr_info['email']);
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/gdpr_delete', data));
			mail.send();
		}
	}
}
