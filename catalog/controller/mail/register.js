const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Register extends global['\Opencart\System\Engine\Controller'] {
	// catalog/model/account/customer/addCustomer/after
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		const data = {};
		await this.load.language('mail/register');

		let store_name = html_entity_decode(this.config.get('config_name'));

		let subject = sprintf(this.language.get('text_subject'), store_name);

		data['text_welcome'] = sprintf(this.language.get('text_welcome'), store_name);

		this.load.model('account/customer_group', this);
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((args[0]['customer_group_id'])) {
			customer_group_id = args[0]['customer_group_id'];
		} 

		const customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

		if (customer_group_info.customer_group_id) {
			data['approval'] = customer_group_info['approval'];
		} else {
			data['approval'] = '';
		}

		data['login'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);

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
			mail.setTo(args[0]['email']);
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/register', data));
			mail.send();
		}
	}

	// catalog/model/account/customer/addCustomer/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async alert(route, args, output) {
		// Send to main admin email if new account email is enabled
		if (in_array('account', this.config.get('config_mail_alert'))) {
			await this.load.language('mail/register');

			store_name = html_entity_decode(this.config.get('config_name'));

			subject = this.language.get('text_new_customer');

			data['firstname'] = args[0]['firstname'];
			data['lastname'] = args[0]['lastname'];

			data['login'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);

			this.load.model('account/customer_group', this);

			if ((args[0]['customer_group_id'])) {
				customer_group_id = args[0]['customer_group_id'];
			} else {
				customer_group_id = this.config.get('config_customer_group_id');
			}

			const customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

			if (customer_group_info) {
				data['customer_group'] = customer_group_info['name'];
			} else {
				data['customer_group'] = '';
			}

			data['email'] = args[0]['email'];
			data['telephone'] = args[0]['telephone'];

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
				mail.setHtml(await this.load.view('mail/register_alert', data));
				mail.send();

				// Send to additional alert emails if new account email is enabled
				emails = explode(',', this.config.get('config_mail_alert_email'));

				for (let email of emails) {
					if (oc_strlen(email) > 0 && filter_var(email, FILTER_VALIDATE_EMAIL)) {
						mail.setTo(trim(email));
						mail.send();
					}
				}
			}
		}
	}
}
