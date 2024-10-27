const nl2br = require("locutus/php/strings/nl2br");
const sprintf = require("locutus/php/strings/sprintf");
const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class Order extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 */
	async index(route, args) {
		let order_id = 0;
		if ((args[0])) {
			order_id = args[0];
		}
		let order_status_id = 0;
		if ((args[1])) {
			order_status_id = args[1];
		}
		let comment = '';
		if ((args[2])) {
			comment = args[2];
		}
		let notify = '';
		if ((args[3])) {
			notify = args[3];
		}

		// We need to grab the old order status ID
		const order_info = await this.model_checkout_order.getOrder(order_id);

		if (order_info.order_id) {
			// If the order status returns 0, then it becomes greater than 0+ Therefore, we send the default html email
			if (!order_info['order_status_id'] && order_status_id) {
				this.add(order_info, order_status_id, comment, notify);
			}

			// If the order status does not return 0, we send the update as a text email
			if (order_info['order_status_id'] && order_status_id && notify) {
				this.edit(order_info, order_status_id, comment, notify);
			}
		}
	}

	/**
	 * @param  order_info
	 * @param    order_status_id
	 * @param string comment
	 * @param bool   notify
	 *
	 * @return void
	 * @throws \Exception
	 */
	async add(order_info, order_status_id, comment, notify) {
		const data = {};
		// Check for any downloadable products
		let download_status = false;

		const order_products = await this.model_checkout_order.getProducts(order_info['order_id']);

		for (let order_product of order_products) {
			// Check if there are any linked downloads
			const product_download_query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_to_download` WHERE `product_id` = '" + order_product['product_id'] + "'");

			if (product_download_query.row['total']) {
				download_status = true;
			}
		}

		let store_logo = html_entity_decode(this.config.get('config_logo'));
		let store_name = html_entity_decode(this.config.get('config_name'));
		let store_url = HTTP_SERVER;
		if (typeof HTTP_CATALOG != 'undefined') {
			store_url = HTTP_CATALOG;
		}

		this.load.model('setting/store', this);

		const store_info = await this.model_setting_store.getStore(order_info['store_id']);

		if (store_info.store_id) {
			this.load.model('setting/setting', this);

			store_logo = html_entity_decode(await this.model_setting_setting.getValue('config_logo', store_info['store_id']));
			store_name = html_entity_decode(store_info['name']);
			store_url = store_info['url'];
		}

		this.load.model('localisation/language', this);

		const language_info = await this.model_localisation_language.getLanguage(order_info['language_id']);
		let language_code = this.config.get('config_language');
		if (language_info.language_id) {
			language_code = language_info['code'];
		}

		// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool+
		await this.load.language('default', 'mail', language_code);
		await this.load.language('mail/order_add', 'mail', language_code);

		// Add language vars to the template folder
		const results = this.language.all('mail');

		for (let [key, value] of Object.entries(results)) {
			data[key] = value;
		}

		let subject = sprintf(this.language.get('mail_text_subject'), store_name, order_info['order_id']);

		this.load.model('tool/image', this);

		if (store_logo && is_file(DIR_IMAGE + store_logo)) {
			data['logo'] = store_url + 'image/' + store_logo;
		} else {
			data['logo'] = '';
		}

		data['title'] = sprintf(this.language.get('mail_text_subject'), store_name, order_info['order_id']);

		data['text_greeting'] = sprintf(this.language.get('mail_text_greeting'), order_info['store_name']);

		data['store'] = store_name;
		data['store_url'] = order_info['store_url'];

		data['customer_id'] = order_info['customer_id'];
		data['link'] = order_info['store_url'] + 'account/order.info&order_id=' + order_info['order_id'];

		if (download_status) {
			data['download'] = order_info['store_url'] + 'account/download';
		} else {
			data['download'] = '';
		}

		data['order_id'] = order_info['order_id'];
		data['date_added'] = date(this.language.get('date_format_short'), new Date(order_info['date_added']));
		data['payment_method'] = order_info['payment_method']['name'];
		data['shipping_method'] = order_info['shipping_method']['name'];
		data['email'] = order_info['email'];
		data['telephone'] = order_info['telephone'];
		data['ip'] = order_info['ip'];

		const order_status_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "' AND `language_id` = '" + order_info['language_id'] + "'");

		if (order_status_query.num_rows) {
			data['order_status'] = order_status_query.row['name'];
		} else {
			data['order_status'] = '';
		}

		if (comment) {
			data['comment'] = nl2br(comment);
		} else {
			data['comment'] = '';
		}

		// Payment Address
		let format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
		if (order_info['payment_address_format']) {
			format = order_info['payment_address_format'];
		}

		let find = [
			'{firstname}',
			'{lastname}',
			'{company}',
			'{address_1}',
			'{address_2}',
			'{city}',
			'{postcode}',
			'{zone}',
			'{zone_code}',
			'{country}'
		];

		let replace = {
			'firstname': order_info['payment_firstname'],
			'lastname': order_info['payment_lastname'],
			'company': order_info['payment_company'],
			'address_1': order_info['payment_address_1'],
			'address_2': order_info['payment_address_2'],
			'city': order_info['payment_city'],
			'postcode': order_info['payment_postcode'],
			'zone': order_info['payment_zone'],
			'zone_code': order_info['payment_zone_code'],
			'country': order_info['payment_country']
		};

		data['payment_address'] = format
			.replace(/\r\n|\r|\n/g, '<br/>')
			.replace(/\s\s+|\r\r+|\n\n+/g, '<br/>')
			.trim()
			.replace(find, replace);

		// Shipping Address
		if (order_info['shipping_address_format']) {
			format = order_info['shipping_address_format'];
		} else {
			format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
		}

		find = [
			'{firstname}',
			'{lastname}',
			'{company}',
			'{address_1}',
			'{address_2}',
			'{city}',
			'{postcode}',
			'{zone}',
			'{zone_code}',
			'{country}'
		];

		replace = {
			'firstname': order_info['shipping_firstname'],
			'lastname': order_info['shipping_lastname'],
			'company': order_info['shipping_company'],
			'address_1': order_info['shipping_address_1'],
			'address_2': order_info['shipping_address_2'],
			'city': order_info['shipping_city'],
			'postcode': order_info['shipping_postcode'],
			'zone': order_info['shipping_zone'],
			'zone_code': order_info['shipping_zone_code'],
			'country': order_info['shipping_country']
		};

		data['shipping_address'] = format
			.replace(/\r\n|\r|\n/g, '<br/>')
			.replace(/\s\s+|\r\r+|\n\n+/g, '<br/>')
			.trim()
			.replace(find, replace);

		this.load.model('tool/upload', this);

		// Products
		data['products'] = [];

		for (let order_product of order_products) {
			let option_data = [];

			const order_options = await this.model_checkout_order.getOptions(order_info['order_id'], order_product['order_product_id']);

			for (let order_option of order_options) {
				let value = '';
				if (order_option['type'] != 'file') {
					value = order_option['value'];
				} else {
					const upload_info = await this.model_tool_upload.getUploadByCode(order_option['value']);

					if (upload_info.upload_id) {
						value = upload_info['name'];
					} else {
						value = '';
					}
				}

				option_data.push({
					'name': order_option['name'],
					'value': (oc_strlen(value) > 20 ? oc_substr(value, 0, 20) + '++' : value)
				});
			}

			let description = '';

			this.load.model('checkout/order', this);

			const subscription_info = await this.model_checkout_order.getSubscription(order_info['order_id'], order_product['order_product_id']);

			if (subscription_info.subscription_plan_id) {
				if (subscription_info['trial_status']) {
					let trial_price = this.currency.format(subscription_info['trial_price'] + (Number(this.config.get('config_tax')) ? subscription_info['trial_tax'] : 0), order_info['currency_code'], order_info['currency_value']);
					let trial_cycle = subscription_info['trial_cycle'];
					let trial_frequency = this.language.get('text_' + subscription_info['trial_frequency']);
					let trial_duration = subscription_info['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
				}

				let price = this.currency.format(subscription_info['price'] + (Number(this.config.get('config_tax')) ? subscription_info['tax'] : 0), order_info['currency_code'], order_info['currency_value']);
				let cycle = subscription_info['cycle'];
				let frequency = this.language.get('text_' + subscription_info['frequency']);
				let duration = subscription_info['duration'];

				if (duration) {
					description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
				}
			}

			data['products'].push({
				'name': order_product['name'],
				'model': order_product['model'],
				'option': option_data,
				'subscription': description,
				'quantity': order_product['quantity'],
				'price': this.currency.format(order_product['price'] + (Number(this.config.get('config_tax')) ? order_product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
				'total': this.currency.format(order_product['total'] + (Number(this.config.get('config_tax')) ? (order_product['tax'] * order_product['quantity']) : 0), order_info['currency_code'], order_info['currency_value']),
				'reward': order_product['reward']
			});
		}

		// Vouchers
		data['vouchers'] = [];

		const order_vouchers = await this.model_checkout_order.getVouchers(order_info['order_id']);

		for (let order_voucher of order_vouchers) {
			data['vouchers'].push({
				'description': order_voucher['description'],
				'amount': this.currency.format(order_voucher['amount'], order_info['currency_code'], order_info['currency_value']),
			});
		}

		// Order Totals
		data['totals'] = [];

		const order_totals = await this.model_checkout_order.getTotals(order_info['order_id']);

		for (let order_total of order_totals) {
			data['totals'].push({
				'title': order_total['title'],
				'text': this.currency.format(order_total['value'], order_info['currency_code'], order_info['currency_value']),
			});
		}

		this.load.model('setting/setting', this);

		let from = await this.model_setting_setting.getValue('config_email', order_info['store_id']);

		if (!from) {
			from = this.config.get('config_email');
		}

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
			mail.setTo(order_info['email']);
			mail.setFrom(from);
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/order_invoice', data));
			await mail.send();
		}
	}

	/**
	 * @param  order_info
	 * @param    order_status_id
	 * @param string comment
	 * @param bool   notify
	 *
	 * @return void
	 * @throws \Exception
	 */
	async edit(order_info, order_status_id, comment, notify) {
		let store_name = html_entity_decode(this.config.get('config_name'));
		let store_url = HTTP_SERVER;
		if (typeof HTTP_CATALOG != 'undefined') {
			store_url = HTTP_CATALOG;
		}

		this.load.model('setting/store', this);

		const store_info = await this.model_setting_store.getStore(order_info['store_id']);

		if (store_info.store_id) {
			store_name = html_entity_decode(store_info['name']);
			store_url = store_info['url'];
		}

		this.load.model('localisation/language', this);

		const language_info = await this.model_localisation_language.getLanguage(order_info['language_id']);
		let language_code = this.config.get('config_language');
		if (language_info.language_id) {
			language_code = language_info['code'];
		}

		// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool+
		await this.load.language('default', 'mail', language_code);
		await this.load.language('mail/order_edit', 'mail', language_code);

		// Add language vars to the template folder
		const results = this.language.all('mail');

		for (let [key, value] of Object.entries(results)) {
			data[key] = value;
		}

		let subject = sprintf(this.language.get('mail_text_subject'), store_name, order_info['order_id']);

		data['order_id'] = order_info['order_id'];
		data['date_added'] = date(this.language.get('date_format_short'), new Date(order_info['date_added']));

		const order_status_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "' AND `language_id` = '" + order_info['language_id'] + "'");

		if (order_status_query.num_rows) {
			data['order_status'] = order_status_query.row['name'];
		} else {
			data['order_status'] = '';
		}

		if (order_info['customer_id']) {
			data['link'] = order_info['store_url'] + 'account/order.info&order_id=' + order_info['order_id'];
		} else {
			data['link'] = '';
		}

		data['comment'] = strip_tags(comment);

		data['store'] = store_name;
		data['store_url'] = store_url;

		this.load.model('setting/setting', this);

		let from = await this.model_setting_setting.getValue('config_email', order_info['store_id']);

		if (!from) {
			from = this.config.get('config_email');
		}

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
			mail.setTo(order_info['email']);
			mail.setFrom(from);
			mail.setSender(store_name);
			mail.setSubject(subject);
			mail.setHtml(await this.load.view('mail/order_history', data));
			await mail.send();
		}
	}

	// catalog/model/checkout/order/addHistory/before

	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 * @throws \Exception
	 */
	async alert(route, args) {
		const data = {};
		let order_id = 0;
		if ((args[0])) {
			order_id = args[0];
		}
		let order_status_id = 0;
		if ((args[1])) {
			order_status_id = args[1];
		}
		let comment = '';
		if ((args[2])) {
			comment = args[2];
		}
		let notify = '';
		if ((args[3])) {
			notify = args[3];
		}

		const order_info = await this.model_checkout_order.getOrder(order_id);

		if (order_info.order_id && !order_info['order_status_id'] && order_status_id && this.config.get('config_mail_alert').includes('order')) {
			await this.load.language('mail/order_alert');

			let subject = html_entity_decode(sprintf(this.language.get('text_subject'), this.config.get('config_name'), order_info['order_id']));

			data['order_id'] = order_info['order_id'];
			data['date_added'] = date(this.language.get('date_format_short'), new Date(order_info['date_added']));

			const order_status_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

			if (order_status_query.num_rows) {
				data['order_status'] = order_status_query.row['name'];
			} else {
				data['order_status'] = '';
			}

			this.load.model('tool/upload', this);

			data['products'] = [];

			const order_products = await this.model_checkout_order.getProducts(order_id);

			for (let order_product of order_products) {
				let option_data = [];

				const order_options = await this.model_checkout_order.getOptions(order_info['order_id'], order_product['order_product_id']);

				for (let order_option of order_options) {
					let value = '';
					if (order_option['type'] != 'file') {
						value = order_option['value'];
					} else {
						const upload_info = await this.model_tool_upload.getUploadByCode(order_option['value']);

						if (upload_info.upload_id) {
							value = upload_info['name'];
						} else {
							value = '';
						}
					}

					option_data.push({
						'name': order_option['name'],
						'value': (oc_strlen(value) > 20 ? oc_substr(value, 0, 20) + '++' : value)
					});
				}

				let description = '';

				this.load.model('checkout/subscription', this);

				const subscription_info = await this.model_checkout_order.getSubscription(order_info['order_id'], order_product['order_product_id']);

				if (subscription_info.subscription_plan_id) {
					if (subscription_info['trial_status']) {
						let trial_price = this.currency.format(subscription_info['trial_price'] + (Number(this.config.get('config_tax')) ? subscription_info['trial_tax'] : 0), this.session.data['currency']);
						let trial_cycle = subscription_info['trial_cycle'];
						let trial_frequency = this.language.get('text_' + subscription_info['trial_frequency']);
						let trial_duration = subscription_info['trial_duration'];

						description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
					}

					let price = this.currency.format(subscription_info['price'] + (Number(this.config.get('config_tax')) ? subscription_info['tax'] : 0), this.session.data['currency']);
					let cycle = subscription_info['cycle'];
					let frequency = this.language.get('text_' + subscription_info['frequency']);
					let duration = subscription_info['duration'];

					if (duration) {
						description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
					} else {
						description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
					}
				}

				data['products'].push({
					'name': order_product['name'],
					'model': order_product['model'],
					'quantity': order_product['quantity'],
					'option': option_data,
					'subscription': description,
					'total': html_entity_decode(this.currency.format(order_product['total'] + (Number(this.config.get('config_tax')) ? order_product['tax'] * order_product['quantity'] : 0), order_info['currency_code'], order_info['currency_value']))
				});
			}

			data['vouchers'] = [];

			const order_vouchers = await this.model_checkout_order.getVouchers(order_id);

			for (let order_voucher of order_vouchers) {
				data['vouchers'].push({
					'description': order_voucher['description'],
					'amount': html_entity_decode(this.currency.format(order_voucher['amount'], order_info['currency_code'], order_info['currency_value']))
				});
			}

			data['totals'] = [];

			const order_totals = await this.model_checkout_order.getTotals(order_id);

			for (let order_total of order_totals) {
				data['totals'].push({
					'title': order_total['title'],
					'value': html_entity_decode(this.currency.format(order_total['value'], order_info['currency_code'], order_info['currency_value']))
				});
			}

			data['comment'] = nl2br(order_info['comment']);

			data['store'] = html_entity_decode(order_info['store_name']);
			data['store_url'] = order_info['store_url'];

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
				mail.setSender(html_entity_decode(order_info['store_name']));
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/order_alert', data));
				await mail.send();

				// Send to additional alert emails
				let emails = this.config.get('config_mail_alert_email').split(',');

				for (let email of emails) {
					if (email && isEmailValid(email)) {
						mail.setTo(trim(email));
						await mail.send();
					}
				}
			}
		}
	}
}
