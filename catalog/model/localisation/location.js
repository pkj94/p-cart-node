module.exports =class LocationModel extends Model {
	/**
	 * @param location_id
	 *
	 * @return array
	 */
	async getLocation(location_id) {
		const query = await this.db.query("SELECT `location_id`, `name`, `address`, `geocode`, `telephone`, `image`, `open`, `comment` FROM `" + DB_PREFIX + "location` WHERE `location_id` = '" + location_id + "'");

		return query.row;
	}
}
