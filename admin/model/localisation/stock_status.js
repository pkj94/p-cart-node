module.exports = class ModelLocalisationStockStatus extends Model {
	async addStockStatus(data) {
		for (data['stock_status'] of language_id : value) {
			if ((stock_status_id)) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "stock_status SET stock_status_id = '" + stock_status_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
			} else {
				await this.db.query("INSERT INTO " + DB_PREFIX + "stock_status SET language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");

				stock_status_id = this.db.getLastId();
			}
		}

		this.cache.delete('stock_status');
		
		return stock_status_id;
	}

	async editStockStatus(stock_status_id, data) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "stock_status WHERE stock_status_id = '" + stock_status_id + "'");

		for (data['stock_status'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "stock_status SET stock_status_id = '" + stock_status_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		this.cache.delete('stock_status');
	}

	async deleteStockStatus(stock_status_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "stock_status WHERE stock_status_id = '" + stock_status_id + "'");

		this.cache.delete('stock_status');
	}

	async getStockStatus(stock_status_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "stock_status WHERE stock_status_id = '" + stock_status_id + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getStockStatuses(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "stock_status WHERE language_id = '" + this.config.get('config_language_id') + "'";

			sql += " ORDER BY name";

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
			stock_status_data = this.cache.get('stock_status.' + this.config.get('config_language_id'));

			if (!stock_status_data) {
				const query = await this.db.query("SELECT stock_status_id, name FROM " + DB_PREFIX + "stock_status WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

				stock_status_data = query.rows;

				this.cache.set('stock_status.' + this.config.get('config_language_id'), stock_status_data);
			}

			return stock_status_data;
		}
	}

	async getStockStatusDescriptions(stock_status_id) {
		stock_status_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "stock_status WHERE stock_status_id = '" + stock_status_id + "'");

		for (let result of query.rows ) {
			stock_status_data[result['language_id']] = array('name' : result['name']);
		}

		return stock_status_data;
	}

	async getTotalStockStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "stock_status WHERE language_id = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}