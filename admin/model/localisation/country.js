module.exports = class CountryLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCountry(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "country` SET `name` = " + this.db.escape(data['name']) + ", `iso_code_2` = " + this.db.escape(data['iso_code_2']) + ", `iso_code_3` = " + this.db.escape(data['iso_code_3']) + ", `address_format_id` = '" + data['address_format_id'] + "', `postcode_required` = '" + data['postcode_required'] + "', `status` = '" + ((data['status']) ? data['status'] : 0) + "'");

		await this.cache.delete('country');

		return this.db.getLastId();
	}

	/**
	 * @param   country_id
	 * @param data
	 *
	 * @return void
	 */
	async editCountry(country_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "country` SET `name` = " + this.db.escape(data['name']) + ", `iso_code_2` = " + this.db.escape(data['iso_code_2']) + ", `iso_code_3` = " + this.db.escape(data['iso_code_3']) + ", `address_format_id` = '" + data['address_format_id'] + "', `postcode_required` = '" + data['postcode_required'] + "', `status` = '" + ((data['status']) ? data['status'] : 0) + "' WHERE `country_id` = '" + country_id + "'");

		await this.cache.delete('country');
	}

	/**
	 * @param country_id
	 *
	 * @return void
	 */
	async deleteCountry(country_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "country` WHERE `country_id` = '" + country_id + "'");

		await this.cache.delete('country');
	}

	/**
	 * @param country_id
	 *
	 * @return array
	 */
	async getCountry(country_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "country` WHERE `country_id` = '" + country_id + "'");

		return query.row;
	}

	/**
	 * @param iso_code_2
	 *
	 * @return array
	 */
	async getCountryByIsoCode2(iso_code_2) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE `iso_code_2` = " + this.db.escape(iso_code_2) + " AND `status` = '1'");

		return query.row;
	}

	/**
	 * @param iso_code_3
	 *
	 * @return array
	 */
	async getCountryByIsoCode3(iso_code_3) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE `iso_code_3` = " + this.db.escape(iso_code_3) + " AND `status` = '1'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCountries(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "country`";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("`name` LIKE " + this.db.escape(data['filter_name'] + '%'));
		}

		if ((data['filter_iso_code_2'])) {
			implode.push("`iso_code_2` LIKE " + this.db.escape(data['filter_iso_code_2'] + '%'));
		}

		if ((data['filter_iso_code_3'])) {
			implode.push("`iso_code_3` LIKE " + this.db.escape(data['filter_iso_code_3'] + '%'));
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'name',
			'iso_code_2',
			'iso_code_3'
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

		let country_data = await this.cache.get('country.' + md5(sql));
		if (!country_data) {
			const query = await this.db.query(sql);

			country_data = query.rows;

			await this.cache.set('country.' + md5(sql), country_data);
		}

		return country_data;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalCountries(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "country`";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("`name` LIKE " + this.db.escape(data['filter_name'] + '%'));
		}

		if ((data['filter_iso_code_2'])) {
			implode.push("`iso_code_2` LIKE " + this.db.escape(data['filter_iso_code_2'] + '%'));
		}

		if ((data['filter_iso_code_3'])) {
			implode.push("`iso_code_3` LIKE " + this.db.escape(data['filter_iso_code_3'] + '%'));
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param address_format_id
	 *
	 * @return int
	 */
	async getTotalCountriesByAddressFormatId(address_format_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "country` WHERE `address_format_id` = '" + address_format_id + "'");

		return query.row['total'];
	}
}
