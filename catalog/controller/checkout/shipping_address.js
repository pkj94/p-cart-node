const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ShippingAddress extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/shipping_address');

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), Number(this.config.get('config_file_max_size')));
		data['config_file_max_size'] = (Number(this.config.get('config_file_max_size')) * 1024 * 1024);
		data['payment_address_required'] = Number(this.config.get('config_checkout_payment_address'));

		data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));

		this.load.model('account/address', this);

		data['addresses'] = await this.model_account_address.getAddresses(await this.customer.getId());

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['address_id'])) {
			data['address_id'] = this.session.data['shipping_address']['address_id'];
		} else {
			data['address_id'] = 0;
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((this.session.data['shipping_address'])) {
			data['postcode'] = this.session.data['shipping_address']['postcode'];
			data['country_id'] = this.session.data['shipping_address']['country_id'];
			data['zone_id'] = this.session.data['shipping_address']['zone_id'];
		} else {
			data['postcode'] = '';
			data['country_id'] = this.config.get('config_country_id');
			data['zone_id'] = '';
		}

		// Custom Fields
		data['custom_fields'] = [];

		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(await this.customer.getGroupId());

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'address') {
				data['custom_fields'].push(custom_field);
			}
		}

		data['language'] = this.config.get('config_language');

		return await this.load.view('checkout/shipping_address', data);
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('checkout/shipping_address');

		const json = {};

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && !this.session.data['vouchers']) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let [cart_id, product] of Object.entries(products)) {
			if (!product['minimum']) {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);

				break;
			}
		}

		// Validate if customer is logged in or customer session data is not set
		if (!await this.customer.isLogged() || !(this.session.data['customer'])) {
			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		// Validate if shipping not required
		if (!await this.cart.hasShipping()) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			let keys = [
				'firstname',
				'lastname',
				'company',
				'address_1',
				'address_2',
				'city',
				'postcode',
				'country_id',
				'zone_id',
				'custom_field'
			];

			for (let key of keys) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((oc_strlen(this.request.post['address_1']) < 3) || (oc_strlen(this.request.post['address_1']) > 128)) {
				json['error']['address_1'] = this.language.get('error_address_1');
			}

			if ((oc_strlen(this.request.post['city']) < 2) || (oc_strlen(this.request.post['city']) > 128)) {
				json['error']['city'] = this.language.get('error_city');
			}

			this.load.model('localisation/country', this);

			const country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

			if (country_info.country_id && country_info['postcode_required'] && (oc_strlen(this.request.post['postcode']) < 2 || oc_strlen(this.request.post['postcode']) > 10)) {
				json['error']['postcode'] = this.language.get('error_postcode');
			}

			if (this.request.post['country_id'] == '') {
				json['error']['country'] = this.language.get('error_country');
			}

			if (this.request.post['zone_id'] == '') {
				json['error']['zone'] = this.language.get('error_zone');
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(await this.customer.getGroupId());

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'address') {
					if (custom_field['required'] && !this.request.post['custom_field'][custom_field['custom_field_id']]) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !new RegExp(html_entity_decode(custom_field['validation'])).test(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}
		}

		if (!Object.keys(json).length) {
			// If no default address add it
			let address_id = await this.customer.getAddressId();

			if (!address_id) {
				this.request.post['default'] = 1;
			}

			this.load.model('account/address', this);

			json['address_id'] = await this.model_account_address.addAddress(await this.customer.getId(), this.request.post);

			json['addresses'] = await this.model_account_address.getAddresses(await this.customer.getId());

			this.session.data['shipping_address'] = await this.model_account_address.getAddress(await this.customer.getId(), json['address_id']);

			json['success'] = this.language.get('text_success');

			// Clear payment and shipping methods
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async address() {
		await this.load.language('checkout/shipping_address');

		const json = {};
		let address_id = 0;
		if ((this.request.get['address_id'])) {
			address_id = this.request.get['address_id'];
		} else {
			address_id = 0;
		}

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && !this.session.data['vouchers']) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let [cart_id, product] of Object.entries(products)) {
			if (!product['minimum']) {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);

				break;
			}
		}

		// Validate if customer is logged in or customer session data is not set
		if (!await this.customer.isLogged() || !(this.session.data['customer'])) {
			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		// Validate if shipping is not required
		if (!await this.cart.hasShipping()) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}
		let address_info;
		if (!Object.keys(json).length) {
			this.load.model('account/address', this);

			address_info = await this.model_account_address.getAddress(await this.customer.getId(), address_id);

			if (!address_info) {
				json['error'] = this.language.get('error_address');

				delete this.session.data['shipping_address'];
				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
			}
		}

		if (!Object.keys(json).length) {
			this.session.data['shipping_address'] = address_info;

			json['success'] = this.language.get('text_success');

			// Clear payment and shipping methods
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