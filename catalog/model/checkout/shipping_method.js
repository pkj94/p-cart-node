module.exports = class ShippingMethodController extends Model {
	/**
	 * @param shipping_address
	 *
	 * @return array
	 */
	async getMethods(shipping_address) {
		let method_data = {};

		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getExtensionsByType('shipping');
		for (let result of results) {
			if (this.config.get('shipping_' + result['code'] + '_status')) {
				this.load.model('extension/' + result['extension'] + '/shipping/' + result['code'], this);

				const quote = await this['model_extension_' + result['extension'] + '_shipping_' + result['code']].getQuote(shipping_address);
				if (Object.keys(quote).length) {
					method_data[result['code']] = quote;
				}
			}
		}
		method_data = Object.entries(method_data)
			.sort(([, a], [, b]) => a.sort_order - b.sort_order)
			.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
		return method_data;
	}
}
