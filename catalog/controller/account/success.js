const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Success extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		console.log(this.session.data)
		const data = {};
		await this.load.language('account/success');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/success', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''))
		});

		if (await this.customer.isLogged()) {
			data['text_message'] = sprintf(this.language.get('text_success'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
		} else {
			data['text_message'] = sprintf(this.language.get('text_approval'), this.config.get('config_name'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
		}

		if (await this.cart.hasProducts()) {
			data['continue'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'));
		} else {
			data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}