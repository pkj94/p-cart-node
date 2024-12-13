module.exports = class ControllerCheckoutCheckout extends Controller {
	async index() {
		const data = {};
		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && !(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			this.response.setRedirect(await this.url.link('checkout/cart'));
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
				this.response.setRedirect(await this.url.link('checkout/cart'));
			}
		}

		await this.load.language('checkout/checkout');

		this.document.setTitle(this.language.get('heading_title'));

		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
		this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

		// Required by klarna
		if (this.config.get('payment_klarna_account') || this.config.get('payment_klarna_invoice')) {
			this.document.addScript('http://cdn.klarna.com/public/kitt/toc/v1.0/js/klarna.terms.min.js');
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_cart'),
			'href': await this.url.link('checkout/cart')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('checkout/checkout', '', true)
		});

		data['text_checkout_option'] = sprintf(this.language.get('text_checkout_option'), 1);
		data['text_checkout_account'] = sprintf(this.language.get('text_checkout_account'), 2);
		data['text_checkout_payment_address'] = sprintf(this.language.get('text_checkout_payment_address'), 2);
		data['text_checkout_shipping_address'] = sprintf(this.language.get('text_checkout_shipping_address'), 3);
		data['text_checkout_shipping_method'] = sprintf(this.language.get('text_checkout_shipping_method'), 4);

		if (await this.cart.hasShipping()) {
			data['text_checkout_payment_method'] = sprintf(this.language.get('text_checkout_payment_method'), 5);
			data['text_checkout_confirm'] = sprintf(this.language.get('text_checkout_confirm'), 6);
		} else {
			data['text_checkout_payment_method'] = sprintf(this.language.get('text_checkout_payment_method'), 3);
			data['text_checkout_confirm'] = sprintf(this.language.get('text_checkout_confirm'), 4);
		}

		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];
			delete this.session.data['error'];
		} else {
			data['error_warning'] = '';
		}

		data['logged'] = await this.customer.isLogged();

		if ((this.session.data['account'])) {
			data['account'] = this.session.data['account'];
		} else {
			data['account'] = '';
		}

		data['shipping_required'] = await this.cart.hasShipping();

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('checkout/checkout', data));
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

	async customfield() {
		const json = [];

		this.load.model('account/custom_field', this);

		// Customer Group
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((this.request.get['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && this.config.get('config_customer_group_display').includes(this.request.get['customer_group_id'])) {
			customer_group_id = this.request.get['customer_group_id'];
		}
		const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

		for (let custom_field of custom_fields) {
			json.push({
				'custom_field_id': custom_field['custom_field_id'],
				'required': custom_field['required']
			});
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}