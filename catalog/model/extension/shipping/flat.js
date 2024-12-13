module.exports = class ModelExtensionShippingFlat extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/flat');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + Number(this.config.get('shipping_flat_geo_zone_id')) + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_flat_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}
		let method_data = {};

		if (status) {
			const quote_data = {};

			quote_data['flat'] = {
				'code': 'flat.flat',
				'title': this.language.get('text_description'),
				'cost': this.config.get('shipping_flat_cost'),
				'tax_class_id': this.config.get('shipping_flat_tax_class_id'),
				'text': this.currency.format(this.tax.calculate(this.config.get('shipping_flat_cost'), this.config.get('shipping_flat_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'])
			};

			method_data = {
				'code': 'flat',
				'title': this.language.get('text_title'),
				'quote': quote_data,
				'sort_order': this.config.get('shipping_flat_sort_order'),
				'error': false
			};
		}

		return method_data;
	}
}