module.exports = class ControllerCheckoutGuest extends Controller {
	async index() {
const data = {};
		await this.load.language('checkout/checkout');

		data['customer_groups'] = array();

		if (Array.isArray(this.config.get('config_customer_group_display'))) {
			this.load.model('account/customer_group',this);

			customer_groups = await this.model_account_customer_group.getCustomerGroups();

			for (customer_groups of customer_group) {
				if (in_array(customer_group['customer_group_id'], this.config.get('config_customer_group_display'))) {
					data['customer_groups'].push(customer_group;
				}
			}
		}

		if ((this.session.data['guest']['customer_group_id'])) {
			data['customer_group_id'] = this.session.data['guest']['customer_group_id'];
		} else {
			data['customer_group_id'] = this.config.get('config_customer_group_id');
		}

		if ((this.session.data['guest']['firstname'])) {
			data['firstname'] = this.session.data['guest']['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.session.data['guest']['lastname'])) {
			data['lastname'] = this.session.data['guest']['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.session.data['guest']['email'])) {
			data['email'] = this.session.data['guest']['email'];
		} else {
			data['email'] = '';
		}

		if ((this.session.data['guest']['telephone'])) {
			data['telephone'] = this.session.data['guest']['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((this.session.data['payment_address']['company'])) {
			data['company'] = this.session.data['payment_address']['company'];
		} else {
			data['company'] = '';
		}

		if ((this.session.data['payment_address']['address_1'])) {
			data['address_1'] = this.session.data['payment_address']['address_1'];
		} else {
			data['address_1'] = '';
		}

		if ((this.session.data['payment_address']['address_2'])) {
			data['address_2'] = this.session.data['payment_address']['address_2'];
		} else {
			data['address_2'] = '';
		}

		if ((this.session.data['payment_address']['postcode'])) {
			data['postcode'] = this.session.data['payment_address']['postcode'];
		} else if ((this.session.data['shipping_address']['postcode'])) {
			data['postcode'] = this.session.data['shipping_address']['postcode'];
		} else {
			data['postcode'] = '';
		}

		if ((this.session.data['payment_address']['city'])) {
			data['city'] = this.session.data['payment_address']['city'];
		} else {
			data['city'] = '';
		}

		if ((this.session.data['payment_address']['country_id'])) {
			data['country_id'] = this.session.data['payment_address']['country_id'];
		} else if ((this.session.data['shipping_address']['country_id'])) {
			data['country_id'] = this.session.data['shipping_address']['country_id'];
		} else {
			data['country_id'] = this.config.get('config_country_id');
		}

		if ((this.session.data['payment_address']['zone_id'])) {
			data['zone_id'] = this.session.data['payment_address']['zone_id'];
		} else if ((this.session.data['shipping_address']['zone_id'])) {
			data['zone_id'] = this.session.data['shipping_address']['zone_id'];
		} else {
			data['zone_id'] = '';
		}

		this.load.model('localisation/country',this);

		data['countries'] = await this.model_localisation_country.getCountries();

		// Custom Fields
		this.load.model('account/custom_field',this);

		data['custom_fields'] = await this.model_account_custom_field.getCustomFields();

		if ((this.session.data['guest']['custom_field'])) {
			if ((this.session.data['guest']['custom_field'])) {
				guest_custom_field = this.session.data['guest']['custom_field'];
			} else {
				guest_custom_field = array();
			}

			if ((this.session.data['payment_address']['custom_field'])) {
				address_custom_field = this.session.data['payment_address']['custom_field'];
			} else {
				address_custom_field = array();
			}

			data['guest_custom_field'] = guest_custom_field + address_custom_field;
		} else {
			data['guest_custom_field'] = array();
		}

		data['shipping_required'] = await this.cart.hasShipping();

		if ((this.session.data['guest']['shipping_address'])) {
			data['shipping_address'] = this.session.data['guest']['shipping_address'];
		} else {
			data['shipping_address'] = true;
		}

		// Captcha
		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && in_array('guest', this.config.get('config_captcha_page'))) {
			data['captcha'] = await this.load.controller('extension/captcha/' + this.config.get('config_captcha'));
		} else {
			data['captcha'] = '';
		}
		
		this.response.setOutput(await this.load.view('checkout/guest', data));
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

			if ((utf8_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
				json['error']['email'] = this.language.get('error_email');
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

			// Customer Group
			if ((this.request.post['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && in_array(this.request.post['customer_group_id'], this.config.get('config_customer_group_display'))) {
				customer_group_id = this.request.post['customer_group_id'];
			} else {
				customer_group_id = this.config.get('config_customer_group_id');
			}

			// Custom field validation
			this.load.model('account/custom_field',this);

			custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

			for (custom_fields of custom_field) {
				if(custom_field['location'] == 'affiliate') {
					continue;
				}
				
				if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
					json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if ((custom_field['type'] == 'text') && !empty(custom_field['validation']) && !filter_var(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' : array('regexp' : custom_field['validation'])))) {
                    json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
                }
			}

			// Captcha
			if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && in_array('guest', this.config.get('config_captcha_page'))) {
				captcha = await this.load.controller('extension/captcha/' + this.config.get('config_captcha') + '/validate');

				if (captcha) {
					json['error']['captcha'] = captcha;
				}
			}
		}

		if (!json) {
			this.session.data['account'] = 'guest';

			this.session.data['guest']['customer_group_id'] = customer_group_id;
			this.session.data['guest']['firstname'] = this.request.post['firstname'];
			this.session.data['guest']['lastname'] = this.request.post['lastname'];
			this.session.data['guest']['email'] = this.request.post['email'];
			this.session.data['guest']['telephone'] = this.request.post['telephone'];

			if ((this.request.post['custom_field']['account'])) {
				this.session.data['guest']['custom_field'] = this.request.post['custom_field']['account'];
			} else {
				this.session.data['guest']['custom_field'] = array();
			}

			this.session.data['payment_address']['firstname'] = this.request.post['firstname'];
			this.session.data['payment_address']['lastname'] = this.request.post['lastname'];
			this.session.data['payment_address']['company'] = this.request.post['company'];
			this.session.data['payment_address']['address_1'] = this.request.post['address_1'];
			this.session.data['payment_address']['address_2'] = this.request.post['address_2'];
			this.session.data['payment_address']['postcode'] = this.request.post['postcode'];
			this.session.data['payment_address']['city'] = this.request.post['city'];
			this.session.data['payment_address']['country_id'] = this.request.post['country_id'];
			this.session.data['payment_address']['zone_id'] = this.request.post['zone_id'];

			this.load.model('localisation/country',this);

			country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

			if (country_info) {
				this.session.data['payment_address']['country'] = country_info['name'];
				this.session.data['payment_address']['iso_code_2'] = country_info['iso_code_2'];
				this.session.data['payment_address']['iso_code_3'] = country_info['iso_code_3'];
				this.session.data['payment_address']['address_format'] = country_info['address_format'];
			} else {
				this.session.data['payment_address']['country'] = '';
				this.session.data['payment_address']['iso_code_2'] = '';
				this.session.data['payment_address']['iso_code_3'] = '';
				this.session.data['payment_address']['address_format'] = '';
			}

			if ((this.request.post['custom_field']['address'])) {
				this.session.data['payment_address']['custom_field'] = this.request.post['custom_field']['address'];
			} else {
				this.session.data['payment_address']['custom_field'] = array();
			}

			this.load.model('localisation/zone',this);

			zone_info = await this.model_localisation_zone.getZone(this.request.post['zone_id']);

			if (zone_info) {
				this.session.data['payment_address']['zone'] = zone_info['name'];
				this.session.data['payment_address']['zone_code'] = zone_info['code'];
			} else {
				this.session.data['payment_address']['zone'] = '';
				this.session.data['payment_address']['zone_code'] = '';
			}

			if (!empty(this.request.post['shipping_address'])) {
				this.session.data['guest']['shipping_address'] = this.request.post['shipping_address'];
			} else {
				this.session.data['guest']['shipping_address'] = false;
			}

			if (this.session.data['guest']['shipping_address']) {
				this.session.data['shipping_address']['firstname'] = this.request.post['firstname'];
				this.session.data['shipping_address']['lastname'] = this.request.post['lastname'];
				this.session.data['shipping_address']['company'] = this.request.post['company'];
				this.session.data['shipping_address']['address_1'] = this.request.post['address_1'];
				this.session.data['shipping_address']['address_2'] = this.request.post['address_2'];
				this.session.data['shipping_address']['postcode'] = this.request.post['postcode'];
				this.session.data['shipping_address']['city'] = this.request.post['city'];
				this.session.data['shipping_address']['country_id'] = this.request.post['country_id'];
				this.session.data['shipping_address']['zone_id'] = this.request.post['zone_id'];

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

				if (zone_info) {
					this.session.data['shipping_address']['zone'] = zone_info['name'];
					this.session.data['shipping_address']['zone_code'] = zone_info['code'];
				} else {
					this.session.data['shipping_address']['zone'] = '';
					this.session.data['shipping_address']['zone_code'] = '';
				}

				if ((this.request.post['custom_field']['address'])) {
					this.session.data['shipping_address']['custom_field'] = this.request.post['custom_field']['address'];
				} else {
					this.session.data['shipping_address']['custom_field'] = array();
				}
			}

			delete this.session.data['shipping_method']);
			delete this.session.data['shipping_methods']);
			delete this.session.data['payment_method']);
			delete this.session.data['payment_methods']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
