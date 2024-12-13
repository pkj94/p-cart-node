const is_numeric = require("locutus/php/var/is_numeric");

module.exports = class ControllerExtensionTotalReward extends Controller {
	async index() {
		const data = {};
		const points = await this.customer.getRewardPoints();

		let points_total = 0;

		for (let product of await this.cart.getProducts()) {
			if (product['points']) {
				points_total += product['points'];
			}
		}

		if (points && points_total && this.config.get('total_reward_status')) {
			await this.load.language('extension/total/reward');

			data['heading_title'] = sprintf(this.language.get('heading_title'), points);

			data['entry_reward'] = sprintf(this.language.get('entry_reward'), points_total);

			if ((this.session.data['reward'])) {
				data['reward'] = this.session.data['reward'];
			} else {
				data['reward'] = '';
			}

			return await this.load.view('extension/total/reward', data);
		}
	}

	async reward() {
		await this.load.language('extension/total/reward');

		const json = {};

		const points = await this.customer.getRewardPoints();

		let points_total = 0;

		for (let product of await this.cart.getProducts()) {
			if (product['points']) {
				points_total += product['points'];
			}
		}

		if (!(this.request.post['reward']) || !is_numeric(this.request.post['reward']) || (this.request.post['reward'] <= 0)) {
			json['error'] = this.language.get('error_reward');
		}

		if (this.request.post['reward'] > points) {
			json['error'] = sprintf(this.language.get('error_points'), this.request.post['reward']);
		}

		if (this.request.post['reward'] > points_total) {
			json['error'] = sprintf(this.language.get('error_maximum'), points_total);
		}

		if (!json) {
			this.session.data['reward'] = abs(this.request.post['reward']);

			this.session.data['success'] = this.language.get('text_success');

			if ((this.request.post['redirect']) && (strpos(this.request.post['redirect'], this.config.get('config_url')) === 0 || strpos(this.request.post['redirect'], this.config.get('config_ssl')) === 0)) {
				json['redirect'] = await this.url.link(this.request.post['redirect']);
			} else {
				json['redirect'] = await this.url.link('checkout/cart');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
