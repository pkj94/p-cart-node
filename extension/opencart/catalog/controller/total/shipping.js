const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ShippingController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		if (this.config.get('total_shipping_status') && this.config.get('total_shipping_estimator') && await this.cart.hasShipping()) {
			await this.load.language('extension/opencart/total/shipping');

			if ((this.session.data['shipping_address'])) {
				data['postcode'] = this.session.data['shipping_address']['postcode'];
				data['country_id'] = this.session.data['shipping_address']['country_id'];
				data['zone_id'] = this.session.data['shipping_address']['zone_id'];
			} else {
				data['postcode'] = '';
				data['country_id'] = this.config.get('config_country_id');
				data['zone_id'] = '';
			}

			if ((this.session.data['shipping_method'])) {
				data['code'] = this.session.data['shipping_method']['code'];
			} else {
				data['code'] = '';
			}

			this.load.model('localisation/country', this);

			data['countries'] = await this.model_localisation_country.getCountries();

			data['language'] = this.config.get('config_language');

			return await this.load.view('extension/opencart/total/shipping', data);
		}

		return '';
	}

	/**
	 * @return void
	 */
	async quote() {
		await this.load.language('extension/opencart/total/shipping');

		const json = {};

		let keys = [
			'postcode',
			'country_id',
			'zone_id'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if (!await this.cart.hasProducts()) {
			json['error']['warning'] = this.language.get('error_product');
		}

		if (!await this.cart.hasShipping()) {
			json['error']['warning'] = sprintf(this.language.get('error_no_shipping'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
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

		if (!json.error) {
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

			const zone_info = await this.model_localisation_zone.getZone(this.request.post['zone_id']);
			let zone = '';
			let zone_code = '';
			if (zone_info.zone_id) {
				zone = zone_info['name'];
				zone_code = zone_info['code'];
			} else {
				zone = '';
				zone_code = '';
			}

			this.session.data['shipping_address'] = {
				'postcode': this.request.post['postcode'],
				'zone_id': this.request.post['zone_id'],
				'zone': zone,
				'zone_code': zone_code,
				'country_id': this.request.post['country_id'],
				'country': country,
				'iso_code_2': iso_code_2,
				'iso_code_3': iso_code_3
			};

			this.tax.setShippingAddress(this.request.post['country_id'], this.request.post['zone_id']);

			// Shipping Methods
			this.load.model('checkout/shipping_method', this);

			const shipping_methods = await this.model_checkout_shipping_method.getMethods(this.session.data['shipping_address']);

			if (shipping_methods.length) {
				json['shipping_methods'] = this.session.data['shipping_methods'] = shipping_methods;
			} else {
				json['error']['warning'] = sprintf(this.language.get('error_no_shipping'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/shipping');

		const json = {};

		if ((this.request.post['shipping_method'])) {
			const shipping = this.request.post['shipping_method'].split('.');

			if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
				json['error'] = this.language.get('error_shipping');
			}
		} else {
			json['error'] = this.language.get('error_shipping');
		}

		if (!json.error) {
			this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];

			json['success'] = this.language.get('text_success');

			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
