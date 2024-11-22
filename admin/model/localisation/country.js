module.exports = class ModelLocalisationCountry extends Model {
	async addCountry(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "country SET name = '" + this.db.escape(data['name']) + "', iso_code_2 = '" + this.db.escape(data['iso_code_2']) + "', iso_code_3 = '" + this.db.escape(data['iso_code_3']) + "', address_format = '" + this.db.escape(data['address_format']) + "', postcode_required = '" + data['postcode_required'] + "', status = '" + data['status'] + "'");

		await this.cache.delete('country');
		
		return this.db.getLastId();
	}

	async editCountry(country_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "country SET name = '" + this.db.escape(data['name']) + "', iso_code_2 = '" + this.db.escape(data['iso_code_2']) + "', iso_code_3 = '" + this.db.escape(data['iso_code_3']) + "', address_format = '" + this.db.escape(data['address_format']) + "', postcode_required = '" + data['postcode_required'] + "', status = '" + data['status'] + "' WHERE country_id = '" + country_id + "'");

		await this.cache.delete('country');
	}

	async deleteCountry(country_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "country WHERE country_id = '" + country_id + "'");

		await this.cache.delete('country');
	}

	async getCountry(country_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "country WHERE country_id = '" + country_id + "'");

		return query.row;
	}

	async getCountries(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "country";

			let sort_data = [
				'name',
				'iso_code_2',
				'iso_code_3'
			});

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
			country_data = await this.cache.get('country.admin');

			if (!country_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country ORDER BY name ASC");

				country_data = query.rows;

				await this.cache.set('country.admin', country_data);
			}

			return country_data;
		}
	}

	async getTotalCountries() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "country");

		return query.row['total'];
	}
}