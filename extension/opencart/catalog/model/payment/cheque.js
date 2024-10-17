module.exports = class ChequeModel extends Model {
	/**
	 * @param address
	 *
	 * @return array
	 */
	async getMethods(address = {}) {
		await this.load.language('extension/opencart/payment/cheque');
		let status = false;
		if (await this.cart.hasSubscription()) {
			status = false;
		} else if (!this.config.get('config_checkout_payment_address')) {
			status = true;
		} else if (!this.config.get('payment_cheque_geo_zone_id')) {
			status = true;
		} else {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + this.config.get('payment_cheque_geo_zone_id') + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");

			if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}
		}

		let method_data = {};

		if (status) {
			let option_data = {
				cheque: {
					'code': 'cheque.cheque',
					'name': this.language.get('heading_title')
				}
			};

			method_data = {
				'code': 'cheque',
				'name': this.language.get('heading_title'),
				'option': option_data,
				'sort_order': this.config.get('payment_cheque_sort_order')
			};

		}

		return method_data;
	}
}
