const trim = require("locutus/php/strings/trim");

module.exports = class ControllerApiShipping extends Controller {
	async address() {
		await this.load.language('api/shipping');

		// Delete old shipping address, shipping methods and method so not to cause any issues if there is an error
		delete this.session.data['shipping_address'];
		delete this.session.data['shipping_methods'];
		delete this.session.data['shipping_method'];

		const json = {};

		if (await this.cart.hasShipping()) {
			if (!(this.session.data['api_id'])) {
				json['error'] = json['error'] || {};
				json['error']['warning'] = this.language.get('error_permission');
			} else {
				// Add keys for missing post vars
				const keys = [
					'firstname',
					'lastname',
					'company',
					'address_1',
					'address_2',
					'postcode',
					'city',
					'zone_id',
					'country_id'
				];

				for (let key of keys) {
					if (!(this.request.post[key])) {
						this.request.post[key] = '';
					}
				}

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

				if ((utf8_strlen(this.request.post['city']) < 2) || (utf8_strlen(this.request.post['city']) > 128)) {
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

				if (!(this.request.post['zone_id']) || this.request.post['zone_id'] == '') {
					json['error'] = json['error'] || {};
					json['error']['zone'] = this.language.get('error_zone');
				}

				// Custom field validation
				this.load.model('account/custom_field', this);

				const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

				for (let custom_field of custom_fields) {
					if (custom_field['location'] == 'address') {
						if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
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

				if (!Object.keys(json).length) {
					this.load.model('localisation/country', this);

					let country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);
					let country = '';
					let iso_code_2 = '';
					let iso_code_3 = '';
					let address_format = '';
					if (country_info.country_id) {
						country = country_info['name'];
						iso_code_2 = country_info['iso_code_2'];
						iso_code_3 = country_info['iso_code_3'];
						address_format = country_info['address_format'];
					}

					this.load.model('localisation/zone', this);

					let zone_info = await this.model_localisation_zone.getZone(this.request.post['zone_id']);
					let zone = '';
					let zone_code = '';
					if (zone_info) {
						zone = zone_info['name'];
						zone_code = zone_info['code'];
					}

					this.session.data['shipping_address'] = {
						'firstname': this.request.post['firstname'],
						'lastname': this.request.post['lastname'],
						'company': this.request.post['company'],
						'address_1': this.request.post['address_1'],
						'address_2': this.request.post['address_2'],
						'postcode': this.request.post['postcode'],
						'city': this.request.post['city'],
						'zone_id': this.request.post['zone_id'],
						'zone': zone,
						'zone_code': zone_code,
						'country_id': this.request.post['country_id'],
						'country': country,
						'iso_code_2': iso_code_2,
						'iso_code_3': iso_code_3,
						'address_format': address_format,
						'custom_field': (this.request.post['custom_field']) ? this.request.post['custom_field'] : {}
					};

					json['success'] = this.language.get('text_address');

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
				}
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async methods() {
		await this.load.language('api/shipping');

		// Delete past shipping methods and method just in case there is an error
		delete this.session.data['shipping_methods'];
		delete this.session.data['shipping_method'];

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else if (await this.cart.hasShipping()) {
			if (!(this.session.data['shipping_address'])) {
				json['error'] = this.language.get('error_address');
			}

			if (!Object.keys(json).length) {
				// Shipping Methods
				json['shipping_methods'] = {};

				this.load.model('setting/extension', this);

				const results = await this.model_setting_extension.getExtensions('shipping');

				for (let result of results) {
					if (this.config.get('shipping_' + result['code'] + '_status')) {
						this.load.model('extension/shipping/' + result['code'], this);

						const quote = await this['model_extension_shipping_' + result['code']].getQuote(this.session.data['shipping_address']);

						if (quote) {
							json['shipping_methods'][result['code']] = {
								'title': quote['title'],
								'quote': quote['quote'],
								'sort_order': quote['sort_order'],
								'error': quote['error']
							};
						}
					}
				}
				json['shipping_methods'] = Object.entries(json['shipping_methods'])
					.sort(([, a], [, b]) => a.sort_order - b.sort_order)
					.reduce((r, [k, v]) => ({ ...r, [k]: v }), {})

				if (json['shipping_methods']) {
					this.session.data['shipping_methods'] = json['shipping_methods'];
				} else {
					json['error'] = this.language.get('error_no_shipping');
				}
			}
		} else {
			json['shipping_methods'] = {};
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async method() {
		await this.load.language('api/shipping');

		// Delete old shipping method so not to cause any issues if there is an error
		delete this.session.data['shipping_method'];

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			if (await this.cart.hasShipping()) {
				// Shipping Address
				if (!(this.session.data['shipping_address'])) {
					json['error'] = this.language.get('error_address');
				}

				// Shipping Method
				if (!(this.session.data['shipping_methods'])) {
					json['error'] = this.language.get('error_no_shipping');
				} else if (!(this.request.post['shipping_method'])) {
					json['error'] = this.language.get('error_method');
				} else {
					const shipping = this.request.post['shipping_method'].split('.');

					if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
						json['error'] = this.language.get('error_method');
					}
				}

				if (!Object.keys(json).length) {
					this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];

					json['success'] = this.language.get('text_method');
				}
			} else {
				delete this.session.data['shipping_address'];
				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
