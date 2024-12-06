module.exports = class ControllerMarketingContact extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('marketing/contact');

		this.document.setTitle(this.language.get('heading_title'));

		data['user_token'] = this.session.data['user_token'];

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/contact', 'user_token=' + this.session.data['user_token'], true)
		});

		data['cancel'] = await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);

		this.load.model('setting/store', this);

		data['stores'] = await this.model_setting_store.getStores();

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/contact', data));
	}

	async send() {
		await this.load.language('marketing/contact');

		const json = { error: {} };

		if (this.request.server['method'] == 'POST') {
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
				if (store_info) {
					store_name = store_info['name'];
				}

				const setting = await this.model_setting_setting.getSetting('config', this.request.post['store_id']);

				const store_email = (setting['config_email']) ? setting['config_email'] : this.config.get('config_email');
				let page = 1;
				if ((this.request.get['page'])) {
					page = Number(this.request.get['page']);
				}

				let email_total = 0;

				let emails = [];
				let results = [];
				let customer_data = {};
				switch (this.request.post['to']) {
					case 'newsletter':
						customer_data = {
							'filter_newsletter': 1,
							'start': (page - 1) * 10,
							'limit': 10
						};

						email_total = await this.model_customer_customer.getTotalCustomers(customer_data);

						results = await this.model_customer_customer.getCustomers(customer_data);
						emails = [];
						for (let result of results) {
							emails.push(result['email']);
						}
						break;
					case 'customer_all':
						customer_data = {
							'start': (page - 1) * 10,
							'limit': 10
						};

						email_total = await this.model_customer_customer.getTotalCustomers(customer_data);

						results = await this.model_customer_customer.getCustomers(customer_data);
						emails = [];
						for (let result of results) {
							emails.push(result['email']);
						}
						break;
					case 'customer_group':
						customer_data = {
							'filter_customer_group_id': this.request.post['customer_group_id'],
							'start': (page - 1) * 10,
							'limit': 10
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
							let customers = this.request.post['customer'].splice((page - 1) * 10, 10);
							emails = [];
							for (let customer_id of customers) {
								const customer_info = await this.model_customer_customer.getCustomer(customer_id);

								if (customer_info.customer_id) {
									emails.push(customer_info['email']);
								}
							}

							email_total = emails.length;
						}
						break;
					case 'affiliate_all':
						let affiliate_data = {
							'filter_affiliate': 1,
							'start': (page - 1) * 10,
							'limit': 10
						};

						email_total = await this.model_customer_customer.getTotalCustomers(affiliate_data);

						results = await this.model_customer_customer.getCustomers(affiliate_data);
						emails = [];
						for (let result of results) {
							emails.push(result['email']);
						}
						break;
					case 'affiliate':
						if ((this.request.post['affiliate'])) {
							let affiliates = this.request.post['affiliate'].splice((page - 1) * 10, 10);
							emails = [];
							for (let affiliate_id of affiliates) {
								const affiliate_info = await this.model_customer_customer.getCustomer(affiliate_id);

								if (affiliate_info.email) {
									emails.push(affiliate_info['email']);
								}
							}

							email_total = this.request.post['affiliate'].length;
						}
						break;
					case 'product':
						if ((this.request.post['product'])) {
							email_total = await this.model_sale_order.getTotalEmailsByProductsOrdered(this.request.post['product']);

							results = await this.model_sale_order.getEmailsByProductsOrdered(this.request.post['product'], (page - 1) * 10, 10);
							emails = [];
							for (let result of results) {
								emails.push(result['email']);
							}
						}
						break;
				}

				if ((Array.isArray(emails) && emails.length) || (typeof emails == 'object' && Object.keys(emails).length)) {
					json['success'] = this.language.get('text_success');

					let start = (page - 1) * 10;
					let end = start + 10;

					if (page == 1 && email_total < 10) {
						json['success'] = sprintf(this.language.get('text_sent'), email_total, email_total);
					} else if (page == 1 && email_total > 10) {
						json['success'] = sprintf(this.language.get('text_sent'), 10, email_total);
					} else if (page > 1 && email_total < (page * 10)) {
						json['success'] = sprintf(this.language.get('text_sent'), email_total, email_total);
					} else {
						json['success'] = sprintf(this.language.get('text_sent'), end, email_total);
					}

					if (end < email_total) {
						json['next'] = str_replace('&amp;', '&', await this.url.link('marketing/contact/send', 'user_token=' + this.session.data['user_token'] + '&page=' + (page + 1), true));
					} else {
						json['next'] = '';
					}

					let message = '<html dir="ltr" lang="' + this.language.get('code') + '">' + "\n";
					message += '  <head>' + "\n";
					message += '    <title>' + this.request.post['subject'] + '</title>' + "\n";
					message += '    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' + "\n";
					message += '  </head>' + "\n";
					message += '  <body>' + html_entity_decode(this.request.post['message']) + '</body>' + "\n";
					message += '</html>' + "\n";

					for (let email of emails) {
						if (isEmailValid(email)) {
							const mail = new Mail(this.config.get('config_mail_engine'));
							mail.parameter = this.config.get('config_mail_parameter');
							mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
							mail.smtp_username = this.config.get('config_mail_smtp_username');
							mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
							mail.smtp_port = this.config.get('config_mail_smtp_port');
							mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

							mail.setTo(email);
							mail.setFrom(store_email);
							mail.setSender(html_entity_decode(store_name));
							mail.setSubject(html_entity_decode(this.request.post['subject']));
							mail.setHtml(message);
							await mail.send();
						}
					}
				} else {
					json['error']['email'] = this.language.get('error_email');
				}
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
