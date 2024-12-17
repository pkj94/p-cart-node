module.exports = class ModelExtensionShippingWeight extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/weight');

		let quote_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "geo_zone ORDER BY name");

		let weight = await this.cart.getWeight();

		for (let result of query.rows) {
			let status = false;
			if (Number(this.config.get('shipping_weight_' + result['geo_zone_id'] + '_status'))) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + result['geo_zone_id'] + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

				if (query.num_rows) {
					status = true;
				} else {
					status = false;
				}
			} else {
				status = false;
			}

			if (status) {
				let cost = '';

				let rates = this.config.get('shipping_weight_' + result['geo_zone_id'] + '_rate').split(',');

				for (let rate of rates) {
					const data = rate.split(':');

					if (data[0] >= weight) {
						if ((data[1])) {
							cost = data[1];
						}

						break;
					}
				}

				if (cost != '') {
					quote_data['weight_' + result['geo_zone_id']] = {
						'code': 'weight.weight_' + result['geo_zone_id'],
						'title': result['name'] + '  (' + this.language.get('text_weight') + ' ' + this.weight.format(weight, this.config.get('config_weight_class_id')) + ')',
						'cost': cost,
						'tax_class_id': this.config.get('shipping_weight_tax_class_id'),
						'text': this.currency.format(this.tax.calculate(cost, this.config.get('shipping_weight_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'])
					};
				}
			}
		}

		let method_data = {};

		if (Object.keys(quote_data).length) {
			method_data = {
				'code': 'weight',
				'title': this.language.get('text_title'),
				'quote': quote_data,
				'sort_order': this.config.get('shipping_weight_sort_order'),
				'error': false
			};
		}

		return method_data;
	}
}