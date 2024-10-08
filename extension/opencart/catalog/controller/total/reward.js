<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Total;
/**
 * Class Reward
 *
 * @package
 */
class RewardController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		if (this.config.get('total_reward_status')) {
			$available = this.customer.getRewardPoints();

			$points_total = 0;

			foreach (this.cart.getProducts() as $product) {
				if ($product['points']) {
					$points_total += $product['points'];
				}
			}

			if ($available && $points_total) {
				this.load.language('extension/opencart/total/reward');

				data['heading_title'] = sprintf(this.language.get('heading_title'), $available);

				data['entry_reward'] = sprintf(this.language.get('entry_reward'), $points_total);

				data['save'] = this.url.link('extension/opencart/total/reward.save', 'language=' . this.config.get('config_language'), true);
				data['list'] = this.url.link('checkout/cart.list', 'language=' . this.config.get('config_language'), true);

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
		this.load.language('extension/opencart/total/reward');

		const json = {};

		if ((this.request.post['reward'])) {
			$reward = abs(this.request.post['reward']);
		} else {
			$reward = 0;
		}

		$available = this.customer.getRewardPoints();

		$points_total = 0;

		foreach (this.cart.getProducts() as $product) {
			if ($product['points']) {
				$points_total += $product['points'];
			}
		}

		if (!this.config.get('total_reward_status')) {
			$json['error'] = this.language.get('error_reward');
		}

		if ($reward > $available) {
			$json['error'] = sprintf(this.language.get('error_points'), $reward);
		}

		if ($reward > $points_total) {
			$json['error'] = sprintf(this.language.get('error_maximum'), $points_total);
		}

		if (!json.error) {
			if ($reward) {
				json['success'] = this.language.get('text_success');

				this.session.data['reward'] = $reward;
			} else {
				json['success'] = this.language.get('text_remove');

				unset(this.session.data['reward']);
			}

			unset(this.session.data['shipping_method']);
			unset(this.session.data['shipping_methods']);
			unset(this.session.data['payment_method']);
			unset(this.session.data['payment_methods']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
