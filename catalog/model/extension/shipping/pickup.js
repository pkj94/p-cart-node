module.exports = class ModelExtensionShippingPickup extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/pickup');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + Number(this.config.get('shipping_pickup_geo_zone_id')) + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_pickup_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			const quote_data = {};

			quote_data['pickup'] = {
				'code': 'pickup.pickup',
				'title': this.language.get('text_description'),
				'cost': 0.00,
				'tax_class_id': 0,
				'text': this.currency.format(0.00, this.session.data['currency'])
			};

			method_data = {
				'code': 'pickup',
				'title': this.language.get('text_title'),
				'quote': quote_data,
				'sort_order': this.config.get('shipping_pickup_sort_order'),
				'error': false
			};
		}

		return method_data;
	}
}