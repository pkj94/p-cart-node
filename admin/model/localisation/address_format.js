module.exports = class AddressFormatLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addAddressFormat(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "address_format` SET `name` = " + this.db.escape(data['name']) + ", `address_format` = " + this.db.escape(data['address_format']) + "");

		return this.db.getLastId();
	}

	/**
	 * @param   address_format_id
	 * @param data
	 *
	 * @return void
	 */
	async editAddressFormat(address_format_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "address_format` SET `name` = " + this.db.escape(data['name']) + ", `address_format` = " + this.db.escape(data['address_format']) + " WHERE `address_format_id` = '" + address_format_id + "'");
	}

	/**
	 * @param address_format_id
	 *
	 * @return void
	 */
	async deleteAddressFormat(address_format_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "address_format` WHERE `address_format_id` = '" + address_format_id + "'");
	}

	/**
	 * @param address_format_id
	 *
	 * @return array
	 */
	async getAddressFormat(address_format_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "address_format` WHERE `address_format_id` = '" + address_format_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getAddressFormats(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "address_format`";

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
	 * @param data
	 *
	 * @return int
	 */
	async getTotalAddressFormats(data = {}) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "address_format`");

		return query.row['total'];
	}
}
