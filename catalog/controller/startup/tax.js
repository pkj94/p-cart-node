module.exports = class Tax extends Controller {
	/**
	 * @return void
	 */
	async index() {
		this.registry.set('tax', new (require(DIR_SYSTEM + 'library/cart/tax'))(this.registry));
		// console.log('config_country_id',this.config.get('config_country_id'))
		// console.log('config_zone_id',this.config.get('config_zone_id'))
		if ((this.session.data['shipping_address'])) {
			this.registry.get('tax').setShippingAddress(this.session.data['shipping_address']['country_id'], this.session.data['shipping_address']['zone_id']);
		} else if (this.config.get('config_tax_default') == 'shipping') {
			this.registry.get('tax').setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}

		if ((this.session.data['payment_address'])) {
			this.registry.get('tax').setPaymentAddress(this.session.data['payment_address']['country_id'], this.session.data['payment_address']['zone_id']);
		} else if (this.config.get('config_tax_default') == 'payment') {
			this.registry.get('tax').setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		}
		// console.log(this.session.data,this.config.get('config_country_id'),this.config.get('config_zone_id'))
		this.registry.get('tax').setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
		return true;
	}
}