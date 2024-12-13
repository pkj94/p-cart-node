const array_key_exists = require("locutus/php/array/array_key_exists");
const setcookie = require("locutus/php/network/setcookie");
const rtrim = require("locutus/php/strings/rtrim");

module.exports = class ControllerStartupStartup extends Controller {

	async __(key) {
		// To make sure that calls to  also support dynamic properties from the registry
		// See https://www.php+net/manual/en/language+oop5+overloading.js#object+
		if (this.registry) {
			if (this.registry.get(key) !== null) {
				return true;
			}
		}
		return false;
	}

	async index() {
const data = {};
		// Store
		let query = {};
		if (this.request.server.protocol == 'https') {
			query = await this.db.query("SELECT * FROM " + DB_PREFIX + "store WHERE REPLACE(`ssl`, 'www.', '') = '" + this.db.escape('https://' + this.request.server.hostname.replace('www.', '') + expressPath.dirname(DIR_OPENCART).replace(/[\/\\.]+$/, '') + '/') + "'");
		} else {
			query = await this.db.query("SELECT * FROM " + DB_PREFIX + "store WHERE REPLACE(`url`, 'www.', '') = '" + this.db.escape('http://' + this.request.server.hostname.replace('www.', '') + expressPath.dirname(DIR_OPENCART).replace(/[\/\\.]+$/, '') + '/') + "'");
		}

		if ((this.request.get['store_id'])) {
			this.config.set('config_store_id', this.request.get['store_id']);
		} else if (query.num_rows) {
			this.config.set('config_store_id', query.row['store_id']);
		} else {
			this.config.set('config_store_id', 0);
		}

		if (!query.num_rows) {
			this.config.set('config_url', HTTP_SERVER);
			this.config.set('config_ssl', HTTPS_SERVER);
		}

		// Settings
		query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE store_id = '0' OR store_id = '" + this.config.get('config_store_id') + "' ORDER BY store_id ASC");

		for (let result of query.rows) {
			if (!result['serialized']) {
				this.config.set(result['key'], result['value']);
			} else {
				this.config.set(result['key'], JSON.parse(result['value'], true));
			}
		}

		// Set time zone
		if (this.config.get('config_timezone')) {
			process.tz = (this.config.get('config_timezone'));

			// Sync PHP and DB time zones+
			await this.db.query("SET time_zone = '" + this.db.escape(date('P')) + "'");
		}

		// Theme
		this.config.set('template_cache', this.config.get('developer_theme'));

		// Url
		this.registry.set('url', new Url(this.config.get('config_url'), this.config.get('config_ssl')));

		// Language
		let code = '';

		this.load.model('localisation/language', this);

		const languages = await this.model_localisation_language.getLanguages();

		if ((this.session.data['language'])) {
			code = this.session.data['language'];
		}

		if ((this.request.cookie['language']) && !array_key_exists(code, languages)) {
			code = this.request.cookie['language'];
		}

		// Language Detection
		if ((this.request.server['HTTP_ACCEPT_LANGUAGE']) && !array_key_exists(code, languages)) {
			let detect = '';

			let browser_languages = this.request.server['HTTP_ACCEPT_LANGUAGE'].split(',');

			// Try using local to detect the language
			for (let browser_language of browser_languages) {
				for (let [key, value] of Object.entries(languages)) {
					if (value['status']) {
						let locale = value['locale'].split(',');

						if (locale.includes(browser_language)) {
							detect = key;
							break;
						}
					}
				}
			}

			if (!detect) {
				// Try using language folder to detect the language
				for (browser_languages of browser_language) {
					if (array_key_exists(browser_language.toLowerCase(), languages)) {
						detect = browser_language.toLowerCase();

						break;
					}
				}
			}

			code = detect ? detect : '';
		}

		if (!array_key_exists(code, languages)) {
			code = this.config.get('config_language');
		}

		if (!(this.session.data['language']) || this.session.data['language'] != code) {
			this.session.data['language'] = code;
		}

		if (!(this.request.cookie['language']) || this.request.cookie['language'] != code) {
			setcookie('language', code, new Date() + 60 * 60 * 24 * 30, '/');
		}

		// Overwrite the default language object
		const language = new Language(code);
		await language.load(code);

		this.registry.set('language', language);

		// Set the config language_id
		this.config.set('config_language_id', languages[code]['language_id']);

		// Customer
		const customer = new CartCustomer(this.registry);
		await customer.init();
		this.registry.set('customer', customer);

		// Customer Group
		if ((this.session.data['customer']) && (this.session.data['customer']['customer_group_id'])) {
			// For API calls
			this.config.set('config_customer_group_id', this.session.data['customer']['customer_group_id']);
		} else if (await this.customer.isLogged()) {
			// Logged in customers
			this.config.set('config_customer_group_id',await  this.customer.getGroupId());
		} else if ((this.session.data['guest']) && (this.session.data['guest']['customer_group_id'])) {
			this.config.set('config_customer_group_id', this.session.data['guest']['customer_group_id']);
		} else {
			this.config.set('config_customer_group_id', this.config.get('config_customer_group_id'));
		}

		// Tracking Code
		if ((this.request.get['tracking'])) {
			setcookie('tracking', this.request.get['tracking'], new Date() + 3600 * 24 * 1000, '/');

			await this.db.query("UPDATE `" + DB_PREFIX + "marketing` SET clicks = (clicks + 1) WHERE code = '" + this.db.escape(this.request.get['tracking']) + "'");
		}

		// Currency
		code = '';

		this.load.model('localisation/currency', this);

		const currencies = await this.model_localisation_currency.getCurrencies();

		if ((this.session.data['currency'])) {
			code = this.session.data['currency'];
		}

		if ((this.request.cookie['currency']) && !array_key_exists(code, currencies)) {
			code = this.request.cookie['currency'];
		}

		if (!array_key_exists(code, currencies)) {
			code = this.config.get('config_currency');
		}

		if (!(this.session.data['currency']) || this.session.data['currency'] != code) {
			this.session.data['currency'] = code;
		}

		if (!(this.request.cookie['currency']) || this.request.cookie['currency'] != code) {
			setcookie('currency', code, new Date().getTime() + 1000 * 60 * 60 * 24 * 30, '/');
		}
		const currency = new CartCurrency(this.registry);
		await currency.init();
		this.registry.set('currency', currency);

		// Tax
		const tax = new CartTax(this.registry);
		this.registry.set('tax', tax);

		// NODE v16+ validation compatibility+
		if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['country_id']) && (this.session.data['shipping_address'] && this.session.data['shipping_address']['zone_id'])) {
			await this.tax.setShippingAddress(this.session.data['shipping_address']['country_id'], this.session.data['shipping_address']['zone_id']);
		} else if (this.config.get('config_tax_default') == 'shipping') {
			await this.tax.setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		if ((this.session.data['payment_address'] && this.session.data['payment_address']['country_id']) && (this.session.data['payment_address'] && this.session.data['payment_address']['zone_id'])) {
			await this.tax.setPaymentAddress(this.session.data['payment_address']['country_id'], this.session.data['payment_address']['zone_id']);
		} else if (this.config.get('config_tax_default') == 'payment') {
			await this.tax.setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		await this.tax.setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));

		// Weight
		const weight = new CartWeight(this.registry);
		this.registry.set('weight', weight);

		// Length
		const length = new CartLength(this.registry);
		await length.init();
		this.registry.set('length', length);

		// Cart
		const cart = new CartCart(this.registry);
		await cart.init();
		this.registry.set('cart', cart);

		// Encryption
		this.registry.set('encryption', new Encryption());
		await this.session.save(this.session.data)
	}
}
