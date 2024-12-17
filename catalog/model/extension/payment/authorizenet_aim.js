module.exports = class ModelExtensionPaymentAuthorizeNetAim extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/authorizenet_aim');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_authorizenet_aim_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (Number(this.config.get('payment_authorizenet_aim_total')) > 0 && Number(this.config.get('payment_authorizenet_aim_total')) > total) {
			status = false;
		} else if (!this.config.get('payment_authorizenet_aim_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code': 'authorizenet_aim',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_authorizenet_aim_sort_order')
			};
		}

		return method_data;
	}
}