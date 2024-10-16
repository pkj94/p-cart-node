module.exports = class CurrencyController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('common/currency');

		data['action'] = await this.url.link('common/currency.save', 'language=' + this.config.get('config_language'));

		data['code'] = this.session.data['currency'];

		let url_data = this.request.get;
		let route = this.config.get('action_default');
		if ((url_data['route'])) {
			route = url_data['route'];
		}

		delete url_data['route'];
		delete url_data['_route_'];

		data['currencies'] = [];

		this.load.model('localisation/currency', this);

		const results = await this.model_localisation_currency.getCurrencies();

		for (let result of results) {
			if (result['status']) {
				data['currencies'].push({
					'title': result['title'],
					'code': result['code'],
					'symbol_left': result['symbol_left'],
					'symbol_right': result['symbol_right']
				});
			}
		}

		let url = '';

		if (url_data) {
			url += '&' + decodeURIComponent(http_build_query(url_data, '', '&'));
		}

		data['redirect'] = await this.url.link(route, url);

		return await this.load.view('common/currency', data);
	}

	/**
	 * @return void
	 */
	async save() {
		if ((this.request.post['code'])) {
			this.session.data['currency'] = this.request.post['code'];

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
		}
		let expire = new Date();
		expire.setTime(expire.getTime() + (days * 24 * 60 * 60 * 1000));
		let option = {
			'expires': expire,
			'path': '/',
			'SameSite': 'Lax'
		};

		this.response.response.cookie('currency', this.session.data['currency'], option);
		await this.session.save();
		if ((this.request.post['redirect']) && this.request.post['redirect'].substring(0, this.config.get('config_url').length) == this.config.get('config_url')) {
			this.response.redirect(this.request.post['redirect'].replace('&amp;', '&'));
		} else {
			this.response.redirect(await this.url.link(this.config.get('action_default')));
		}
	}
}