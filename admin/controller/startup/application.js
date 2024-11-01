module.exports = class ApplicationController extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}

	async index() {
		// Url
		const url = new global['\Opencart\System\Library\Url'](this.config.get('site_url'));
		this.registry.set('url', url);

		// Customer
		const customer = new global['\Opencart\System\Library\Cart\Customer'](this.registry);
		this.registry.set('customer', customer);

		// Currency
		const currency = new global['\Opencart\System\Library\Cart\Currency'](this.registry);
		this.registry.set('currency', currency);

		// Tax
		const tax = new global['\Opencart\System\Library\Cart\Tax'](this.registry);
		this.registry.set('tax', tax);

		if (this.config.get('config_tax_default') === 'shipping') {
			tax.setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		if (this.config.get('config_tax_default') === 'payment') {
			tax.setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		tax.setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));

		// Weight
		const weight = new global['\Opencart\System\Library\Cart\Weight'](this.registry);
		this.registry.set('weight', weight);

		// Length
		const length = new global['\Opencart\System\Library\Cart\Length'](this.registry);
		this.registry.set('length', length);

		// Cart
		const cart = new global['\Opencart\System\Library\Cart\Cart'](this.registry);
		this.registry.set('cart', cart);
	}
}

