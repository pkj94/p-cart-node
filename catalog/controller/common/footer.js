module.exports = class ControllerCommonFooter extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/footer');

		this.load.model('catalog/information', this);

		data['informations'] = [];

		for (let result of await this.model_catalog_information.getInformations()) {
			if (result['bottom']) {
				data['informations'].push({
					'title': result['title'],
					'href': await this.url.link('information/information', 'information_id=' + result['information_id'])
				});
			}
		}

		data['contact'] = await this.url.link('information/contact');
		data['return'] = await this.url.link('account/return/add', '', true);
		data['sitemap'] = await this.url.link('information/sitemap');
		data['tracking'] = await this.url.link('information/tracking');
		data['manufacturer'] = await this.url.link('product/manufacturer');
		data['voucher'] = await this.url.link('account/voucher', '', true);
		data['affiliate'] = await this.url.link('affiliate/login', '', true);
		data['special'] = await this.url.link('product/special');
		data['account'] = await this.url.link('account/account', '', true);
		data['order'] = await this.url.link('account/order', '', true);
		data['wishlist'] = await this.url.link('account/wishlist', '', true);
		data['newsletter'] = await this.url.link('account/newsletter', '', true);

		data['powered'] = sprintf(this.language.get('text_powered'), this.config.get('config_name'), date('Y', new Date()));

		// Whos Online
		if (Number(this.config.get('config_customer_online'))) {
			this.load.model('tool/online', this);
			let ip = '';
			if ((this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : ''))) {
				ip = this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : '');
			}
			let url = '';
			if ((this.request.server['HTTP_HOST']) && (this.request.server['REQUEST_URI'])) {
				url = (this.request.server['HTTPS'] ? 'https://' : 'http://') + this.request.server['HTTP_HOST'] + this.request.server['REQUEST_URI'];
			}
			let referer = this.request.server.headers.referer || '';


			await this.model_tool_online.addOnline(ip, await this.customer.getId(), url, referer);
		}

		data['scripts'] = this.document.getScripts('footer');
		data['styles'] = this.document.getStyles('footer');

		return await this.load.view('common/footer', data);
	}
}
