module.exports = class ModelExtensionPaymentBankTransfer extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/bank_transfer');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_bank_transfer_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_bank_transfer_total') > 0 && this.config.get('payment_bank_transfer_total') > total) {
			status = false;
		} else if (!this.config.get('payment_bank_transfer_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'        'bank_transfer',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_bank_transfer_sort_order')
			});
		}

		return method_data;
	}
}
