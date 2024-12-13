module.exports = class ModelLocalisationLocation extends Model {
	async getLocation(location_id) {
		const query = await this.db.query("SELECT location_id, name, address, geocode, telephone, fax, image, open, comment FROM " + DB_PREFIX + "location WHERE location_id = '" + location_id + "'");

		return query.row;
	}
}