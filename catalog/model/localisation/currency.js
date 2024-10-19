module.exports = class CurrencyModel extends Model {
	/**
	 * @param string code
	 * @param  value
	 *
	 * @return void
	 */
	async editValueByCode(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "currency` SET `value` = '" + value + "', `date_modified` = NOW() WHERE `code` = " + this.db.escape(code));

		await this.cache.delete('currency');
	}

	/**
	 * @param currency_id
	 *
	 * @return array
	 */
	async getCurrency(currency_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "currency` WHERE `currency_id` = " + this.db.escape(currency_id));

		return query.row;
	}

	/**
	 * @param string currency
	 *
	 * @return array
	 */
	async getCurrencyByCode(currency) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "currency` WHERE `code` = " + this.db.escape(currency) + " AND `status` = '1'");

		return query.row;
	}

	/**
	 * @return array
	 */
	async getCurrencies() {
		const sql = "SELECT * FROM `" + DB_PREFIX + "currency` WHERE `status` = '1' ORDER BY `title` ASC";

		let currency_data = await this.cache.get('currency.' + md5(sql));

		if (!currency_data) {
			currency_data = [];

			const query = await this.db.query(sql);

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

			await this.cache.set('currency.' + md5(sql), currency_data);
		}

		return currency_data;
	}
}
