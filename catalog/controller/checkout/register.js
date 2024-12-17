const trim = require("locutus/php/strings/trim");
const is_numeric = require("locutus/php/var/is_numeric");

module.exports = class ControllerCheckoutRegister extends Controller {
	async index() {
		const data = {};
		await this.load.language('checkout/checkout');

		data['entry_newsletter'] = sprintf(this.language.get('entry_newsletter'), this.config.get('config_name'));

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

		data['customer_group_id'] = this.config.get('config_customer_group_id');

		if ((this.session.data['shipping_address']['postcode'])) {
			data['postcode'] = this.session.data['shipping_address']['postcode'];
		} else {
			data['postcode'] = '';
		}

		if ((this.session.data['shipping_address']['country_id'])) {
			data['country_id'] = this.session.data['shipping_address']['country_id'];
		} else {
			data['country_id'] = this.config.get('config_country_id');
		}

		if ((this.session.data['shipping_address']['zone_id'])) {
			data['zone_id'] = this.session.data['shipping_address']['zone_id'];
		} else {
			data['zone_id'] = '';
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		// Custom Fields
		this.load.model('account/custom_field', this);

		data['custom_fields'] = await this.model_account_custom_field.getCustomFields();

		// Captcha
		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('register')) {
			data['captcha'] = await this.load.controller('extension/captcha/' + this.config.get('config_captcha'));
		} else {
			data['captcha'] = '';
		}

		if (this.config.get('config_account_id')) {
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

			if (information_info.information_id) {
				data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information/agree', 'information_id=' + this.config.get('config_account_id'), true), information_info['title']);
			} else {
				data['text_agree'] = '';
			}
		} else {
			data['text_agree'] = '';
		}

		data['shipping_required'] = await this.cart.hasShipping();

		this.response.setOutput(await this.load.view('checkout/register', data));
	}

	async save() {
		await this.load.language('checkout/checkout');

		const json = {};

		// Validate if customer is already logged out+
		if (await this.customer.isLogged()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate cart has products and has stock+
		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart');
		}

		// Validate minimum quantity requirements.
		const products = await this.cart.getProducts();

		for (let product of products) {
			let product_total = 0;

			for (let product_2 of products) {
				if (product_2['product_id'] == product['product_id']) {
					product_total += product_2['quantity'];
				}
			}

			if (product['minimum'] > product_total) {
				json['redirect'] = await this.url.link('checkout/cart');

				break;
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('account/customer', this);

			if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((utf8_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
				json['error']['email'] = this.language.get('error_email');
			}

			if (await this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
				json['error']['warning'] = this.language.get('error_exists');
			}

			if ((utf8_strlen(this.request.post['telephone']) < 3) || (utf8_strlen(this.request.post['telephone']) > 32)) {
				json['error']['telephone'] = this.language.get('error_telephone');
			}

			if ((utf8_strlen(trim(this.request.post['address_1'])) < 3) || (utf8_strlen(trim(this.request.post['address_1'])) > 128)) {
				json['error']['address_1'] = this.language.get('error_address_1');
			}

			if ((utf8_strlen(trim(this.request.post['city'])) < 2) || (utf8_strlen(trim(this.request.post['city'])) > 128)) {
				json['error']['city'] = this.language.get('error_city');
			}

			this.load.model('localisation/country', this);

			const country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

			if (country_info.country_id && country_info['postcode_required'] && (utf8_strlen(trim(this.request.post['postcode'])) < 2 || utf8_strlen(trim(this.request.post['postcode'])) > 10)) {
				json['error']['postcode'] = this.language.get('error_postcode');
			}

			if (this.request.post['country_id'] == '') {
				json['error']['country'] = this.language.get('error_country');
			}

			if (!(this.request.post['zone_id']) || this.request.post['zone_id'] == '' || !is_numeric(this.request.post['zone_id'])) {
				json['error']['zone'] = this.language.get('error_zone');
			}

			if ((utf8_strlen(html_entity_decode(this.request.post['password'])) < 4) || (utf8_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['confirm'] != this.request.post['password']) {
				json['error']['confirm'] = this.language.get('error_confirm');
			}

			if (this.config.get('config_account_id')) {
				this.load.model('catalog/information', this);

				const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

				if (information_info.information_id && !(this.request.post['agree'])) {
					json['error']['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
				}
			}

			// Customer Group
			let customer_group_id = this.config.get('config_customer_group_id');
			if ((this.request.post['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && this.config.get('config_customer_group_display').includes(this.request.post['customer_group_id'])) {
				customer_group_id = this.request.post['customer_group_id'];
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'affiliate') {
					continue;
				}

				if (custom_field['required'] && !(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
					json['error'] = json['error'] || {};
					json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if (custom_field.type === 'text' && custom_field.validation) {
					const regex = new RegExp(custom_field.validation);
					if (!regex.test(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
						json['error'] = json['error'] || {};
						json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					}
				}
			}

			// Captcha
			if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('register')) {
				const captcha = await this.load.controller('extension/captcha/' + this.config.get('config_captcha') + '/validate');

				if (captcha) {
					json['error'] = json['error'] || {};
					json['error']['captcha'] = captcha;
				}
			}
		}

		if (!Object.keys(json).length) {
			const customer_id = await this.model_account_customer.addCustomer(this.request.post);

			// Default Payment Address
			this.load.model('account/address', this);

			const address_id = await this.model_account_address.addAddress(customer_id, this.request.post);

			// Set the address of default
			await this.model_account_customer.editAddressId(customer_id, address_id);

			// Clear any previous login attempts for unregistered accounts+
			await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);

			this.session.data['account'] = 'register';

			this.load.model('account/customer_group', this);

			const customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

			if (customer_group_info.customer_group_id && !customer_group_info['approval']) {
				await this.customer.login(this.request.post['email'], this.request.post['password']);

				this.session.data['payment_address'] = await this.model_account_address.getAddress(await this.customer.getAddressId());

				if ((this.request.post['shipping_address'])) {
					this.session.data['shipping_address'] = await this.model_account_address.getAddress(await this.customer.getAddressId());
				}
			} else {
				json['redirect'] = await this.url.link('account/success');
			}

			delete this.session.data['guest'];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
