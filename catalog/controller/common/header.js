const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
module.exports = class HeaderController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		// Analytics
		data['analytics'] = [];

		if (!this.config.get('config_cookie_id') || ((this.request.cookie['policy']) && this.request.cookie['policy'])) {
			this.load.model('setting/extension', this);

			const analytics = await this.model_setting_extension.getExtensionsByType('analytics');

			for (let analytic of analytics) {
				if (this.config.get('analytics_' + analytic['code'] + '_status')) {
					data['analytics'].push(await this.load.controller('extension/' + analytic['extension'] + '/analytics/' + analytic['code'], this.config.get('analytics_' + analytic['code'] + '_status')));
				}
			}
		}

		data['lang'] = this.language.get('code');
		data['direction'] = this.language.get('direction');

		data['title'] = this.document.getTitle();
		data['base'] = this.config.get('config_url');
		data['description'] = this.document.getDescription();
		data['keywords'] = this.document.getKeywords();

		// Hard coding css so they can be replaced via the event's system+
		data['bootstrap'] = 'catalog/view/stylesheet/bootstrap.css';
		data['icons'] = 'catalog/view/stylesheet/fonts/fontawesome/css/all.min.css';
		data['stylesheet'] = 'catalog/view/stylesheet/stylesheet.css';

		// Hard coding scripts so they can be replaced via the event's system+
		data['jquery'] = 'catalog/view/javascript/jquery/jquery-3.7.1.min.js';

		data['links'] = this.document.getLinks();
		data['styles'] = this.document.getStyles();
		data['scripts'] = this.document.getScripts('header');

		data['name'] = this.config.get('config_name');

		if (this.config.get('config_logo') && fs.existsSync(DIR_IMAGE + this.config.get('config_logo'))) {
			data['logo'] = this.config.get('config_url') + 'image/' + this.config.get('config_logo');
		} else {
			data['logo'] = '';
		}

		await this.load.language('common/header');

		// Wishlist
		if (await this.customer.isLogged()) {
			this.load.model('account/wishlist', this);

			data['text_wishlist'] = sprintf(this.language.get('text_wishlist'), await this.model_account_wishlist.getTotalWishlist());
		} else {
			data['text_wishlist'] = sprintf(this.language.get('text_wishlist'), ((this.session.data['wishlist']) ? this.session.data['wishlist'].length : 0));
		}

		data['home'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));
		data['wishlist'] = await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['logged'] = await this.customer.isLogged();

		if (!await this.customer.isLogged()) {
			data['register'] = await this.url.link('account/register', 'language=' + this.config.get('config_language'));
			data['login'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'));
		} else {
			data['account'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
			data['order'] = await this.url.link('account/order', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
			data['transaction'] = await this.url.link('account/transaction', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
			data['download'] = await this.url.link('account/download', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
			data['logout'] = await this.url.link('account/logout', 'language=' + this.config.get('config_language'));
		}

		data['shopping_cart'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'));
		data['checkout'] = await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'));
		data['contact'] = await this.url.link('information/contact', 'language=' + this.config.get('config_language'));
		data['telephone'] = this.config.get('config_telephone');

		data['language'] = await this.load.controller('common/language');
		data['currency'] = await this.load.controller('common/currency');
		data['search'] = await this.load.controller('common/search');
		data['cart'] = await this.load.controller('common/cart');
		data['menu'] = await this.load.controller('common/menu');

		return await this.load.view('common/header', data);
	}
}
