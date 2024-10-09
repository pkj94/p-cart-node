module.exports = class CurrencyLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCurrency(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "currency` SET `title` = " + this.db.escape(data['title']) + ", `code` = " + this.db.escape(data['code']) + ", `symbol_left` = " + this.db.escape(data['symbol_left']) + ", `symbol_right` = " + this.db.escape(data['symbol_right']) + ", `decimal_place` = '" + data['decimal_place'] + "', `value` = '" + data['value'] + "', `status` = '" + (bool)((data['status']) ? data['status'] : 0) + "', `date_modified` = NOW()");

		await this.cache.delete('currency');

		return this.db.getLastId();
	}

	/**
	 * @param   currency_id
	 * @param data
	 *
	 * @return void
	 */
	async editCurrency(currency_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "currency` SET `title` = " + this.db.escape(data['title']) + ", `code` = " + this.db.escape(data['code']) + ", `symbol_left` = " + this.db.escape(data['symbol_left']) + ", `symbol_right` = " + this.db.escape(data['symbol_right']) + ", `decimal_place` = '" + data['decimal_place'] + "', `value` = '" + data['value'] + "', `status` = '" + (bool)((data['status']) ? data['status'] : 0) + "', `date_modified` = NOW() WHERE `currency_id` = '" + currency_id + "'");

		await this.cache.delete('currency');
	}

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
	 * @return void
	 */
	async deleteCurrency(currency_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "currency` WHERE `currency_id` = '" + currency_id + "'");

		await this.cache.delete('currency');
	}

	/**
	 * @param currency_id
	 *
	 * @return array
	 */
	async getCurrency(currency_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "currency` WHERE `currency_id` = '" + currency_id + "'");

		return query.row;
	}

	/**
	 * @param string currency
	 *
	 * @return array
	 */
	async getCurrencyByCode(currency) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "currency` WHERE `code` = " + this.db.escape(currency));

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCurrencies(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "currency`";

		let sort_data = [
			'title',
			'code',
			'value',
			'date_modified'
		];

		if ((data['sort']) && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `title`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const results = await this.cache.get('currency+' + md5(sql));

		if (!results) {
			const query = await this.db.query(sql);

			results = query.rows;

			await this.cache.set('currency+' + md5(sql), results);
		}

		let currency_data = [];

		for (results of result) {
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

		return currency_data;
	}

	/**
	 * @return int
	 */
	async getTotalCurrencies() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "currency`");

		return query.row['total'];
	}
}
