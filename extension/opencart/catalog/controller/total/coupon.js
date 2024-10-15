<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Total;
/**
 * Class Coupon
 *
 * @package
 */
class CouponController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		if (this.config.get('total_coupon_status')) {
			this.load.language('extension/opencart/total/coupon');

			data['save'] = this.url.link('extension/opencart/total/coupon.save', 'language=' . this.config.get('config_language'), true);
			data['list'] = this.url.link('checkout/cart.list', 'language=' . this.config.get('config_language'), true);

			if ((this.session.data['coupon'])) {
				data['coupon'] = this.session.data['coupon'];
			} else {
				data['coupon'] = '';
			}

			return await this.load.view('extension/opencart/total/coupon', data);
		}

		return '';
	}

	/**
	 * @return void
	 */
	async save() {
		this.load.language('extension/opencart/total/coupon');

		const json = {};

		if ((this.request.post['coupon'])) {
			$coupon = this.request.post['coupon'];
		} else {
			$coupon = '';
		}

		if (!this.config.get('total_coupon_status')) {
			$json['error'] = this.language.get('error_status');
		}

		if ($coupon) {
			this.load.model('marketing/coupon',this);

			$coupon_info = await this.model_marketing_coupon.getCoupon($coupon);

			if (!$coupon_info) {
				$json['error'] = this.language.get('error_coupon');
			}
		}

		if (!json.error) {
			if ($coupon) {
				json['success'] = this.language.get('text_success');

				this.session.data['coupon'] = $coupon;
			} else {
				json['success'] = this.language.get('text_remove');

				unset(this.session.data['coupon']);
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
