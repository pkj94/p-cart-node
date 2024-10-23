module.exports = class Coupon extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('api/sale/coupon');

		const json = {};

		if ((this.request.post['coupon'])) {
			coupon = this.request.post['coupon'];
		} else {
			coupon = '';
		}

		if (coupon) {
			this.load.model('marketing/coupon');

			coupon_info = await this.model_marketing_coupon.getCoupon(coupon);

			if (!coupon_info) {
				json['error'] = this.language.get('error_coupon');
			}
		}

		if (!Object.keys(json).length) {
			if (coupon) {
				json['success'] = this.language.get('text_success');

				this.session.data['coupon'] = coupon;
			} else {
				json['success'] = this.language.get('text_remove');

				delete (this.session.data['coupon']);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
