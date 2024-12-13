module.exports = class ControllerExtensionModuleAccount extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/module/account');

		data['logged'] = await this.customer.isLogged();
		data['register'] = await this.url.link('account/register', '', true);
		data['login'] = await this.url.link('account/login', '', true);
		data['logout'] = await this.url.link('account/logout', '', true);
		data['forgotten'] = await this.url.link('account/forgotten', '', true);
		data['account'] = await this.url.link('account/account', '', true);
		data['edit'] = await this.url.link('account/edit', '', true);
		data['password'] = await this.url.link('account/password', '', true);
		data['address'] = await this.url.link('account/address', '', true);
		data['wishlist'] = await this.url.link('account/wishlist');
		data['order'] = await this.url.link('account/order', '', true);
		data['download'] = await this.url.link('account/download', '', true);
		data['reward'] = await this.url.link('account/reward', '', true);
		data['return'] = await this.url.link('account/return', '', true);
		data['transaction'] = await this.url.link('account/transaction', '', true);
		data['newsletter'] = await this.url.link('account/newsletter', '', true);
		data['recurring'] = await this.url.link('account/recurring', '', true);

		return await this.load.view('extension/module/account', data);
	}
}