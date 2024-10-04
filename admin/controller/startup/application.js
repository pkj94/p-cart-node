module.exports = class ApplicationController extends Controller {
	constructor(registry) {
		super(registry)
	}

	async index() {
		// Url
		this.registry.set('url', new UrlLibrary(this.config.get('site_url')));

		// Customer
		this.registry.set('customer', new (require(DIR_SYSTEM+'library/cart/customer'))(this.registry));

		// Currency
		this.registry.set('currency', new (require(DIR_SYSTEM+'library/cart/currency'))(this.registry));

		// Tax
		this.registry.set('tax', new (require(DIR_SYSTEM+'library/cart/tax'))(this.registry));

		if (this.config.get('config_tax_default') === 'shipping') {
			this.registry.get('tax').setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		if (this.config.get('config_tax_default') === 'payment') {
			this.registry.get('tax').setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		this.registry.get('tax').setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));

		// Weight
		this.registry.set('weight', new (require(DIR_SYSTEM+'library/cart/weight'))(this.registry));

		// Length
		this.registry.set('length', new (require(DIR_SYSTEM+'library/cart/length'))(this.registry));

		// Cart
		this.registry.set('cart', new (require(DIR_SYSTEM+'library/cart/cart'))(this.registry));
	}
}

