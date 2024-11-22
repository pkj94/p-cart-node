module.exports = class ModelLocalisationOrderStatus extends Model {
	async addOrderStatus(data) {
		for (data['order_status'] of language_id : value) {
			if ((order_status_id)) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_status SET order_status_id = '" + order_status_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
			} else {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_status SET language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");

				order_status_id = this.db.getLastId();
			}
		}

		await this.cache.delete('order_status');
		
		return order_status_id;
	}

	async editOrderStatus(order_status_id, data) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "order_status WHERE order_status_id = '" + order_status_id + "'");

		for (data['order_status'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "order_status SET order_status_id = '" + order_status_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		await this.cache.delete('order_status');
	}

	async deleteOrderStatus(order_status_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "order_status WHERE order_status_id = '" + order_status_id + "'");

		await this.cache.delete('order_status');
	}

	async getOrderStatus(order_status_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_status WHERE order_status_id = '" + order_status_id + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getOrderStatuses(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "order_status WHERE language_id = '" + this.config.get('config_language_id') + "'";

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
			order_status_data = await this.cache.get('order_status.' + this.config.get('config_language_id'));

			if (!order_status_data) {
				const query = await this.db.query("SELECT order_status_id, name FROM " + DB_PREFIX + "order_status WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

				order_status_data = query.rows;

				await this.cache.set('order_status.' + this.config.get('config_language_id'), order_status_data);
			}

			return order_status_data;
		}
	}

	async getOrderStatusDescriptions(order_status_id) {
		order_status_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_status WHERE order_status_id = '" + order_status_id + "'");

		for (let result of query.rows ) {
			order_status_data[result['language_id']] = array('name' : result['name']);
		}

		return order_status_data;
	}

	async getTotalOrderStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "order_status WHERE language_id = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}