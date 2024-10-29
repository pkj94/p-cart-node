module.exports = class Logout extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		if (await this.customer.isLogged()) {
			await this.customer.logout();

			delete this.session.data['customer'];
			delete this.session.data['shipping_address'];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_address'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['comment'];
			delete this.session.data['order_id'];
			delete this.session.data['coupon'];
			delete this.session.data['reward'];
			delete this.session.data['voucher'];
			delete this.session.data['vouchers'];
			delete this.session.data['customer_token'];

			this.response.setRedirect(await this.url.link('account/logout', 'language=' + this.config.get('config_language')));
		}

		await this.load.language('account/logout');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_logout'),
			'href': await this.url.link('account/logout', 'language=' + this.config.get('config_language'))
		});

		data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}
