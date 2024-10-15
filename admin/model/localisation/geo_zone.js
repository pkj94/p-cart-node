module.exports = class GeoZoneLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addGeoZone(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "geo_zone` SET `name` = " + this.db.escape(data['name']) + ", `description` = " + this.db.escape(data['description']) + ", `date_added` = NOW()");

		const geo_zone_id = this.db.getLastId();

		if ((data['zone_to_geo_zone'])) {
			for (let value of data['zone_to_geo_zone']) {
				await this.db.query("DELETE FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "' AND `country_id` = '" + value['country_id'] + "' AND `zone_id` = '" + value['zone_id'] + "'");

				await this.db.query("INSERT INTO `" + DB_PREFIX + "zone_to_geo_zone` SET `country_id` = '" + value['country_id'] + "', `zone_id` = '" + value['zone_id'] + "', `geo_zone_id` = '" + geo_zone_id + "', `date_added` = NOW()");
			}
		}

		await this.cache.delete('geo_zone');

		return geo_zone_id;
	}

	/**
	 * @param   geo_zone_id
	 * @param data
	 *
	 * @return void
	 */
	async editGeoZone(geo_zone_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "geo_zone` SET `name` = " + this.db.escape(data['name']) + ", `description` = " + this.db.escape(data['description']) + ", `date_modified` = NOW() WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		if ((data['zone_to_geo_zone'])) {
			for (let value of data['zone_to_geo_zone']) {
				await this.db.query("DELETE FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "' AND `country_id` = '" + value['country_id'] + "' AND `zone_id` = '" + value['zone_id'] + "'");

				await this.db.query("INSERT INTO `" + DB_PREFIX + "zone_to_geo_zone` SET `country_id` = '" + value['country_id'] + "', `zone_id` = '" + value['zone_id'] + "', `geo_zone_id` = '" + geo_zone_id + "', `date_added` = NOW()");
			}
		}

		await this.cache.delete('geo_zone');
	}

	/**
	 * @param geo_zone_id
	 *
	 * @return void
	 */
	async deleteGeoZone(geo_zone_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		await this.cache.delete('geo_zone');
	}

	/**
	 * @param geo_zone_id
	 *
	 * @return array
	 */
	async getGeoZone(geo_zone_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getGeoZones(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "geo_zone`";

		let sort_data = [
			'name',
			'description'
		];

		if ((data['sort']) && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `name`";
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

		let geo_zone_data = await this.cache.get('geo_zone+' + md5(sql));

		if (!geo_zone_data) {
			const query = await this.db.query(sql);

			geo_zone_data = query.rows;

			await this.cache.set('geo_zone+' + md5(sql), geo_zone_data);
		}

		return geo_zone_data;
	}

	/**
	 * @return int
	 */
	async getTotalGeoZones() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "geo_zone`");

		return query.row['total'];
	}

	/**
	 * @param geo_zone_id
	 *
	 * @return array
	 */
	async getZoneToGeoZones(geo_zone_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		return query.rows;
	}

	/**
	 * @param geo_zone_id
	 *
	 * @return int
	 */
	async getTotalZoneToGeoZoneByGeoZoneId(geo_zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		return query.row['total'];
	}

	/**
	 * @param country_id
	 *
	 * @return int
	 */
	async getTotalZoneToGeoZoneByCountryId(country_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `country_id` = '" + country_id + "'");

		return query.row['total'];
	}

	/**
	 * @param zone_id
	 *
	 * @return int
	 */
	async getTotalZoneToGeoZoneByZoneId(zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `zone_id` = '" + zone_id + "'");

		return query.row['total'];
	}
}
