module.exports = class PaymentAddress extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('api/sale/payment_address');

		const json = {};

		// Add keys for missing post vars
		keys = [
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

		if (country_info && country_info['postcode_required'] && (oc_strlen(this.request.post['postcode']) < 2 || oc_strlen(this.request.post['postcode']) > 10)) {
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

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'address') {
				if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
					json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
					json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
				}
			}
		}

		if (!Object.keys(json).length) {
			if (country_info) {
				country = country_info['name'];
				iso_code_2 = country_info['iso_code_2'];
				iso_code_3 = country_info['iso_code_3'];
				address_format = country_info['address_format'];
			} else {
				country = '';
				iso_code_2 = '';
				iso_code_3 = '';
				address_format = '';
			}

			this.load.model('localisation/zone', this);

			zone_info = await this.model_localisation_zone.getZone(this.request.post['zone_id']);

			if (zone_info) {
				zone = zone_info['name'];
				zone_code = zone_info['code'];
			} else {
				zone = '';
				zone_code = '';
			}

			this.session.data['payment_address'] = {
				'address_id': this.request.post['payment_address_id'],
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
				'custom_field': (this.request.post['custom_field']) ? this.request.post['custom_field'] : []
			};

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
