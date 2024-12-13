module.exports = class ControllerExtensionModuleSagepayServerCards extends Controller {
	async index() {
const data = {};
		if (this.config.get('module_sagepay_server_cards_status') && this.config.get('payment_sagepay_server_status') && await this.customer.isLogged()) {
			await this.load.language('account/sagepay_server_cards');

			data['card'] = await this.url.link('account/sagepay_server_cards', '', true);

			return await this.load.view('extension/module/sagepay_server_cards', data);
		}
	}

}