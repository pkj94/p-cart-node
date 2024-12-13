module.exports = class ControllerExtensionTotalCoupon extends Controller {
	async index() {
		const data = {};
		if (Number(this.config.get('total_coupon_status'))) {
			await this.load.language('extension/total/coupon');

			if ((this.session.data['coupon'])) {
				data['coupon'] = this.session.data['coupon'];
			} else {
				data['coupon'] = '';
			}

			return await this.load.view('extension/total/coupon', data);
		}
	}

	async coupon() {
		await this.load.language('extension/total/coupon');

		const json = {};

		this.load.model('extension/total/coupon');

		if ((this.request.post['coupon'])) {
			coupon = this.request.post['coupon'];
		} else {
			coupon = '';
		}

		const coupon_info = await this.model_extension_total_coupon.getCoupon(coupon);

		if (!(this.request.post['coupon'])) {
			json['error'] = this.language.get('error_empty');

			delete this.session.data['coupon'];
		} else if (coupon_info.coupon_id) {
			this.session.data['coupon'] = this.request.post['coupon'];

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('checkout/cart');
		} else {
			json['error'] = this.language.get('error_coupon');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
