module.exports = class PaymentMethodController extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param payment_address
	 *
	 * @return array
	 */
	async getMethods(payment_address = []) {
		let method_data = {};

		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getExtensionsByType('payment');
		for (let result of results) {
			if (Number(this.config.get('payment_' + result['code'] + '_status'))) {
				this.load.model('extension/' + result['extension'] + '/payment/' + result['code'], this);

				const payment_methods = await this['model_extension_' + result['extension'] + '_payment_' + result['code']].getMethods(payment_address);
				if (payment_methods.code) {
					method_data[result['code']] = payment_methods;
				}
			}
		}
		method_data = Object.entries(method_data)
			.sort(([, a], [, b]) => a.sort_order - b.sort_order)
			.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
		return method_data;
	}
}