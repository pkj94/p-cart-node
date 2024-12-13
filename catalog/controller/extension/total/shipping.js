module.exports = class ControllerExtensionTotalShipping extends Controller {
	async index() {
		const data = {};
		if (this.config.get('total_shipping_status') && this.config.get('total_shipping_estimator') && this.cart.hasShipping()) {
			await this.load.language('extension/total/shipping');

			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['country_id'])) {
				data['country_id'] = this.session.data['shipping_address']['country_id'];
			} else {
				data['country_id'] = this.config.get('config_country_id');
			}

			this.load.model('localisation/country', this);

			data['countries'] = await this.model_localisation_country.getCountries();

			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['zone_id'])) {
				data['zone_id'] = this.session.data['shipping_address']['zone_id'];
			} else {
				data['zone_id'] = '';
			}

			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['postcode'])) {
				data['postcode'] = this.session.data['shipping_address']['postcode'];
			} else {
				data['postcode'] = '';
			}

			if ((this.session.data['shipping_method'])) {
				data['shipping_method'] = this.session.data['shipping_method']['code'];
			} else {
				data['shipping_method'] = '';
			}

			return await this.load.view('extension/total/shipping', data);
		}
	}

	async quote() {
		await this.load.language('extension/total/shipping');

		const json = { error: {} };

		if (!await this.cart.hasProducts()) {
			json['error']['warning'] = this.language.get('error_product');
		}

		if (!await this.cart.hasShipping()) {
			json['error']['warning'] = sprintf(this.language.get('error_no_shipping'), await this.url.link('information/contact'));
		}

		if (this.request.post['country_id'] == '') {
			json['error']['country'] = this.language.get('error_country');
		}

		if (!(this.request.post['zone_id']) || this.request.post['zone_id'] == '' || !is_numeric(this.request.post['zone_id'])) {
			json['error']['zone'] = this.language.get('error_zone');
		}

		this.load.model('localisation/country', this);

		const country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

		if (country_info.country_id && country_info['postcode_required'] && (utf8_strlen(trim(this.request.post['postcode'])) < 2 || utf8_strlen(trim(this.request.post['postcode'])) > 10)) {
			json['error']['postcode'] = this.language.get('error_postcode');
		}

		if (!Object.keys(json.error).length) {
			await this.tax.unsetRates();
			await this.tax.setShippingAddress(this.request.post['country_id'], this.request.post['zone_id']);
			if ((this.session.data['payment_address']['country_id']) && (this.session.data['payment_address']['zone_id'])) {
				await this.tax.setPaymentAddress(this.session.data['payment_address']['country_id'], this.session.data['payment_address']['zone_id']);
			} else if (this.config.get('config_tax_default') == 'payment') {
				await this.tax.setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
			}
			await this.tax.setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
			let country = '';
			let iso_code_2 = '';
			let iso_code_3 = '';
			let address_format = '';
			if (country_info) {
				country = country_info['name'];
				iso_code_2 = country_info['iso_code_2'];
				iso_code_3 = country_info['iso_code_3'];
				address_format = country_info['address_format'];
			}

			this.load.model('localisation/zone', this);

			const zone_info = await this.model_localisation_zone.getZone(this.request.post['zone_id']);
			let zone = '';
			let zone_code = '';
			if (zone_info) {
				zone = zone_info['name'];
				zone_code = zone_info['code'];
			}

			this.session.data['shipping_address'] = {
				'firstname': '',
				'lastname': '',
				'company': '',
				'address_1': '',
				'address_2': '',
				'postcode': this.request.post['postcode'],
				'city': '',
				'zone_id': this.request.post['zone_id'],
				'zone': zone,
				'zone_code': zone_code,
				'country_id': this.request.post['country_id'],
				'country': country,
				'iso_code_2': iso_code_2,
				'iso_code_3': iso_code_3,
				'address_format': address_format
			};

			const quote_data = {};

			this.load.model('setting/extension', this);

			const results = await this.model_setting_extension.getExtensions('shipping');

			for (let result of results) {
				if (this.config.get('shipping_' + result['code'] + '_status')) {
					this.load.model('extension/shipping/' + result['code'], this);

					const quote = await this['model_extension_shipping_' + result['code']].getQuote(this.session.data['shipping_address']);

					if (quote.code) {
						quote_data[result['code']] = {
							'title': quote['title'],
							'quote': quote['quote'],
							'sort_order': quote['sort_order'],
							'error': quote['error']
						};
					}
				}
			}

			// sort_order = array();

			// for (quote_data of key : value) {
			// 	sort_order[key] = value['sort_order'];
			// }

			// array_multisort(sort_order, SORT_ASC, quote_data);

			this.session.data['shipping_methods'] = quote_data;

			if (this.session.data['shipping_methods']) {
				json['shipping_method'] = this.session.data['shipping_methods'];
			} else {
				json['error']['warning'] = sprintf(this.language.get('error_no_shipping'), await this.url.link('information/contact'));
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async shipping() {
		await this.load.language('extension/total/shipping');

		const json = {};

		if ((this.request.post['shipping_method'])) {
			let shipping = this.request.post['shipping_method'].split('.');

			if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
				json['warning'] = this.language.get('error_shipping');
			}
		} else {
			json['warning'] = this.language.get('error_shipping');
		}

		if (!Object.keys(json).length) {
			let shipping = this.request.post['shipping_method'].split('.');

			this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('checkout/cart');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async country() {
		let json = {};

		this.load.model('localisation/country', this);

		const country_info = await this.model_localisation_country.getCountry(this.request.get['country_id']);

		if (country_info.country_id) {
			this.load.model('localisation/zone', this);

			json = {
				'country_id': country_info['country_id'],
				'name': country_info['name'],
				'iso_code_2': country_info['iso_code_2'],
				'iso_code_3': country_info['iso_code_3'],
				'address_format': country_info['address_format'],
				'postcode_required': country_info['postcode_required'],
				'zone': await this.model_localisation_zone.getZonesByCountryId(this.request.get['country_id']),
				'status': country_info['status']
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
