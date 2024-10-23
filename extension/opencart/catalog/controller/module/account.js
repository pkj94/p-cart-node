global['\Opencart\Catalog\Controller\Extension\Opencart\Module\Account'] = class Account extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/module/account');

		data['logged'] = await this.customer.isLogged();
		data['register'] = await this.url.link('account/register', 'language=' + this.config.get('config_language'));
		data['login'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'));
		data['logout'] = await this.url.link('account/logout', 'language=' + this.config.get('config_language'));
		data['forgotten'] = await this.url.link('account/forgotten', 'language=' + this.config.get('config_language'));
		data['account'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['edit'] = await this.url.link('account/edit', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['password'] = await this.url.link('account/password', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['address'] = await this.url.link('account/address', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['wishlist'] = await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['order'] = await this.url.link('account/order', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['download'] = await this.url.link('account/download', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['reward'] = await this.url.link('account/reward', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['return'] = await this.url.link('account/returns', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['transaction'] = await this.url.link('account/transaction', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['newsletter'] = await this.url.link('account/newsletter', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['subscription'] = await this.url.link('account/subscription', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));

		return await this.load.view('extension/opencart/module/account', data);
	}
}