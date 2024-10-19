module.exports =class CountryModel extends Model {
	/**
	 * @param country_id
	 *
	 * @return array
	 */
	async getCountry(country_id) {
		const query = await this.db.query("SELECT *, `c`.`name` FROM `" + DB_PREFIX + "country` `c` LEFT JOIN `" + DB_PREFIX + "address_format` af ON (`c`.`address_format_id` = `af`.`address_format_id`) WHERE `c`.`country_id` = '" + country_id + "' AND `c`.`status` = '1'");

		return query.row;
	}

	/**
	 * @param iso_code_2
	 *
	 * @return array
	 */
	async getCountryByIsoCode2(iso_code_2) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "country` WHERE `iso_code_2` = '" + this.db.escape(iso_code_2) + "' AND `status` = '1'";

		country_data = await this.cache.get('country+'+ md5(sql));

		if (!country_data) {
			const query = await this.db.query(sql);

			country_data = query.rows;

			await this.cache.set('country+'+ md5(sql), country_data);
		}

		return country_data;
	}

	/**
	 * @param iso_code_3
	 *
	 * @return array
	 */
	async getCountryByIsoCode3(iso_code_3) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "country` WHERE `iso_code_3` = '" + this.db.escape(iso_code_3) + "' AND `status` = '1'";

		country_data = await this.cache.get('country+'+ md5(sql));

		if (!country_data) {
			const query = await this.db.query(sql);

			country_data = query.rows;

			await this.cache.set('country+'+ md5(sql), country_data);
		}

		return country_data;
	}

	/**
	 * @return array
	 */
	async getCountries() {
		const sql = "SELECT *, c.`name` FROM `" + DB_PREFIX + "country` c LEFT JOIN `" + DB_PREFIX + "address_format` `af` ON (c.`address_format_id` = af.`address_format_id`) WHERE `c`.`status` = '1' ORDER BY `c`.`name` ASC";

		country_data = await this.cache.get('country+'+ md5(sql));

		if (!country_data) {
			const query = await this.db.query(sql);

			country_data = query.rows;

			await this.cache.set('country+'+ md5(sql), country_data);
		}

		return country_data;
	}
}
