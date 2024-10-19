module.exports = class ZoneModel extends Model {
	/**
	 * @param zone_id
	 *
	 * @return array
	 */
	async getZone(zone_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + zone_id + "' AND `status` = '1'");

		return query.row;
	}

	/**
	 * @param country_id
	 *
	 * @return array
	 */
	async getZonesByCountryId(country_id) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "zone` WHERE `country_id` = '" + country_id + "' AND `status` = '1' ORDER BY `name`";

		let zone_data = await this.cache.get('zone+' + md5(sql));

		if (!zone_data) {
			const query = await this.db.query(sql);

			zone_data = query.rows;

			await this.cache.set('zone+' + md5(sql), zone_data);
		}

		return zone_data;
	}
}
