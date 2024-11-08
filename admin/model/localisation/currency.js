module.exports = class ModelLocalisationCurrency extends Model {
	async addCurrency(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "currency SET title = '" + this.db.escape(data['title']) + "', code = '" + this.db.escape(data['code']) + "', symbol_left = '" + this.db.escape(data['symbol_left']) + "', symbol_right = '" + this.db.escape(data['symbol_right']) + "', decimal_place = '" + this.db.escape(data['decimal_place']) + "', value = '" + this.db.escape(data['value']) + "', status = '" + data['status'] + "', date_modified = NOW()");

		currency_id = this.db.getLastId();

		if (this.config.get('config_currency_auto')) {
			this.refresh();
		}

		this.cache.delete('currency');
		
		return currency_id;
	}

	async editCurrency(currency_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "currency SET title = '" + this.db.escape(data['title']) + "', code = '" + this.db.escape(data['code']) + "', symbol_left = '" + this.db.escape(data['symbol_left']) + "', symbol_right = '" + this.db.escape(data['symbol_right']) + "', decimal_place = '" + this.db.escape(data['decimal_place']) + "', value = '" + this.db.escape(data['value']) + "', status = '" + data['status'] + "', date_modified = NOW() WHERE currency_id = '" + currency_id + "'");

		this.cache.delete('currency');
	}

	async deleteCurrency(currency_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "currency WHERE currency_id = '" + currency_id + "'");

		this.cache.delete('currency');
	}

	async getCurrency(currency_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "currency WHERE currency_id = '" + currency_id + "'");

		return query.row;
	}

	async getCurrencyByCode(currency) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "currency WHERE code = '" + this.db.escape(currency) + "'");

		return query.row;
	}

	async getCurrencies(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "currency";

			let sort_data = [
				'title',
				'code',
				'value',
				'date_modified'
			);

			if ((data['sort']) && sort_data.includes(data['sort'])) {
				sql += " ORDER BY " + data['sort'];
			} else {
				sql += " ORDER BY title";
			}

			if ((data['order']) && (data['order'] == 'DESC')) {
				sql += " DESC";
			} else {
				sql += " ASC";
			}

			if ((data['start']) || (data['limit'])) {
				data['start'] = data['start']||0;
if (data['start'] < 0) {
					data['start'] = 0;
				}

				data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
					data['limit'] = 20;
				}

				sql += " LIMIT " + data['start'] + "," + data['limit'];
			}

			const query = await this.db.query(sql);

			return query.rows;
		} else {
			currency_data = {};

			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "currency ORDER BY title ASC");

			for (let result of query.rows ) {
				currency_data[result['code']] = array(
					'currency_id'   : result['currency_id'],
					'title'         : result['title'],
					'code'          : result['code'],
					'symbol_left'   : result['symbol_left'],
					'symbol_right'  : result['symbol_right'],
					'decimal_place' : result['decimal_place'],
					'value'         : result['value'],
					'status'        : result['status'],
					'date_modified' : result['date_modified']
				);
			}

			return currency_data;
		}
	}

	async refresh() {
		config_currency_engine = this.config.get('config_currency_engine');
		if (config_currency_engine) {
			this.load.model('extension/currency/'.config_currency_engine);
			this.{'model_extension_currency_'.config_currency_engine}.refresh();
		}
	}

	async getTotalCurrencies() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "currency");

		return query.row['total'];
	}
}
