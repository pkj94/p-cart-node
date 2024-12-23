const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Transaction extends global['\Opencart\System\Engine\Controller'] {
	// catalog/model/account/customer/addTransaction/after
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		await this.load.language('mail/transaction');

		this.load.model('account/customer', this);

		const customer_info = await this.model_account_customer.getCustomer(args[0]);

		if (customer_info.customer_id) {
			const data = {};
			this.load.model('setting/store', this);

			const store_info = await this.model_setting_store.getStore(customer_info['store_id']);
			let store_name = html_entity_decode(this.config.get('config_name'));
			let store_url = this.config.get('config_url');
			if (store_info) {
				store_name = html_entity_decode(store_info['name']);
				store_url = store_info['store_url'];
			} 

			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(customer_info['language_id']);
			let language_code = this.config.get('config_language');
			if (language_info) {
				language_code = language_info['code'];
			}

			// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool+
			await this.load.language('default', 'mail', language_code);
			await this.load.language('mail/transaction', 'mail', language_code);

			// Add language vars to the template folder
			const results = this.language.all('mail');

			for (let [key, value] of Object.entries(results)) {
				data[key] = value;
			}

			let subject = sprintf(this.language.get('mail_text_subject'), store_name);

			data['text_received'] = sprintf(this.language.get('mail_text_received'), store_name);

			data['amount'] = this.currency.format(args[2], this.config.get('config_currency'));
			data['total'] = this.currency.format(await this.model_account_customer.getTransactionTotal(args[0]), this.config.get('config_currency'));

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
				mail.setHtml(await this.load.view('mail/transaction', data));
				await mail.send();
			}
		}
	}
}
