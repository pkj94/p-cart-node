module.exports = class ControllerExtensionModulePilibabaButton extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/module/pilibaba_button');
		status = true;

		if (!await this.cart.hasProducts() || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			status = false;
		}

		if (status) {
			data['payment_url'] = await this.url.link('extension/payment/pilibaba/express', '', true);

			return await this.load.view('extension/module/pilibaba_button', data);
		}
	}
}