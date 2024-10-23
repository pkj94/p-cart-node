module.exports = class Tracking extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/tracking', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		if (!this.config.get('config_affiliate_status')) {
			this.response.setRedirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}

		this.load.model('account/affiliate', this);

		affiliate_info = await this.model_account_affiliate.getAffiliate(await this.customer.getId());

		if (!affiliate_info) {
			this.response.setRedirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}

		await this.load.language('account/tracking');

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

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/tracking', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		data['text_description'] = sprintf(this.language.get('text_description'), this.config.get('config_name'));

		data['code'] = affiliate_info['tracking'];

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['language'] = this.config.get('config_language');

		data['customer_token'] = this.session.data['customer_token'];

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/tracking', data));
	}

	/**
	 * @return void
	 */
	async autocomplete() {
		const json = {};

		if ((this.request.get['search'])) {
			search = this.request.get['search'];
		} else {
			search = '';
		}

		if ((this.request.get['tracking'])) {
			tracking = this.request.get['tracking'];
		} else {
			tracking = '';
		}

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/password', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			filter_data = {
				'filter_search': search,
				'start': 0,
				'limit': 5
			};

			this.load.model('catalog/product', this);

			const results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
				json.push({
					'name': strip_tags(html_entity_decode(result['name'])),
					'link': str_replace('&amp;', '&', await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + result['product_id'] + '&tracking=' + tracking))
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}