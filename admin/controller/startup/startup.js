module.exports = class ControllerStartupStartup extends Controller {
	async index() {
const data = {};
		// Settings
		let query = await this.db.query("SELECT * FROM " + DB_PREFIX + "setting WHERE store_id = '0'");

		for (let setting of query.rows) {
			if (!setting['serialized']) {
				this.config.set(setting['key'], setting['value']);
			} else {
				this.config.set(setting['key'], JSON.parse(setting['value']));
			}
		}

		// Set time zone
		if (this.config.get('config_timezone')) {
			process.tz = this.config.get('config_timezone');

			// Sync PHP and DB time zones.
			await this.db.query("SET time_zone = '" + this.db.escape(date('P')) + "'");
		}

		// Theme
		this.config.set('template_cache', this.config.get('developer_theme'));

		// Language
		query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "language` WHERE code = '" + this.db.escape(this.config.get('config_admin_language')) + "'");

		if (query.num_rows) {
			this.config.set('config_language_id', query.row['language_id']);
		}

		// Language
		const language = new Language(this.config.get('config_admin_language'));
		language.load(this.config.get('config_admin_language'));
		this.registry.set('language', language);

		// Customer
		this.registry.set('customer', new CartCustomer(this.registry));

		// Currency
		this.registry.set('currency', new CartCurrency(this.registry));

		// Tax
		this.registry.set('tax', new CartTax(this.registry));

		if (this.config.get('config_tax_default') == 'shipping') {
			this.tax.setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		if (this.config.get('config_tax_default') == 'payment') {
			this.tax.setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		this.tax.setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));

		// Weight
		this.registry.set('weight', new CartWeight(this.registry));

		// Length
		this.registry.set('length', new CartLength(this.registry));

		// Cart
		this.registry.set('cart', new CartCart(this.registry));

		// Encryption
		this.registry.set('encryption', new Encryption());
	}
}
