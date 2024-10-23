const sprintf = require("locutus/php/strings/sprintf");

module.exports = class TransactionController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		const data = {};
		let customer_id = 0;
		if ((args[0])) {
			customer_id = args[0];
		}
		let description = '';
		if ((args[1])) {
			description = args[1];
		}
		let amount = 0;
		if ((args[2])) {
			amount = args[2];
		}
		let order_id = 0;
		if ((args[3])) {
			order_id = args[3];
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info.customer_id) {
			await this.load.language('mail/transaction');

			this.load.model('setting/store', this);

			const store_info = await this.model_setting_store.getStore(customer_info['store_id']);
			let store_name = html_entity_decode(this.config.get('config_name'));
			let store_url = this.config.get('config_url');
			if (store_info && store_info.store_id) {
				store_name = html_entity_decode(store_info['name']);
				store_url = store_info['store_url'];
			}

			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(customer_info['language_id']);
			let language_code = this.config.get('config_language');
			if (language_info.language_id) {
				language_code = language_info['code'];
			}

			await this.load.language('default', 'mail', language_code);
			await this.load.language('mail/transaction', 'mail', language_code);

			let subject = sprintf(this.language.get('mail_text_subject'), store_name);

			data['text_received'] = sprintf(this.language.get('mail_text_received'), this.currency.format(amount, this.config.get('config_currency')));
			data['text_total'] = sprintf(this.language.get('mail_text_total'), this.currency.format(this.model_customer_customer.getTransactionTotal(customer_id), this.config.get('config_currency')));

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
