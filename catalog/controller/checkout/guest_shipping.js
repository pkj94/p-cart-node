module.exports = class ControllerCheckoutGuestShipping extends Controller {
	async index() {
const data = {};
		await this.load.language('checkout/checkout');

		if ((this.session.data['shipping_address']['firstname'])) {
			data['firstname'] = this.session.data['shipping_address']['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.session.data['shipping_address']['lastname'])) {
			data['lastname'] = this.session.data['shipping_address']['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.session.data['shipping_address']['company'])) {
			data['company'] = this.session.data['shipping_address']['company'];
		} else {
			data['company'] = '';
		}

		if ((this.session.data['shipping_address']['address_1'])) {
			data['address_1'] = this.session.data['shipping_address']['address_1'];
		} else {
			data['address_1'] = '';
		}

		if ((this.session.data['shipping_address']['address_2'])) {
			data['address_2'] = this.session.data['shipping_address']['address_2'];
		} else {
			data['address_2'] = '';
		}

		if ((this.session.data['shipping_address']['postcode'])) {
			data['postcode'] = this.session.data['shipping_address']['postcode'];
		} else {
			data['postcode'] = '';
		}

		if ((this.session.data['shipping_address']['city'])) {
			data['city'] = this.session.data['shipping_address']['city'];
		} else {
			data['city'] = '';
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

		this.load.model('localisation/country',this);

		data['countries'] = await this.model_localisation_country.getCountries();

		// Custom Fields
		data['custom_fields'] = array();

		this.load.model('account/custom_field',this);

		custom_fields = await this.model_account_custom_field.getCustomFields(this.session.data['guest']['customer_group_id']);

		for (custom_fields of custom_field) {
			if (custom_field['location'] == 'address') {
				data['custom_fields'].push(custom_field;
			}
		}

		if ((this.session.data['shipping_address']['custom_field'])) {
			data['address_custom_field'] = this.session.data['shipping_address']['custom_field'];
		} else {
			data['address_custom_field'] = array();
		}

		this.response.setOutput(await this.load.view('checkout/guest_shipping', data));
	}

	async save() {
		await this.load.language('checkout/checkout');

		const json = {};

		// Validate if customer is logged in+
		if (await this.customer.isLogged()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate cart has products and has stock+
		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart');
		}

		// Check if guest checkout is available+
		if (!this.config.get('config_checkout_guest') || Number(this.config.get('config_customer_price')) || this.cart.hasDownload()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		if (!json) {
			if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((utf8_strlen(trim(this.request.post['address_1'])) < 3) || (utf8_strlen(trim(this.request.post['address_1'])) > 128)) {
				json['error']['address_1'] = this.language.get('error_address_1');
			}

			if ((utf8_strlen(trim(this.request.post['city'])) < 2) || (utf8_strlen(trim(this.request.post['city'])) > 128)) {
				json['error']['city'] = this.language.get('error_city');
			}

			this.load.model('localisation/country',this);

			country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

			if (country_info && country_info['postcode_required'] && (utf8_strlen(trim(this.request.post['postcode'])) < 2 || utf8_strlen(trim(this.request.post['postcode'])) > 10)) {
				json['error']['postcode'] = this.language.get('error_postcode');
			}

			if (this.request.post['country_id'] == '') {
				json['error']['country'] = this.language.get('error_country');
			}

			if (!(this.request.post['zone_id']) || this.request.post['zone_id'] == '' || !is_numeric(this.request.post['zone_id'])) {
				json['error']['zone'] = this.language.get('error_zone');
			}

			// Custom field validation
			this.load.model('account/custom_field',this);

			custom_fields = await this.model_account_custom_field.getCustomFields(this.session.data['guest']['customer_group_id']);

			for (custom_fields of custom_field) {
				if (custom_field['location'] == 'address') { 
					if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
						json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && !empty(custom_field['validation']) && !filter_var(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' : array('regexp' : custom_field['validation'])))) {
						json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					}
				}
			}
		}

		if (!json) {
			this.session.data['shipping_address']['firstname'] = this.request.post['firstname'];
			this.session.data['shipping_address']['lastname'] = this.request.post['lastname'];
			this.session.data['shipping_address']['company'] = this.request.post['company'];
			this.session.data['shipping_address']['address_1'] = this.request.post['address_1'];
			this.session.data['shipping_address']['address_2'] = this.request.post['address_2'];
			this.session.data['shipping_address']['postcode'] = this.request.post['postcode'];
			this.session.data['shipping_address']['city'] = this.request.post['city'];
			this.session.data['shipping_address']['country_id'] = this.request.post['country_id'];
			this.session.data['shipping_address']['zone_id'] = this.request.post['zone_id'];

			this.load.model('localisation/country',this);

			country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

			if (country_info) {
				this.session.data['shipping_address']['country'] = country_info['name'];
				this.session.data['shipping_address']['iso_code_2'] = country_info['iso_code_2'];
				this.session.data['shipping_address']['iso_code_3'] = country_info['iso_code_3'];
				this.session.data['shipping_address']['address_format'] = country_info['address_format'];
			} else {
				this.session.data['shipping_address']['country'] = '';
				this.session.data['shipping_address']['iso_code_2'] = '';
				this.session.data['shipping_address']['iso_code_3'] = '';
				this.session.data['shipping_address']['address_format'] = '';
			}

			this.load.model('localisation/zone',this);

			zone_info = await this.model_localisation_zone.getZone(this.request.post['zone_id']);

			if (zone_info) {
				this.session.data['shipping_address']['zone'] = zone_info['name'];
				this.session.data['shipping_address']['zone_code'] = zone_info['code'];
			} else {
				this.session.data['shipping_address']['zone'] = '';
				this.session.data['shipping_address']['zone_code'] = '';
			}

			if ((this.request.post['custom_field'])) {
				this.session.data['shipping_address']['custom_field'] = this.request.post['custom_field']['address'];
			} else {
				this.session.data['shipping_address']['custom_field'] = array();
			}

			delete this.session.data['shipping_method']);
			delete this.session.data['shipping_methods']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}