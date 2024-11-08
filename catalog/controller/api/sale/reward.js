module.exports = class Reward extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('api/sale/reward');

		const json = {};

		if ((this.request.post['reward'])) {
			reward = abs(this.request.post['reward']);
		} else {
			reward = 0;
		}

		available = await this.customer.getRewardPoints();

		points_total = 0;

		for (let product of await this.cart.getProducts()) {
			if (product['points']) {
				points_total += product['points'];
			}
		}

		if (reward) {
			if (reward > available) {
				json['error'] = sprintf(this.language.get('error_points'), this.request.post['reward']);
			}

			if (reward > points_total) {
				json['error'] = sprintf(this.language.get('error_maximum'), points_total);
			}
		}

		if (!Object.keys(json).length) {
			if (reward) {
				json['success'] = this.language.get('text_success');

				this.session.data['reward'] = reward;
			} else {
				json['success'] = this.language.get('text_remove');

				delete (this.session.data['reward']);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async maximum() {
		await this.load.language('api/sale/reward');

		const json = {};

		json['maximum'] = 0;

		for (let product of await this.cart.getProducts()) {
			if (product['points']) {
				json['maximum'] += product['points'];
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async available() {
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput({ 'points': await this.customer.getRewardPoints() });
	}
}
