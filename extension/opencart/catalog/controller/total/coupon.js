global['\Opencart\Catalog\Controller\Extension\Opencart\Total\Coupon'] = class Coupon extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		if (this.config.get('total_coupon_status')) {
			const data = {};
			await this.load.language('extension/opencart/total/coupon');

			data['save'] = await this.url.link('extension/opencart/total/coupon.save', 'language=' + this.config.get('config_language'), true);
			data['list'] = await this.url.link('checkout/cart.list', 'language=' + this.config.get('config_language'), true);

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
		await this.load.language('extension/opencart/total/coupon');

		const json = {};
		let coupon = '';
		if ((this.request.post['coupon'])) {
			coupon = this.request.post['coupon'];
		}

		if (!this.config.get('total_coupon_status')) {
			json['error'] = this.language.get('error_status');
		}

		if (coupon) {
			this.load.model('marketing/coupon', this);

			const coupon_info = await this.model_marketing_coupon.getCoupon(coupon);
			if (!coupon_info.coupon_id) {
				json['error'] = this.language.get('error_coupon');
			}
		}

		if (!json.error) {
			if (coupon) {
				json['success'] = this.language.get('text_success');

				this.session.data['coupon'] = coupon;
			} else {
				json['success'] = this.language.get('text_remove');

				delete this.session.data['coupon'];
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
