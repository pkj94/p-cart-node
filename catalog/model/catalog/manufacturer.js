module.exports = class ModelCatalogManufacturer extends Model {
	async getManufacturer(manufacturer_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "manufacturer m LEFT JOIN " + DB_PREFIX + "manufacturer_to_store m2s ON (m.manufacturer_id = m2s.manufacturer_id) WHERE m.manufacturer_id = '" + manufacturer_id + "' AND m2s.store_id = '" + this.config.get('config_store_id') + "'");

		return query.row;
	}

	async getManufacturers(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "manufacturer m LEFT JOIN " + DB_PREFIX + "manufacturer_to_store m2s ON (m.manufacturer_id = m2s.manufacturer_id) WHERE m2s.store_id = '" + this.config.get('config_store_id') + "'";

			const sort_data = [
				'name',
				'sort_order'
			];

			if ((data['sort']) && sort_data.includes(data['sort'])) {
				sql += " ORDER BY " + data['sort'];
			} else {
				sql += " ORDER BY name";
			}

			if ((data['order']) && (data['order'] == 'DESC')) {
				sql += " DESC";
			} else {
				sql += " ASC";
			}

			if ((data['start']) || (data['limit'])) {
				if (data['start'] < 0) {
					data['start'] = 0;
				}

				if (data['limit'] < 1) {
					data['limit'] = 20;
				}

				sql += " LIMIT " + data['start'] + "," + data['limit'];
			}

			const query = await this.db.query(sql);

			return query.rows;
		} else {
			let manufacturer_data = await this.cache.get('manufacturer.' + this.config.get('config_store_id'));

			if (!manufacturer_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "manufacturer m LEFT JOIN " + DB_PREFIX + "manufacturer_to_store m2s ON (m.manufacturer_id = m2s.manufacturer_id) WHERE m2s.store_id = '" + this.config.get('config_store_id') + "' ORDER BY name");

				manufacturer_data = query.rows;

				await this.cache.set('manufacturer.' + this.config.get('config_store_id'), manufacturer_data);
			}

			return manufacturer_data;
		}
	}
}