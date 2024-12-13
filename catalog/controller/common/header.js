module.exports = class ControllerCommonHeader extends Controller {
	async index() {
		const data = {};
		// Analytics
		this.load.model('setting/extension',this);

		data['analytics'] = [];

		const analytics = await this.model_setting_extension.getExtensions('analytics');

		for (let analytic of analytics) {
			if (Number(this.config.get('analytics_' + analytic['code'] + '_status'))) {
				data['analytics'].push(await this.load.controller('extension/analytics/' + analytic['code'], this.config.get('analytics_' + analytic['code'] + '_status')));
			}
		}
		let server = this.config.get('config_url');
		if (this.request.server['HTTPS']) {
			server = this.config.get('config_ssl');
		}

		if (is_file(DIR_IMAGE + this.config.get('config_icon'))) {
			this.document.addLink(server + 'image/' + this.config.get('config_icon'), 'icon');
		}

		data['title'] = this.document.getTitle();

		data['base'] = server;
		data['description'] = this.document.getDescription();
		data['keywords'] = this.document.getKeywords();
		data['links'] = this.document.getLinks();
		data['styles'] = this.document.getStyles();
		data['scripts'] = this.document.getScripts('header');
		data['lang'] = this.language.get('code');
		data['direction'] = this.language.get('direction');
		data['name'] = this.config.get('config_name');

		if (is_file(DIR_IMAGE + this.config.get('config_logo'))) {
			data['logo'] = server + 'image/' + this.config.get('config_logo');
		} else {
			data['logo'] = '';
		}

		await this.load.language('common/header');

		// Wishlist
		if (await this.customer.isLogged()) {
			this.load.model('account/wishlist', this);

			data['text_wishlist'] = sprintf(this.language.get('text_wishlist'), await this.model_account_wishlist.getTotalWishlist());
		} else {
			data['text_wishlist'] = sprintf(this.language.get('text_wishlist'), ((this.session.data['wishlist']) ? count(this.session.data['wishlist']) : 0));
		}

		data['text_logged'] = sprintf(this.language.get('text_logged'), await this.url.link('account/account', '', true), await this.customer.getFirstName(), await this.url.link('account/logout', '', true));

		data['home'] = await this.url.link('common/home');
		data['wishlist'] = await this.url.link('account/wishlist', '', true);
		data['logged'] = await this.customer.isLogged();
		data['account'] = await this.url.link('account/account', '', true);
		data['register'] = await this.url.link('account/register', '', true);
		data['login'] = await this.url.link('account/login', '', true);
		data['order'] = await this.url.link('account/order', '', true);
		data['transaction'] = await this.url.link('account/transaction', '', true);
		data['download'] = await this.url.link('account/download', '', true);
		data['logout'] = await this.url.link('account/logout', '', true);
		data['shopping_cart'] = await this.url.link('checkout/cart');
		data['checkout'] = await this.url.link('checkout/checkout', '', true);
		data['contact'] = await this.url.link('information/contact');
		data['telephone'] = this.config.get('config_telephone');

		data['language'] = await this.load.controller('common/language');
		data['currency'] = await this.load.controller('common/currency');
		data['search'] = await this.load.controller('common/search');
		data['cart'] = await this.load.controller('common/cart');
		data['menu'] = await this.load.controller('common/menu');

		return await this.load.view('common/header', data);
	}
}
