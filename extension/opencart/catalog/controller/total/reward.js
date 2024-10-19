module.exports = class RewardController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		if (this.config.get('total_reward_status')) {
			const data = {};
			const available = await this.customer.getRewardPoints();

			let points_total = 0;

			for (let [cart_id,product] of Object.entries(await this.cart.getProducts())) {
				if (product['points']) {
					points_total += product['points'];
				}
			}

			if (available && points_total) {
				await this.load.language('extension/opencart/total/reward');

				data['heading_title'] = sprintf(this.language.get('heading_title'), available);

				data['entry_reward'] = sprintf(this.language.get('entry_reward'), points_total);

				data['save'] = await this.url.link('extension/opencart/total/reward.save', 'language=' + this.config.get('config_language'), true);
				data['list'] = await this.url.link('checkout/cart.list', 'language=' + this.config.get('config_language'), true);

				if ((this.session.data['reward'])) {
					data['reward'] = this.session.data['reward'];
				} else {
					data['reward'] = '';
				}

				return await this.load.view('extension/opencart/total/reward', data);
			}
		}

		return '';
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/reward');

		const json = {};

		if ((this.request.post['reward'])) {
			reward = abs(this.request.post['reward']);
		} else {
			reward = 0;
		}

		let available = await this.customer.getRewardPoints();

		let points_total = 0;

		for (let [cart_id,product] of Object.entries(await this.cart.getProducts())) {
			if (product['points']) {
				points_total += product['points'];
			}
		}

		if (!this.config.get('total_reward_status')) {
			json['error'] = this.language.get('error_reward');
		}

		if (reward > available) {
			json['error'] = sprintf(this.language.get('error_points'), reward);
		}

		if (reward > points_total) {
			json['error'] = sprintf(this.language.get('error_maximum'), points_total);
		}

		if (!json.error) {
			if (reward) {
				json['success'] = this.language.get('text_success');

				this.session.data['reward'] = reward;
			} else {
				json['success'] = this.language.get('text_remove');

				delete this.session.data['reward'];
			}

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
