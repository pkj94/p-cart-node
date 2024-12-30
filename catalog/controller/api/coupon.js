module.exports = class ControllerApiCoupon extends Controller {
	async index() {
		await this.load.language('api/coupon');

		// Delete past coupon in case there is an error
		delete this.session.data['coupon'];

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/total/coupon');
			let coupon = '';
			if ((this.request.post['coupon'])) {
				coupon = this.request.post['coupon'];
			}

			const coupon_info = await this.model_extension_total_coupon.getCoupon(coupon);

			if (coupon_info.coupon_id) {
				this.session.data['coupon'] = this.request.post['coupon'];

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_coupon');
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
