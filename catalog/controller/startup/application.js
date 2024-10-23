module.exports = class Application extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		// Weight
		this.registry.set('weight', new (require(DIR_SYSTEM + 'library/cart/weight'))(this.registry));

		// Length
		this.registry.set('length', new (require(DIR_SYSTEM + 'library/cart/length'))(this.registry));

		// Cart
		let cart = new (require(DIR_SYSTEM + 'library/cart/cart'))(this.registry);
		await cart.init();
		this.registry.set('cart', cart);
		return true;
	}
}