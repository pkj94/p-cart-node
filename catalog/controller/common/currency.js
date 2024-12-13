module.exports = class ControllerCommonCurrency extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/currency');

		data['action'] = await this.url.link('common/currency/currency', '', this.request.server['HTTPS']);

		data['code'] = this.session.data['currency'];

		this.load.model('localisation/currency', this);

		data['currencies'] = [];

		const results = await this.model_localisation_currency.getCurrencies();

		for (let [code, result] of Object.entries(results)) {
			if (result['status']) {
				data['currencies'].push({
					'title': result['title'],
					'code': result['code'],
					'symbol_left': result['symbol_left'],
					'symbol_right': result['symbol_right']
				});
			}
		}

		if (!(this.request.get['route'])) {
			data['redirect'] = await this.url.link('common/home');
		} else {
			const url_data = this.request.get;

			delete url_data['_route_'];

			let route = url_data['route'];

			delete url_data['route'];

			let url = '';

			if (url_data) {
				url = '&' + decodeURIComponent(http_build_query(url_data, '', '&'));
			}

			data['redirect'] = await this.url.link(route, url, this.request.server['HTTPS']);
		}

		return await this.load.view('common/currency', data);
	}

	async currency() {
		if ((this.request.post['code'])) {
			this.session.data['currency'] = this.request.post['code'];

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
		}

		if ((this.request.post['redirect']) && (this.request.post['redirect'].indexOf(this.config.get('config_url')) === 0 || this.request.post['redirect'].indexOf(this.config.get('config_ssl')) === 0)) {
			this.response.setRedirect(this.request.post['redirect']);
		} else {
			this.response.setRedirect(await this.url.link('common/home'));
		}
	}
}