module.exports = class Account extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/account');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete (this.session.data['success']);
		} else {
			data['success'] = '';
		}

		data['edit'] = await this.url.link('account/edit', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['password'] = await this.url.link('account/password', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['address'] = await this.url.link('account/address', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['payment_method'] = await this.url.link('account/payment_method', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['wishlist'] = await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['order'] = await this.url.link('account/order', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['subscription'] = await this.url.link('account/subscription', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['download'] = await this.url.link('account/download', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		if (this.config.get('total_reward_status')) {
			data['reward'] = await this.url.link('account/reward', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		} else {
			data['reward'] = '';
		}

		data['return'] = await this.url.link('account/returns', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['transaction'] = await this.url.link('account/transaction', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['newsletter'] = await this.url.link('account/newsletter', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		if (this.config.get('config_affiliate_status')) {
			data['affiliate'] = await this.url.link('account/affiliate', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

			this.load.model('account/affiliate', this);

			const affiliate_info = await this.model_account_affiliate.getAffiliate(await this.customer.getId());

			if (affiliate_info) {
				data['tracking'] = await this.url.link('account/tracking', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
			} else {
				data['tracking'] = '';
			}
		} else {
			data['affiliate'] = '';
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/account', data));
	}
}
