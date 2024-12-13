module.exports = class ModelExtensionModulePayPalSmartButton extends Model {

	async hasProductInCart(product_id, option = array(), recurring_id = 0) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "cart WHERE api_id = '" + ((this.session.data['api_id']) ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "' AND product_id = '" + product_id + "' AND recurring_id = '" + recurring_id + "' AND `option` = '" + this.db.escape(JSON.stringify(option)) + "'");

		return query.row['total'];
	}

	async getCountryByCode(code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE iso_code_2 = '" + this.db.escape(code) + "' AND status = '1'");

		return query.row;
	}

	async getZoneByCode(country_id, code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '" + country_id + "' AND (code = '" + this.db.escape(code) + "' OR name = '" + this.db.escape(code) + "') AND status = '1'");

		return query.row;
	}

	async log(data, title = null) {
		if (this.config.get('payment_paypal_debug')) {
			const log = new Log('paypal.log');
			await log.write('PayPal debug (' + title + '): ' + JSON.stringify(data, true));
		}
	}
}
