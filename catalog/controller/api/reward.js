module.exports = class ControllerApiReward extends Controller {
	async index() {
const data = {};
		await this.load.language('api/reward');

		// Delete past reward in case there is an error
		delete this.session.data['reward']);

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			points = await this.customer.getRewardPoints();

			points_total = 0;

			for (let product of await this.cart.getProducts()) {
				if (product['points']) {
					points_total += product['points'];
				}
			}

			if (empty(this.request.post['reward'])) {
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

				json['success'] = this.language.get('text_success');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async maximum() {
		await this.load.language('api/reward');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			json['maximum'] = 0;

			for (let product of await this.cart.getProducts()) {
				if (product['points']) {
					json['maximum'] += product['points'];
				}
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async available() {
		await this.load.language('api/reward');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			json['points'] = await this.customer.getRewardPoints();
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
