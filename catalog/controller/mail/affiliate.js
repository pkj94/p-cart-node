module.exports = class Affiliate extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(route, args, output) {
		await this.load.language('mail/affiliate');

		store_name = html_entity_decode(this.config.get('config_name'));

		subject = sprintf(this.language.get('text_subject'), store_name);

		data['text_welcome'] = sprintf(this.language.get('text_welcome'), store_name);

		this.load.model('account/customer_group', this);

		if (await this.customer.isLogged()) {
			customer_group_id = await this.customer.getGroupId();
		} else {
			customer_group_id = args[1]['customer_group_id'];
		}

		customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

		if (customer_group_info) {
			data['approval'] = (this.config.get('config_affiliate_approval') || customer_group_info['approval']);
		} else {
			data['approval'] = '';
		}

		data['login'] = await this.url.link('account/affiliate', 'language=' + this.config.get('config_language'), true);

		data['store'] = store_name;
		data['store_url'] = this.config.get('config_url');

		if (this.config.get('config_mail_engine')) {
			mail_option = {
				'parameter': this.config.get('config_mail_parameter'),
				'smtp_hostname': this.config.get('config_mail_smtp_hostname'),
				'smtp_username': this.config.get('config_mail_smtp_username'),
				'smtp_password': html_entity_decode(this.config.get('config_mail_smtp_password')),
				'smtp_port': this.config.get('config_mail_smtp_port'),
				'smtp_timeout': this.config.get('config_mail_smtp_timeout')
			};

			const mail = new global['\Opencart\System\Library\Mail'](this.config.get('config_mail_engine'), mail_option);

			if (await this.customer.isLogged()) {
				mail.setTo(await this.customer.getEmail());
			} else {
				mail.setTo(args[1]['email']);
			}

			mail.setFrom(this.config.get('config_email'));
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/affiliate', data));
			mail.send();
		}
	}

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async alert(route, args, output) {
		// Send to main admin email if new affiliate email is enabled
		if (in_array('affiliate', this.config.get('config_mail_alert'))) {
			await this.load.language('mail/affiliate');

			store_name = html_entity_decode(this.config.get('config_name'));

			subject = this.language.get('text_new_affiliate');

			if (await this.customer.isLogged()) {
				customer_group_id = await this.customer.getGroupId();

				data['firstname'] = await this.customer.getFirstName();
				data['lastname'] = await this.customer.getLastName();
				data['email'] = await this.customer.getEmail();
				data['telephone'] = await this.customer.getTelephone();
			} else {
				customer_group_id = args[1]['customer_group_id'];

				data['firstname'] = args[1]['firstname'];
				data['lastname'] = args[1]['lastname'];
				data['email'] = args[1]['email'];
				data['telephone'] = args[1]['telephone'];
			}

			data['website'] = html_entity_decode(args[1]['website']);
			data['company'] = args[1]['company'];

			this.load.model('account/customer_group', this);

			const customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

			if (customer_group_info) {
				data['customer_group'] = customer_group_info['name'];
			} else {
				data['customer_group'] = '';
			}

			data['store'] = store_name;
			data['store_url'] = this.config.get('config_url');

			if (this.config.get('config_mail_engine')) {
				mail_option = {
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
				mail.setHtml(await this.load.view('mail/affiliate_alert', data));
				mail.send();

				// Send to additional alert emails if new affiliate email is enabled
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
