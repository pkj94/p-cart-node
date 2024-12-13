module.exports = class ControllerExtensionModuleSagepayDirectCards extends Controller {
	async index() {
const data = {};
		if (this.config.get('module_sagepay_direct_cards_status') && this.config.get('payment_sagepay_direct_status') && await this.customer.isLogged()) {
			await this.load.language('account/sagepay_direct_cards');

			data['card'] = await this.url.link('account/sagepay_direct_cards', '', true);

			return await this.load.view('extension/module/sagepay_direct_cards', data);
		}
	}

}