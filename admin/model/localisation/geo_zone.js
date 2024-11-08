module.exports = class ModelLocalisationGeoZone extends Model {
	async addGeoZone(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "geo_zone SET name = '" + this.db.escape(data['name']) + "', description = '" + this.db.escape(data['description']) + "', date_added = NOW()");

		geo_zone_id = this.db.getLastId();

		if ((data['zone_to_geo_zone'])) {
			for (data['zone_to_geo_zone'] of value) {
				await this.db.query("DELETE FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + geo_zone_id + "' AND country_id = '" + value['country_id'] + "' AND zone_id = '" + value['zone_id'] + "'");				

				await this.db.query("INSERT INTO " + DB_PREFIX + "zone_to_geo_zone SET country_id = '" + value['country_id'] + "', zone_id = '" + value['zone_id'] + "', geo_zone_id = '" + geo_zone_id + "', date_added = NOW()");
			}
		}

		this.cache.delete('geo_zone');
		
		return geo_zone_id;
	}

	async editGeoZone(geo_zone_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "geo_zone SET name = '" + this.db.escape(data['name']) + "', description = '" + this.db.escape(data['description']) + "', date_modified = NOW() WHERE geo_zone_id = '" + geo_zone_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + geo_zone_id + "'");

		if ((data['zone_to_geo_zone'])) {
			for (data['zone_to_geo_zone'] of value) {
				await this.db.query("DELETE FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + geo_zone_id + "' AND country_id = '" + value['country_id'] + "' AND zone_id = '" + value['zone_id'] + "'");				

				await this.db.query("INSERT INTO " + DB_PREFIX + "zone_to_geo_zone SET country_id = '" + value['country_id'] + "', zone_id = '" + value['zone_id'] + "', geo_zone_id = '" + geo_zone_id + "', date_added = NOW()");
			}
		}

		this.cache.delete('geo_zone');
	}

	async deleteGeoZone(geo_zone_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "geo_zone WHERE geo_zone_id = '" + geo_zone_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + geo_zone_id + "'");

		this.cache.delete('geo_zone');
	}

	async getGeoZone(geo_zone_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "geo_zone WHERE geo_zone_id = '" + geo_zone_id + "'");

		return query.row;
	}

	async getGeoZones(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "geo_zone";

			let sort_data = [
				'name',
				'description'
			);

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
			geo_zone_data = this.cache.get('geo_zone');

			if (!geo_zone_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "geo_zone ORDER BY name ASC");

				geo_zone_data = query.rows;

				this.cache.set('geo_zone', geo_zone_data);
			}

			return geo_zone_data;
		}
	}

	async getTotalGeoZones() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "geo_zone");

		return query.row['total'];
	}

	async getZoneToGeoZones(geo_zone_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + geo_zone_id + "' ORDER BY country_id ASC, zone_id ASC");

		return query.rows;
	}

	async getTotalZoneToGeoZoneByGeoZoneId(geo_zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + geo_zone_id + "'");

		return query.row['total'];
	}

	async getTotalZoneToGeoZoneByCountryId(country_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "zone_to_geo_zone WHERE country_id = '" + country_id + "'");

		return query.row['total'];
	}

	async getTotalZoneToGeoZoneByZoneId(zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "zone_to_geo_zone WHERE zone_id = '" + zone_id + "'");

		return query.row['total'];
	}

	async getZonesByGeoZones(geo_zone_ids) {
		if (empty(geo_zone_ids)) {
			return {};
		}
		sql  = "SELECT DISTINCT zgz.country_id, z.zone_id, c.`name` AS country, z.`name` AS zone ";
		sql += "FROM `".DB_PREFIX."zone_to_geo_zone` AS zgz ";
		sql += "LEFT JOIN `".DB_PREFIX."country` c ON c.country_id=zgz.country_id ";
		sql += "LEFT JOIN `".DB_PREFIX."zone` z ON z.country_id=c.country_id ";
		sql += "WHERE zgz.geo_zone_id IN (".implode(',',geo_zone_ids).") ";
		sql += "ORDER BY country_id ASC, zone ASC;";
		const query = await this.db.query( sql );
		results = {};
		for (query.rows of row) {
			country_id = row['country_id'];
			if (!(results[country_id])) {
				results[country_id] = {};
			}
			results[country_id][row['zone_id']] = row['zone'];
		}
		return results;
	}
}