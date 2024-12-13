module.exports = class ModelExtensionShippingPilibaba extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/pilibaba');

		let status = true;

		let method_data = {};

		if (status) {
			const quote_data = {};

			quote_data['pilibaba'] = {
				'code': 'pilibaba.pilibaba',
				'title': this.language.get('text_description'),
				'cost': this.config.get('payment_pilibaba_shipping_fee'),
				'tax_class_id': 0,
				'text': this.currency.format(this.tax.calculate(this.config.get('payment_pilibaba_shipping_fee'), 0, this.config.get('config_tax')), this.session.data['currency'])
			};

			method_data = {
				'code': 'pilibaba',
				'title': this.language.get('text_title'),
				'quote': quote_data,
				'sort_order': 1,
				'error': false
			};
		}

		return method_data;
	}
}