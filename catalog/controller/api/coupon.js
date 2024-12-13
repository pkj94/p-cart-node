module.exports = class ControllerApiCoupon extends Controller {
	async index() {
const data = {};
		await this.load.language('api/coupon');

		// Delete past coupon in case there is an error
		delete this.session.data['coupon']);

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/total/coupon');

			if ((this.request.post['coupon'])) {
				coupon = this.request.post['coupon'];
			} else {
				coupon = '';
			}

			coupon_info = await this.model_extension_total_coupon.getCoupon(coupon);

			if (coupon_info) {
				this.session.data['coupon'] = this.request.post['coupon'];

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_coupon');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
