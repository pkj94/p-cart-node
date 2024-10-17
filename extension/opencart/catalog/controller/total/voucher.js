module.exports = class VoucherController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		if (this.config.get('total_voucher_status')) {
			await this.load.language('extension/opencart/total/voucher');

			data['save'] = await this.url.link('extension/opencart/total/voucher.save', 'language=' + this.config.get('config_language'), true);
			data['list'] = await this.url.link('checkout/cart.list', 'language=' + this.config.get('config_language'), true);

			if ((this.session.data['voucher'])) {
				data['voucher'] = this.session.data['voucher'];
			} else {
				data['voucher'] = '';
			}

			return await this.load.view('extension/opencart/total/voucher', data);
		}

		return '';
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/voucher');

		const json = {};
		const voucher = '';
		if ((this.request.post['voucher'])) {
			voucher = this.request.post['voucher'];
		}

		if (!this.config.get('total_voucher_status')) {
			json['error'] = this.language.get('error_status');
		}

		if (voucher) {
			this.load.model('checkout/voucher', this);

			const voucher_info = await this.model_checkout_voucher.getVoucher(voucher);

			if (!voucher_info.voucher_id) {
				json['error'] = this.language.get('error_voucher');
			}
		}

		if (!json.error) {
			if (voucher) {
				json['success'] = this.language.get('text_success');

				this.session.data['voucher'] = voucher;
			} else {
				json['success'] = this.language.get('text_remove');

				delete this.session.data['voucher'];
			}

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		}
		await this.session.save();
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}