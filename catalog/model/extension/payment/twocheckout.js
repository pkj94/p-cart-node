module.exports = class ModelExtensionPaymentTwoCheckout extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/twocheckout');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_twocheckout_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_twocheckout_total') > 0 && this.config.get('payment_twocheckout_total') > total) {
			status = false;
		} else if (!this.config.get('payment_twocheckout_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'        'twocheckout',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_twocheckout_sort_order')
			});
		}

		return method_data;
	}
}