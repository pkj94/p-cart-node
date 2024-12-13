module.exports = class ModelLocalisationCurrency extends Model {
	async getCurrencyByCode(currency) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "currency` WHERE `code` = '" + this.db.escape(currency) + "'");

		return query.row;
	}

	async getCurrencies() {
		let currency_data = await this.cache.get('currency');

		if (!currency_data) {
			currency_data = {};

			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "currency` WHERE `status` = '1' ORDER BY `title` ASC");

			for (let result of query.rows) {
				currency_data[result['code']] = {
					'currency_id': result['currency_id'],
					'title': result['title'],
					'code': result['code'],
					'symbol_left': result['symbol_left'],
					'symbol_right': result['symbol_right'],
					'decimal_place': result['decimal_place'],
					'value': result['value'],
					'status': result['status'],
					'date_modified': result['date_modified']
				};
			}

			await this.cache.set('currency', currency_data);
		}

		return currency_data;
	}
}
