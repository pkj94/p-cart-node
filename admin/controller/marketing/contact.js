const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ContactController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketing/contact');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('marketing/contact', 'user_token=' + this.session.data['user_token'])
		});

		this.load.model('setting/store', this);

		data['stores'] = await this.model_setting_store.getStores();

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/contact', data));
	}

	/**
	 * @return void
	 * @throws \Exception
	 */
	async send() {
		await this.load.language('marketing/contact');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'marketing/contact')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['subject']) {
			json['error']['subject'] = this.language.get('error_subject');
		}

		if (!this.request.post['message']) {
			json['error']['message'] = this.language.get('error_message');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('setting/store', this);
			this.load.model('setting/setting', this);
			this.load.model('customer/customer', this);
			this.load.model('sale/order', this);

			const store_info = await this.model_setting_store.getStore(this.request.post['store_id']);
			let store_name = this.config.get('config_name');
			if (store_info && store_info.store_id) {
				store_name = store_info['name'];
			}

			const setting = await this.model_setting_setting.getSetting('config', this.request.post['store_id']);

			let store_email = (setting['config_email']) ? setting['config_email'] : this.config.get('config_email');
			let page = 1;
			if ((this.request.get['page'])) {
				page = Number(this.request.get['page']);
			}

			let limit = 10;

			let email_total = 0;

			let emails = [];
			let results;
			let customer_data;
			let affiliate_data;
			let customers;
			switch (this.request.post['to']) {
				case 'newsletter':
					customer_data = {
						'filter_newsletter': 1,
						'start': (page - 1) * limit,
						'limit': limit
					};

					email_total = await this.model_customer_customer.getTotalCustomers(customer_data);

					results = await this.model_customer_customer.getCustomers(customer_data);

					for (let result of results) {
						emails.push(result['email']);
					}
					break;
				case 'customer_all':
					customer_data = {
						'start': (page - 1) * limit,
						'limit': limit
					};

					email_total = await this.model_customer_customer.getTotalCustomers(customer_data);

					results = await this.model_customer_customer.getCustomers(customer_data);

					for (let result of results) {
						emails.push(result['email']);
					}
					break;
				case 'customer_group':
					customer_data = {
						'filter_customer_group_id': this.request.post['customer_group_id'],
						'start': (page - 1) * limit,
						'limit': limit
					};

					email_total = await this.model_customer_customer.getTotalCustomers(customer_data);

					results = await this.model_customer_customer.getCustomers(customer_data);
					emails = {};
					for (let result of results) {
						emails[result['customer_id']] = result['email'];
					}
					break;
				case 'customer':
					if ((this.request.post['customer'])) {
						email_total = count(this.request.post['customer']);

						customers = array_slice(this.request.post['customer'], (page - 1) * limit, limit);

						for (let customer_id of customers) {
							const customer_info = await this.model_customer_customer.getCustomer(customer_id);

							if (customer_info) {
								emails.push(customer_info['email']);
							}
						}
					}
					break;
				case 'affiliate_all':
					affiliate_data = {
						'filter_affiliate': 1,
						'start': (page - 1) * limit,
						'limit': limit
					};

					email_total = await this.model_customer_customer.getTotalCustomers(affiliate_data);

					results = await this.model_customer_customer.getCustomers(affiliate_data);

					for (let result of results) {
						emails.push(result['email']);
					}
					break;
				case 'affiliate':
					if ((this.request.post['affiliate'])) {
						affiliates = array_slice(this.request.post['affiliate'], (page - 1) * limit, limit);

						for (let affiliate_id of affiliates) {
							const affiliate_info = await this.model_customer_customer.getCustomer(affiliate_id);

							if (affiliate_info.customer_id) {
								emails.push(affiliate_info['email']);
							}
						}

						email_total = this.request.post['affiliate'].length;
					}
					break;
				case 'product':
					if ((this.request.post['product'])) {
						email_total = await this.model_sale_order.getTotalEmailsByProductsOrdered(this.request.post['product']);

						results = await this.model_sale_order.getEmailsByProductsOrdered(this.request.post['product'], (page - 1) * limit, limit);

						for (let result of results) {
							emails.push(result['email']);
						}
					}
					break;
			}

			if (emails.length) {
				let start = (page - 1) * limit;
				let end = start + limit;

				if (end < email_total) {
					json['text'] = sprintf(this.language.get('text_sent'), start ? start : 1, email_total);

					json['next'] = this.url.link('marketing/contact.send', 'user_token=' + this.session.data['user_token'] + '&page=' + (page + 1), true);
				} else {
					json['success'] = this.language.get('text_success');

					json['next'] = '';
				}

				let message = '<html dir="ltr" lang="' + this.language.get('code') + '">' + "\n";
				message += '  <head>' + "\n";
				message += '    <title>' + this.request.post['subject'] + '</title>' + "\n";
				message += '    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' + "\n";
				message += '  </head>' + "\n";
				message += '  <body>' + html_entity_decode(this.request.post['message']) + '</body>' + "\n";
				message += '</html>' + "\n";

				if (this.config.get('config_mail_engine')) {
					let mail_option = {
						'parameter': this.config.get('config_mail_parameter'),
						'smtp_hostname': this.config.get('config_mail_smtp_hostname'),
						'smtp_username': this.config.get('config_mail_smtp_username'),
						'smtp_password': html_entity_decode(this.config.get('config_mail_smtp_password')),
						'smtp_port': this.config.get('config_mail_smtp_port'),
						'smtp_timeout': this.config.get('config_mail_smtp_timeout')
					};

					const mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);

					for (let email of emails) {
						if (isEmailValid(email)) {
							mail.setTo(trim(email));
							mail.setFrom(store_email);
							mail.setSender(html_entity_decode(store_name));
							mail.setSubject(html_entity_decode(this.request.post['subject']));
							mail.setHtml(message);
							await mail.send();
						}
					}
				}
			} else {
				json['error']['warning'] = this.language.get('error_email');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
