module.exports = class ModelExtensionShippingAusPost extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/auspost');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + Number(this.config.get('shipping_auspost_geo_zone_id')) + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_auspost_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let error = '';

		let api_key = this.config.get('shipping_auspost_api');

		const quote_data = {};

		if (status) {
			let weight = this.weight.convert(await this.cart.getWeight(), this.config.get('config_weight_class_id'), this.config.get('shipping_auspost_weight_class_id'));

			let length = 0;
			let width = 0;
			let height = 0;

			if (address['iso_code_2'] == 'AU') {

				for (let product of await this.cart.getProducts()) {
					if (product['height'] > height) {
						height = product['height'];
					}

					if (product['width'] > width) {
						width = product['width'];
					}

					length += (product['length'] * product['quantity']);
				}
				try {
					let response = await require('axios').get('https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json', {
						headers: { 'AUTH-KEY': apiKey },
						params: {
							from_postcode: fromPostcode,
							to_postcode: toPostcode,
							height: height,
							width: width,
							length: length,
							weight: weight
						},
						httpsAgent: new (require('https').Agent)({
							rejectUnauthorized: false // Equivalent to CURLOPT_SSL_VERIFYPEER = 0 and CURLOPT_SSL_VERIFYHOST = 0 
						})
					});

					response = response.data;


					if (response) {
						let response_info = {};

						const response_parts = response;

						if ((response_parts['error'])) {
							error = response_parts['error']['errorMessage'];
						} else {
							const response_services = response_parts['services']['service'];

							for (let response_service of response_services) {
								quote_data[response_service['name']] = {
									'code': 'auspost.' + response_service['name'],
									'title': response_service['name'],
									'cost': this.currency.convert(response_service['price'], 'AUD', this.config.get('config_currency')),
									'tax_class_id': this.config.get('shipping_auspost_tax_class_id'),
									'text': this.currency.format(this.tax.calculate(this.currency.convert(response_service['price'], 'AUD', this.session.data['currency']), this.config.get('shipping_auspost_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'], 1.0000000)
								};
							}
						}
					}
				} catch (e) {

				}
			} else {
				let response = await require('axios').get('https://digitalapi.auspost.com.au/postage/parcel/international/service.json', {
					headers: { 'AUTH-KEY': apiKey },
					params: {
						country_code: address['iso_code_2'],
						weight: weight
					},
					httpsAgent: new (require('https').Agent)({
						rejectUnauthorized: false // Equivalent to CURLOPT_SSL_VERIFYPEER = 0 and CURLOPT_SSL_VERIFYHOST = 0 
					})
				});

				response = response.data;

				if (response) {
					const response_info = {};

					const response_parts = response;

					if ((response_parts['error'])) {
						error = response_parts['error']['errorMessage'];
					} else {
						response_services = response_parts['services']['service'];

						for (let response_service of response_services) {
							quote_data[response_service['name']] = {
								'code': 'auspost.' + response_service['name'],
								'title': response_service['name'],
								'cost': this.currency.convert(response_service['price'], 'AUD', this.config.get('config_currency')),
								'tax_class_id': this.config.get('shipping_auspost_tax_class_id'),
								'text': this.currency.format(this.tax.calculate(this.currency.convert(response_service['price'], 'AUD', this.session.data['currency']), this.config.get('shipping_auspost_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'], 1.0000000)
							};
						}
					}
				}
			}
		}

		let method_data = {};

		if (Object.keys(quote_data).length) {
			method_data = {
				'code': 'auspost',
				'title': this.language.get('text_title'),
				'quote': quote_data,
				'sort_order': this.config.get('shipping_auspost_sort_order'),
				'error': error
			};
		}

		return method_data;
	}
}