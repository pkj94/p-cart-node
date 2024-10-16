module.exports=class ApplicationController extends Controller {
	/**
	 * @return void
	 */
	async index(): void {
		// Weight
		this->registry->set('weight', new \Opencart\System\Library\Cart\Weight(this->registry));

		// Length
		this->registry->set('length', new \Opencart\System\Library\Cart\Length(this->registry));

		// Cart
		this->registry->set('cart', new \Opencart\System\Library\Cart\Cart(this->registry));
	}
}