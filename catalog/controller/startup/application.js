module.exports = class ApplicationController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		// Weight
		this.registry.set('weight', new (require(DIR_SYSTEM + 'library/cart/weight'))(this.registry));

		// Length
		this.registry.set('length', new (require(DIR_SYSTEM + 'library/cart/length'))(this.registry));

		// Cart
		this.registry.set('cart', new (require(DIR_SYSTEM + 'library/cart/cart'))(this.registry));
		return true;
	}
}