module.exports = class ZoneLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addZone(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "zone` SET `name` = " + this.db.escape(data['name']) + ", `code` = " + this.db.escape(data['code']) + ", `country_id` = '" + data['country_id'] + "', `status` = '" + ((data['status']) ? data['status'] : 0) + "'");

		await this.cache.delete('zone');

		return this.db.getLastId();
	}

	/**
	 * @param   zone_id
	 * @param data
	 *
	 * @return void
	 */
	async editZone(zone_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "zone` SET `name` = " + this.db.escape(data['name']) + ", `code` = " + this.db.escape(data['code']) + ", `country_id` = '" + data['country_id'] + "', `status` = '" + ((data['status']) ? data['status'] : 0) + "' WHERE `zone_id` = '" + zone_id + "'");

		await this.cache.delete('zone');
	}

	/**
	 * @param zone_id
	 *
	 * @return void
	 */
	async deleteZone(zone_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + zone_id + "'");

		await this.cache.delete('zone');
	}

	/**
	 * @param zone_id
	 *
	 * @return array
	 */
	async getZone(zone_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + zone_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getZones(data = {}) {
		let sql = "SELECT *, z.`name`, c.`name` AS country FROM `" + DB_PREFIX + "zone` z LEFT JOIN `" + DB_PREFIX + "country` c ON (z.`country_id` = c.`country_id`)";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("z.`name` LIKE " + this.db.escape(data['filter_name'] + '%'));
		}

		if ((data['filter_country'])) {
			implode.push("c.`name` LIKE " + this.db.escape(data['filter_country'] + '%'));
		}

		if ((data['filter_code'])) {
			implode.push("z.`code` LIKE " + this.db.escape(data['filter_code'] + '%'));
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'c.name',
			'z.name',
			'z.code'
		];

		if ((data['sort']) && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY c.`name`";
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
	 * @param country_id
	 *
	 * @return array
	 */
	async getZonesByCountryId(country_id) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "zone` WHERE `country_id` = '" + country_id + "' AND `status` = '1' ORDER BY `name`";

		let zone_data = await this.cache.get('zone.' + md5(sql));

		if (!zone_data) {
			const query = await this.db.query(sql);

			zone_data = query.rows;

			await this.cache.set('zone.' + md5(sql), zone_data);
		}

		return zone_data;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalZones(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "zone` z";

		if ((data['filter_country'])) {
			sql += " LEFT JOIN `" + DB_PREFIX + "country` c ON (z.`country_id` = c.`country_id`)";
		}

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("z.`name` LIKE " + this.db.escape(data['filter_name'] + '%'));
		}

		if ((data['filter_country'])) {
			implode.push("c.`name` LIKE " + this.db.escape(data['filter_country'] + '%'));
		}

		if ((data['filter_code'])) {
			implode.push("z.`code` LIKE " + this.db.escape(data['filter_code'] + '%'));
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param country_id
	 *
	 * @return int
	 */
	async getTotalZonesByCountryId(country_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "zone` WHERE `country_id` = '" + country_id + "'");

		return query.row['total'];
	}
}
