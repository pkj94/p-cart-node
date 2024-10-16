const sprintf = require("locutus/php/strings/sprintf");

module.exports = class FooterController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('common/footer');

		data['blog'] = await this.url.link('cms/blog', 'language=' + this.config.get('config_language'));

		this.load.model('catalog/information', this);

		data['informations'] = [];

		for (let result of await this.model_catalog_information.getInformations()) {
			if (result['bottom']) {
				data['informations'].push({
					'title': result['title'],
					'href': await this.url.link('information/information', 'language=' + this.config.get('config_language') + '&information_id=' + result['information_id'])
				});
			}
		}

		data['contact'] = await this.url.link('information/contact', 'language=' + this.config.get('config_language'));
		data['return'] = await this.url.link('account/returns+add', 'language=' + this.config.get('config_language'));

		if (this.config.get('config_gdpr_id')) {
			data['gdpr'] = await this.url.link('information/gdpr', 'language=' + this.config.get('config_language'));
		} else {
			data['gdpr'] = '';
		}

		data['sitemap'] = await this.url.link('information/sitemap', 'language=' + this.config.get('config_language'));
		data['manufacturer'] = await this.url.link('product/manufacturer', 'language=' + this.config.get('config_language'));
		data['voucher'] = await this.url.link('checkout/voucher', 'language=' + this.config.get('config_language'));

		if (this.config.get('config_affiliate_status')) {
			data['affiliate'] = await this.url.link('account/affiliate', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		} else {
			data['affiliate'] = '';
		}

		data['special'] = await this.url.link('product/special', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['account'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['order'] = await this.url.link('account/order', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['wishlist'] = await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['newsletter'] = await this.url.link('account/newsletter', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));

		data['powered'] = sprintf(this.language.get('text_powered'), this.config.get('config_name'), date('Y', new Date()));

		// Who's Online
		if (this.config.get('config_customer_online')) {
			this.load.model('tool/online', this);

			let ip = this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : '');

			let url = `${this.request.server.protocol}://${this.request.server.get('host')}${this.request.server.originalUrl}`;

			let referer = this.request.server.headers.referer || '';

			await this.model_tool_online.addOnline(ip, await this.customer.getId(), url, referer);
		}

		data['bootstrap'] = 'catalog/view/javascript/bootstrap/js/bootstrap.bundle.min.js';

		data['scripts'] = this.document.getScripts('footer');

		data['cookie'] = await this.load.controller('common/cookie');

		return await this.load.view('common/footer', data);
	}
}
