module.exports = class ModelCatalogManufacturer extends Model {
	async addManufacturer(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "manufacturer SET name = '" + this.db.escape(data['name']) + "', sort_order = '" + data['sort_order'] + "'");

		const manufacturer_id = this.db.getLastId();

		if ((data['image'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "manufacturer SET image = '" + this.db.escape(data['image']) + "' WHERE manufacturer_id = '" + manufacturer_id + "'");
		}

		if ((data['manufacturer_store'])) {
			for (let store_id of data['manufacturer_store']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "manufacturer_to_store SET manufacturer_id = '" + manufacturer_id + "', store_id = '" + store_id + "'");
			}
		}

		// SEO URL
		if ((data['manufacturer_seo_url'])) {
			for (let [store_id, language] of Object.entries(data['manufacturer_seo_url'])) {
				for (let [language_id, keyword] of Object.entries(language)) {
					if ((keyword)) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "seo_url SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'manufacturer_id=" + manufacturer_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}

		await this.cache.delete('manufacturer');

		return manufacturer_id;
	}

	async editManufacturer(manufacturer_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "manufacturer SET name = '" + this.db.escape(data['name']) + "', sort_order = '" + data['sort_order'] + "' WHERE manufacturer_id = '" + manufacturer_id + "'");

		if ((data['image'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "manufacturer SET image = '" + this.db.escape(data['image']) + "' WHERE manufacturer_id = '" + manufacturer_id + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "manufacturer_to_store WHERE manufacturer_id = '" + manufacturer_id + "'");

		if ((data['manufacturer_store'])) {
			for (let store_id of data['manufacturer_store']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "manufacturer_to_store SET manufacturer_id = '" + manufacturer_id + "', store_id = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE query = 'manufacturer_id=" + manufacturer_id + "'");

		if ((data['manufacturer_seo_url'])) {
			for (let [store_id, language] of Object.entries(data['manufacturer_seo_url'])) {
				for (let [language_id, keyword] of Object.entries(language)) {
					if ((keyword)) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'manufacturer_id=" + manufacturer_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}

		await this.cache.delete('manufacturer');
	}

	async deleteManufacturer(manufacturer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer` WHERE manufacturer_id = '" + manufacturer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_store` WHERE manufacturer_id = '" + manufacturer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE query = 'manufacturer_id=" + manufacturer_id + "'");

		await this.cache.delete('manufacturer');
	}

	async getManufacturer(manufacturer_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "manufacturer WHERE manufacturer_id = '" + manufacturer_id + "'");

		return query.row;
	}

	async getManufacturers(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "manufacturer";

		if ((data['filter_name'])) {
			sql += " WHERE name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		let sort_data = [
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

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getManufacturerStores(manufacturer_id) {
		let manufacturer_store_data = [];

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "manufacturer_to_store WHERE manufacturer_id = '" + manufacturer_id + "'");

		for (let result of query.rows) {
			manufacturer_store_data.push(result['store_id']);
		}

		return manufacturer_store_data;
	}

	async getManufacturerSeoUrls(manufacturer_id) {
		let manufacturer_seo_url_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE query = 'manufacturer_id=" + manufacturer_id + "'");

		for (let result of query.rows) {
			manufacturer_seo_url_data[result['store_id']] = manufacturer_seo_url_data[result['store_id']] || {};
			manufacturer_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return manufacturer_seo_url_data;
	}

	async getTotalManufacturers() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "manufacturer");

		return query.row['total'];
	}
}
