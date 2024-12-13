const trim = require("locutus/php/strings/trim");

module.exports = class ControllerCheckoutShippingAddress extends Controller {
	async index() {
		const data = {};
		await this.load.language('checkout/checkout');

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['address_id'])) {
			data['address_id'] = this.session.data['shipping_address']['address_id'];
		} else {
			data['address_id'] = await this.customer.getAddressId();
		}
		
		this.load.model('account/address', this);

		data['addresses'] = await this.model_account_address.getAddresses();

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['postcode'])) {
			data['postcode'] = this.session.data['shipping_address']['postcode'];
		} else {
			data['postcode'] = '';
		}

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['country_id'])) {
			data['country_id'] = this.session.data['shipping_address']['country_id'];
		} else {
			data['country_id'] = this.config.get('config_country_id');
		}

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['zone_id'])) {
			data['zone_id'] = this.session.data['shipping_address']['zone_id'];
		} else {
			data['zone_id'] = '';
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();
		// Custom Fields
		data['custom_fields'] = [];

		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'address') {
				data['custom_fields'].push(custom_field);
			}
		}

		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['custom_field'])) {
			data['shipping_address_custom_field'] = this.session.data['shipping_address']['custom_field'];
		} else {
			data['shipping_address_custom_field'] = {};
		}

		this.response.setOutput(await this.load.view('checkout/shipping_address', data));
	}

	async save() {
		await this.load.language('checkout/checkout');

		const json = {};

		// Validate if customer is logged in+
		if (!await this.customer.isLogged()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate if shipping is required+ If not the customer should not have reached this page.
		if (!await this.cart.hasShipping()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && !(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart');
		}

		// Validate minimum quantity requirements+
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
			this.load.model('account/address', this);

			if ((this.request.post['shipping_address']) && this.request.post['shipping_address'] == 'existing') {
				if (!(this.request.post['address_id'])) {
					json['error'] = json['error'] || {};
					json['error']['warning'] = this.language.get('error_address');
				} else if (!Object.keys(await this.model_account_address.getAddresses()).includes(this.request.post['address_id'])) {
					json['error'] = json['error'] || {};
					json['error']['warning'] = this.language.get('error_address');
				}

				if (!Object.keys(json).length) {
					this.session.data['shipping_address'] = await this.model_account_address.getAddress(this.request.post['address_id']);

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
				}
			} else {
				if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
					json['error'] = json['error'] || {};
					json['error']['firstname'] = this.language.get('error_firstname');
				}

				if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
					json['error'] = json['error'] || {};
					json['error']['lastname'] = this.language.get('error_lastname');
				}

				if ((utf8_strlen(trim(this.request.post['address_1'])) < 3) || (utf8_strlen(trim(this.request.post['address_1'])) > 128)) {
					json['error'] = json['error'] || {};
					json['error']['address_1'] = this.language.get('error_address_1');
				}

				if ((utf8_strlen(trim(this.request.post['city'])) < 2) || (utf8_strlen(trim(this.request.post['city'])) > 128)) {
					json['error'] = json['error'] || {};
					json['error']['city'] = this.language.get('error_city');
				}

				this.load.model('localisation/country', this);

				const country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

				if (country_info.country_id && country_info['postcode_required'] && (utf8_strlen(trim(this.request.post['postcode'])) < 2 || utf8_strlen(trim(this.request.post['postcode'])) > 10)) {
					json['error'] = json['error'] || {};
					json['error']['postcode'] = this.language.get('error_postcode');
				}

				if (this.request.post['country_id'] == '') {
					json['error'] = json['error'] || {};
					json['error']['country'] = this.language.get('error_country');
				}

				if (!(this.request.post['zone_id']) || this.request.post['zone_id'] == '' || !is_numeric(this.request.post['zone_id'])) {
					json['error'] = json['error'] || {};
					json['error']['zone'] = this.language.get('error_zone');
				}

				// Custom field validation
				this.load.model('account/custom_field', this);

				const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

				for (let custom_field of custom_fields) {
					if (custom_field['location'] == 'address') {
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
				}

				if (!json) {
					const address_id = await this.model_account_address.addAddress(await this.customer.getId(), this.request.post);

					this.session.data['shipping_address'] = await this.model_account_address.getAddress(address_id);

					// If no default address ID set we use the last address
					if (!await this.customer.getAddressId()) {
						this.load.model('account/customer', this);

						await this.model_account_customer.editAddressId(await this.customer.getId(), address_id);
					}

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
				}
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}