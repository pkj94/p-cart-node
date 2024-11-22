module.exports = class ModelLocalisationZone extends Model {
	async addZone(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "zone SET status = '" + data['status'] + "', name = '" + this.db.escape(data['name']) + "', code = '" + this.db.escape(data['code']) + "', country_id = '" + data['country_id'] + "'");

		await this.cache.delete('zone');
		
		return this.db.getLastId();
	}

	async editZone(zone_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "zone SET status = '" + data['status'] + "', name = '" + this.db.escape(data['name']) + "', code = '" + this.db.escape(data['code']) + "', country_id = '" + data['country_id'] + "' WHERE zone_id = '" + zone_id + "'");

		await this.cache.delete('zone');
	}

	async deleteZone(zone_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "zone WHERE zone_id = '" + zone_id + "'");

		await this.cache.delete('zone');
	}

	async getZone(zone_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "zone WHERE zone_id = '" + zone_id + "'");

		return query.row;
	}

	async getZones(data = {}) {
		let sql = "SELECT *, z.name, c.name AS country FROM " + DB_PREFIX + "zone z LEFT JOIN " + DB_PREFIX + "country c ON (z.country_id = c.country_id)";

		let sort_data = [
			'c.name',
			'z.name',
			'z.code'
		});

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY c.name";
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
	}

	async getZonesByCountryId(country_id) {
		zone_data = await this.cache.get('zone.' + country_id);

		if (!zone_data) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '" + country_id + "' AND status = '1' ORDER BY name");

			zone_data = query.rows;

			await this.cache.set('zone.' + country_id, zone_data);
		}

		return zone_data;
	}

	async getTotalZones() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "zone");

		return query.row['total'];
	}

	async getTotalZonesByCountryId(country_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "zone WHERE country_id = '" + country_id + "'");

		return query.row['total'];
	}
}