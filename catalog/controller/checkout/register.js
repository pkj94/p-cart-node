const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Register extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/register');

		data['text_login'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', 'language=' + this.config.get('config_language') + '&redirect=' + encodeURIComponent(await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'), true))));

		data['entry_newsletter'] = sprintf(this.language.get('entry_newsletter'), this.config.get('config_name'));

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), Number(this.config.get('config_file_max_size')));

		data['config_checkout_payment_address'] = Number(this.config.get('config_checkout_payment_address'));
		data['config_checkout_guest'] = (this.config.get('config_checkout_guest') && !Number(this.config.get('config_customer_price')) && !await this.cart.hasDownload() && !await this.cart.hasSubscription());
		data['config_file_max_size'] = (Number(this.config.get('config_file_max_size')) * 1024 * 1024);
		data['config_telephone_display'] = Number(this.config.get('config_telephone_display'));
		data['config_telephone_required'] = Number(this.config.get('config_telephone_required'));

		data['shipping_required'] = await this.cart.hasShipping();

		data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));

		data['customer_groups'] = [];

		if (Array.isArray(this.config.get('config_customer_group_display'))) {
			this.load.model('account/customer_group', this);

			const customer_groups = await this.model_account_customer_group.getCustomerGroups();

			for (let customer_group of customer_groups) {
				if (this.config.get('config_customer_group_display').includes(customer_group['customer_group_id'])) {
					data['customer_groups'].push(customer_group);
				}
			}
		}

		if ((this.session.data['customer'] && this.session.data['customer']['customer_id'])) {
			data['account'] = this.session.data['customer']['customer_id'];
		} else {
			data['account'] = 1;
		}

		if ((this.session.data['customer'])) {
			data['customer_group_id'] = this.session.data['customer']['customer_group_id'];
			data['firstname'] = this.session.data['customer']['firstname'];
			data['lastname'] = this.session.data['customer']['lastname'];
			data['email'] = this.session.data['customer']['email'];
			data['telephone'] = this.session.data['customer']['telephone'];
			data['account_custom_field'] = this.session.data['customer']['custom_field'];
		} else {
			data['customer_group_id'] = this.config.get('config_customer_group_id');
			data['firstname'] = '';
			data['lastname'] = '';
			data['email'] = '';
			data['telephone'] = '';
			data['account_custom_field'] = [];
		}

		if ((this.session.data['payment_address'])) {
			data['payment_firstname'] = this.session.data['payment_address']['firstname'];
			data['payment_lastname'] = this.session.data['payment_address']['lastname'];
			data['payment_company'] = this.session.data['payment_address']['company'];
			data['payment_address_1'] = this.session.data['payment_address']['address_1'];
			data['payment_address_2'] = this.session.data['payment_address']['address_2'];
			data['payment_postcode'] = this.session.data['payment_address']['postcode'];
			data['payment_city'] = this.session.data['payment_address']['city'];
			data['payment_country_id'] = this.session.data['payment_address']['country_id'];
			data['payment_zone_id'] = this.session.data['payment_address']['zone_id'];
			data['payment_custom_field'] = this.session.data['payment_address']['custom_field'];
		} else {
			data['payment_firstname'] = '';
			data['payment_lastname'] = '';
			data['payment_company'] = '';
			data['payment_address_1'] = '';
			data['payment_address_2'] = '';
			data['payment_postcode'] = '';
			data['payment_city'] = '';
			data['payment_country_id'] = this.config.get('config_country_id');
			data['payment_zone_id'] = '';
			data['payment_custom_field'] = [];
		}

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['address_id'])) {
			data['shipping_firstname'] = this.session.data['shipping_address']['firstname'];
			data['shipping_lastname'] = this.session.data['shipping_address']['lastname'];
			data['shipping_company'] = this.session.data['shipping_address']['company'];
			data['shipping_address_1'] = this.session.data['shipping_address']['address_1'];
			data['shipping_address_2'] = this.session.data['shipping_address']['address_2'];
			data['shipping_postcode'] = this.session.data['shipping_address']['postcode'];
			data['shipping_city'] = this.session.data['shipping_address']['city'];
			data['shipping_country_id'] = this.session.data['shipping_address']['country_id'];
			data['shipping_zone_id'] = this.session.data['shipping_address']['zone_id'];
			data['shipping_custom_field'] = this.session.data['shipping_address']['custom_field'];
		} else {
			data['shipping_firstname'] = '';
			data['shipping_lastname'] = '';
			data['shipping_company'] = '';
			data['shipping_address_1'] = '';
			data['shipping_address_2'] = '';

			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['postcode'])) {
				data['shipping_postcode'] = this.session.data['shipping_address']['postcode'];
			} else {
				data['shipping_postcode'] = '';
			}

			data['shipping_city'] = '';

			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['country_id'])) {
				data['shipping_country_id'] = this.session.data['shipping_address']['country_id'];
			} else {
				data['shipping_country_id'] = this.config.get('config_country_id');
			}

			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['zone_id'])) {
				data['shipping_zone_id'] = this.session.data['shipping_address']['zone_id'];
			} else {
				data['shipping_zone_id'] = '';
			}

			data['shipping_custom_field'] = [];
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		// Custom Fields
		this.load.model('account/custom_field', this);

		data['custom_fields'] = await this.model_account_custom_field.getCustomFields();

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('register')) {
			data['captcha'] = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code']);
		} else {
			data['captcha'] = '';
		}

		this.load.model('catalog/information', this);

		const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

		if (information_info.information_id) {
			data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information.info', 'language=' + this.config.get('config_language') + '&information_id=' + this.config.get('config_account_id')), information_info['title']);
		} else {
			data['text_agree'] = '';
		}

		data['language'] = this.config.get('config_language');

		return await this.load.view('checkout/register', data);
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('checkout/register');

		const json = {};

		keys = [
			'account',
			'customer_group_id',
			'firstname',
			'lastname',
			'email',
			'telephone',
			'payment_company',
			'payment_address_1',
			'payment_address_2',
			'payment_city',
			'payment_postcode',
			'payment_country_id',
			'payment_zone_id',
			'payment_custom_field',
			'address_match',
			'shipping_firstname',
			'shipping_lastname',
			'shipping_company',
			'shipping_address_1',
			'shipping_address_2',
			'shipping_city',
			'shipping_postcode',
			'shipping_country_id',
			'shipping_zone_id',
			'shipping_custom_field',
			'password',
			'agree'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		// Force account requires subscript or is a downloadable product+
		if (await this.cart.hasDownload() || this.cart.hasSubscription()) {
			this.request.post['account'] = 1;
		}

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let product of products) {
			if (!product['minimum']) {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);

				break;
			}
		}

		if (!Object.keys(json).length) {
			// If not guest checkout disabled, login require price or cart has downloads
			if (!this.request.post['account'] && (!this.config.get('config_checkout_guest') || Number(this.config.get('config_customer_price')))) {
				json['error']['warning'] = this.language.get('error_guest');
			}

			// Customer Group
			if (this.request.post['customer_group_id']) {
				customer_group_id = this.request.post['customer_group_id'];
			} else {
				customer_group_id = this.config.get('config_customer_group_id');
			}

			this.load.model('account/customer_group', this);

			const customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

			if (!customer_group_info || !in_array(customer_group_id, this.config.get('config_customer_group_display'))) {
				json['error']['warning'] = this.language.get('error_customer_group');
			}

			if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
				json['error']['email'] = this.language.get('error_email');
			}

			this.load.model('account/customer', this);

			if (this.request.post['account'] && await this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
				json['error']['warning'] = this.language.get('error_exists');
			}

			// Logged
			if (await this.customer.isLogged()) {
				const customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

				if (customer_info['customer_id'] != await this.customer.getId()) {
					json['error']['warning'] = this.language.get('error_exists');
				}
			}

			if (Number(this.config.get('config_telephone_required')) && (oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
				json['error']['telephone'] = this.language.get('error_telephone');
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'account') {
					if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}

			if (Number(this.config.get('config_checkout_payment_address'))) {
				if ((oc_strlen(this.request.post['payment_address_1']) < 3) || (oc_strlen(this.request.post['payment_address_1']) > 128)) {
					json['error']['payment_address_1'] = this.language.get('error_address_1');
				}

				if ((oc_strlen(this.request.post['payment_city']) < 2) || (oc_strlen(this.request.post['payment_city']) > 128)) {
					json['error']['payment_city'] = this.language.get('error_city');
				}

				this.load.model('localisation/country', this);

				payment_country_info = await this.model_localisation_country.getCountry(this.request.post['payment_country_id']);

				if (payment_country_info && payment_country_info['postcode_required'] && (oc_strlen(this.request.post['payment_postcode']) < 2 || oc_strlen(this.request.post['payment_postcode']) > 10)) {
					json['error']['payment_postcode'] = this.language.get('error_postcode');
				}

				if (this.request.post['payment_country_id'] == '') {
					json['error']['payment_country'] = this.language.get('error_country');
				}

				if (this.request.post['payment_zone_id'] == '') {
					json['error']['payment_zone'] = this.language.get('error_zone');
				}

				// Custom field validation
				for (let custom_field of custom_fields) {
					if (custom_field['location'] == 'address') {
						if (custom_field['required'] && empty(this.request.post['payment_custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
							json['error']['payment_custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
						} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['payment_custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
							json['error']['payment_custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
						}
					}
				}
			}

			if (await this.cart.hasShipping() && !this.request.post['address_match']) {
				// If payment address not required we need to use the firstname and lastname from the account+
				if (Number(this.config.get('config_checkout_payment_address'))) {
					if ((oc_strlen(this.request.post['shipping_firstname']) < 1) || (oc_strlen(this.request.post['shipping_firstname']) > 32)) {
						json['error']['shipping_firstname'] = this.language.get('error_firstname');
					}

					if ((oc_strlen(this.request.post['shipping_lastname']) < 1) || (oc_strlen(this.request.post['shipping_lastname']) > 32)) {
						json['error']['shipping_lastname'] = this.language.get('error_lastname');
					}
				}

				if ((oc_strlen(this.request.post['shipping_address_1']) < 3) || (oc_strlen(this.request.post['shipping_address_1']) > 128)) {
					json['error']['shipping_address_1'] = this.language.get('error_address_1');
				}

				if ((oc_strlen(this.request.post['shipping_city']) < 2) || (oc_strlen(this.request.post['shipping_city']) > 128)) {
					json['error']['shipping_city'] = this.language.get('error_city');
				}

				this.load.model('localisation/country', this);

				shipping_country_info = await this.model_localisation_country.getCountry(this.request.post['shipping_country_id']);

				if (shipping_country_info && shipping_country_info['postcode_required'] && (oc_strlen(this.request.post['shipping_postcode']) < 2 || oc_strlen(this.request.post['shipping_postcode']) > 10)) {
					json['error']['shipping_postcode'] = this.language.get('error_postcode');
				}

				if (this.request.post['shipping_country_id'] == '') {
					json['error']['shipping_country'] = this.language.get('error_country');
				}

				if (this.request.post['shipping_zone_id'] == '') {
					json['error']['shipping_zone'] = this.language.get('error_zone');
				}

				// Custom field validation
				for (let custom_field of custom_fields) {
					if (custom_field['location'] == 'address') {
						if (custom_field['required'] && empty(this.request.post['shipping_custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
							json['error']['shipping_custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
						} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['shipping_custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
							json['error']['shipping_custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
						}
					}
				}
			}

			// If account register password required
			if (this.request.post['account'] && (oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['account']) {
				this.load.model('catalog/information', this);

				const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

				if (information_info && !this.request.post['agree']) {
					json['error']['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
				}
			}

			// Captcha
			this.load.model('setting/extension', this);

			if (!await this.customer.isLogged()) {
				const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

				if (extension_info && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && in_array('register', this.config.get('config_captcha_page'))) {
					const captcha = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code'] + '.validate');

					if (captcha) {
						json['error']['captcha'] = captcha;
					}
				}
			}
		}

		if (!Object.keys(json).length) {
			// Add customer details into session
			customer_data = {
				'customer_id': 0,
				'customer_group_id': customer_group_id,
				'firstname': this.request.post['firstname'],
				'lastname': this.request.post['lastname'],
				'email': this.request.post['email'],
				'telephone': this.request.post['telephone'],
				'custom_field': (this.request.post['custom_field']) ? this.request.post['custom_field'] : []
			};

			// Register
			if (this.request.post['account']) {
				customer_data['customer_id'] = await this.model_account_customer.addCustomer(this.request.post);
			}

			// Logged so edit customer details
			if (await this.customer.isLogged()) {
				await this.model_account_customer.editCustomer(await this.customer.getId(), this.request.post);
			}

			// Check if current customer group requires approval
			if (!customer_group_info['approval']) {
				this.session.data['customer'] = customer_data;
			}

			this.load.model('account/address', this);

			// Payment Address
			if (Number(this.config.get('config_checkout_payment_address'))) {
				if ((this.session.data['payment_address']['address_id'])) {
					address_id = this.session.data['payment_address']['address_id'];
				} else {
					address_id = 0;
				}

				if (payment_country_info) {
					country = payment_country_info['name'];
					iso_code_2 = payment_country_info['iso_code_2'];
					iso_code_3 = payment_country_info['iso_code_3'];
					address_format = payment_country_info['address_format'];
				} else {
					country = '';
					iso_code_2 = '';
					iso_code_3 = '';
					address_format = '';
				}

				this.load.model('localisation/zone', this);

				zone_info = await this.model_localisation_zone.getZone(this.request.post['payment_zone_id']);

				if (zone_info) {
					zone = zone_info['name'];
					zone_code = zone_info['code'];
				} else {
					zone = '';
					zone_code = '';
				}

				payment_address_data = {
					'address_id': address_id,
					'firstname': this.request.post['firstname'],
					'lastname': this.request.post['lastname'],
					'company': this.request.post['payment_company'],
					'address_1': this.request.post['payment_address_1'],
					'address_2': this.request.post['payment_address_2'],
					'city': this.request.post['payment_city'],
					'postcode': this.request.post['payment_postcode'],
					'zone_id': this.request.post['payment_zone_id'],
					'zone': zone,
					'zone_code': zone_code,
					'country_id': this.request.post['payment_country_id'],
					'country': country,
					'iso_code_2': iso_code_2,
					'iso_code_3': iso_code_3,
					'address_format': address_format,
					'custom_field': (this.request.post['payment_custom_field']) ? this.request.post['payment_custom_field'] : []
				};

				// Add
				if (this.request.post['account']) {
					payment_address_data['default'] = 1;

					payment_address_data['address_id'] = await this.model_account_address.addAddress(customer_data['customer_id'], payment_address_data);
				}

				// Edit
				if (await this.customer.isLogged() && payment_address_data['address_id']) {
					await this.model_account_address.editAddress(payment_address_data['address_id'], payment_address_data);
				}

				// Requires Approval
				if (!customer_group_info['approval']) {
					this.session.data['payment_address'] = payment_address_data;
				}
			}

			// Shipping Address
			if (await this.cart.hasShipping()) {
				if (!this.request.post['address_match']) {
					if ((this.session.data['shipping_address']['address_id'])) {
						address_id = this.session.data['shipping_address']['address_id'];
					} else {
						address_id = 0;
					}

					if (!Number(this.config.get('config_checkout_payment_address'))) {
						firstname = this.request.post['firstname'];
						lastname = this.request.post['lastname'];
					} else {
						firstname = this.request.post['shipping_firstname'];
						lastname = this.request.post['shipping_lastname'];
					}

					if (shipping_country_info) {
						country = shipping_country_info['name'];
						iso_code_2 = shipping_country_info['iso_code_2'];
						iso_code_3 = shipping_country_info['iso_code_3'];
						address_format = shipping_country_info['address_format'];
					} else {
						country = '';
						iso_code_2 = '';
						iso_code_3 = '';
						address_format = '';
					}

					this.load.model('localisation/zone', this);

					zone_info = await this.model_localisation_zone.getZone(this.request.post['shipping_zone_id']);

					if (zone_info) {
						zone = zone_info['name'];
						zone_code = zone_info['code'];
					} else {
						zone = '';
						zone_code = '';
					}

					shipping_address_data = {
						'address_id': address_id,
						'firstname': firstname,
						'lastname': lastname,
						'company': this.request.post['shipping_company'],
						'address_1': this.request.post['shipping_address_1'],
						'address_2': this.request.post['shipping_address_2'],
						'city': this.request.post['shipping_city'],
						'postcode': this.request.post['shipping_postcode'],
						'zone_id': this.request.post['shipping_zone_id'],
						'zone': zone,
						'zone_code': zone_code,
						'country_id': this.request.post['shipping_country_id'],
						'country': country,
						'iso_code_2': iso_code_2,
						'iso_code_3': iso_code_3,
						'address_format': address_format,
						'custom_field': (this.request.post['shipping_custom_field']) ? this.request.post['shipping_custom_field'] : []
					};

					// Add
					if (this.request.post['account']) {
						if (!Number(this.config.get('config_checkout_payment_address'))) {
							shipping_address_data['default'] = 1;
						}

						shipping_address_data['address_id'] = await this.model_account_address.addAddress(customer_data['customer_id'], shipping_address_data);
					}

					// Edit
					if (await this.customer.isLogged() && shipping_address_data['address_id']) {
						await this.model_account_address.editAddress(shipping_address_data['address_id'], shipping_address_data);
					}

					// Requires Approval
					if (!customer_group_info['approval']) {
						this.session.data['shipping_address'] = shipping_address_data;
					}
				} else if (!customer_group_info['approval'] && Number(this.config.get('config_checkout_payment_address'))) {
					this.session.data['shipping_address'] = this.session.data['payment_address'];

					// Remove the address id so if the customer changes their mind and requires changing a different shipping address it will create a new address+
					this.session.data['shipping_address']['address_id'] = 0;
				}
			}

			// If everything good login
			if (!customer_group_info['approval']) {
				if (this.request.post['account']) {
					await this.customer.login(this.request.post['email'], this.request.post['password']);

					// Create customer token
					this.session.data['customer_token'] = oc_token(26);

					json['success'] = this.language.get('text_success_add');
				} else if (await this.customer.isLogged()) {
					json['success'] = this.language.get('text_success_edit');
				} else {
					json['success'] = this.language.get('text_success_guest');
				}
			} else {
				// If account needs approval we redirect to the account success / requires approval page+
				json['redirect'] = await this.url.link('account/success', 'language=' + this.config.get('config_language'), true);
			}

			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);

			// Clear any previous login attempts for unregistered accounts+
			await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
