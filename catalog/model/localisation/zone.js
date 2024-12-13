module.exports = class ModelLocalisationZone extends Model {
	async getZone(zone_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE zone_id = '" + zone_id + "' AND status = '1'");

		return query.row;
	}

	async getZonesByCountryId(country_id) {
		let zone_data = await this.cache.get('zone.' + country_id);

		if (!zone_data) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '" + country_id + "' AND status = '1' ORDER BY name");

			zone_data = query.rows;

			await this.cache.set('zone.' + country_id, zone_data);
		}

		return zone_data;
	}
}