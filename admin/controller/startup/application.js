module.exports = class ApplicationController extends global['OpencartSystemEngineController'] {
	constructor(registry) {
		super(registry)
	}

	async index() {
		// Url
		const url = new global['OpencartSystemLibraryUrl'](this.config.get('site_url'));
		this.registry.set('url', url);

		// Customer
		const customer = new global['OpencartSystemLibraryCart\Customer'](this.registry);
		this.registry.set('customer', customer);

		// Currency
		const currency = new global['OpencartSystemLibraryCart\Currency'](this.registry);
		this.registry.set('currency', currency);

		// Tax
		const tax = new global['OpencartSystemLibraryCart\Tax'](this.registry);
		this.registry.set('tax', tax);

		if (this.config.get('config_tax_default') === 'shipping') {
			tax.setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		if (this.config.get('config_tax_default') === 'payment') {
			tax.setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		tax.setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));

		// Weight
		const weight = new global['OpencartSystemLibraryCart\Weight'](this.registry);
		this.registry.set('weight', weight);

		// Length
		const length = new global['OpencartSystemLibraryCart\Length'](this.registry);
		this.registry.set('length', length);

		// Cart
		const cart = new global['OpencartSystemLibraryCart\Cart'](this.registry);
		this.registry.set('cart', cart);
	}
}

