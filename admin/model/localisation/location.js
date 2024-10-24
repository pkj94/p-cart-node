module.exports = class LocationLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addLocation(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "location` SET `name` = " + this.db.escape(data['name']) + ", address = " + this.db.escape(data['address']) + ", `geocode` = " + this.db.escape(data['geocode']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `image` = " + this.db.escape(data['image']) + ", `open` = " + this.db.escape(data['open']) + ", `comment` = " + this.db.escape(data['comment']) + "");

		return this.db.getLastId();
	}

	/**
	 * @param   location_id
	 * @param data
	 *
	 * @return void
	 */
	async editLocation(location_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "location` SET `name` = " + this.db.escape(data['name']) + ", `address` = " + this.db.escape(data['address']) + ", `geocode` = " + this.db.escape(data['geocode']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `image` = " + this.db.escape(data['image']) + ", `open` = " + this.db.escape(data['open']) + ", `comment` = " + this.db.escape(data['comment']) + " WHERE `location_id` = '" + location_id + "'");
	}

	/**
	 * @param location_id
	 *
	 * @return void
	 */
	async deleteLocation(location_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "location` WHERE `location_id` = '" + location_id + "'");
	}

	/**
	 * @param location_id
	 *
	 * @return array
	 */
	async getLocation(location_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "location` WHERE `location_id` = '" + location_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getLocations(data = {}) {
		let sql = "SELECT `location_id`, `name`, `address` FROM `" + DB_PREFIX + "location`";

		let sort_data = [
			'name',
			'address',
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

		const query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalLocations() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "location`");

		return query.row['total'];
	}
}
