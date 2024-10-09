module.exports = class VoucherThemeSaleModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addVoucherTheme(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "voucher_theme` SET `image` = " + this.db.escape(data['image']) + "");

		let voucher_theme_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['voucher_theme_description'])) {
			language_id = language_id.split('-')[1];
			await this.db.query("INSERT INTO `" + DB_PREFIX + "voucher_theme_description` SET `voucher_theme_id` = '" + voucher_theme_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('voucher_theme');

		return voucher_theme_id;
	}

	/**
	 * @param   voucher_theme_id
	 * @param data
	 *
	 * @return void
	 */
	async editVoucherTheme(voucher_theme_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "voucher_theme` SET `image` = " + this.db.escape(data['image']) + " WHERE `voucher_theme_id` = '" + voucher_theme_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "voucher_theme_description` WHERE `voucher_theme_id` = '" + voucher_theme_id + "'");

		for (let [language_id, value] of Object.entries(data['voucher_theme_description'])) {
			language_id = language_id.split('-')[1];
			await this.db.query("INSERT INTO `" + DB_PREFIX + "voucher_theme_description` SET `voucher_theme_id` = '" + voucher_theme_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('voucher_theme');
	}

	/**
	 * @param voucher_theme_id
	 *
	 * @return void
	 */
	async deleteVoucherTheme(voucher_theme_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "voucher_theme` WHERE `voucher_theme_id` = '" + voucher_theme_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "voucher_theme_description` WHERE `voucher_theme_id` = '" + voucher_theme_id + "'");

		await this.cache.delete('voucher_theme');
	}

	/**
	 * @param voucher_theme_id
	 *
	 * @return array
	 */
	async getVoucherTheme(voucher_theme_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "voucher_theme` vt LEFT JOIN `" + DB_PREFIX + "voucher_theme_description` vtd ON (vt.`voucher_theme_id` = vtd.`voucher_theme_id`) WHERE vt.`voucher_theme_id` = '" + voucher_theme_id + "' AND vtd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getVoucherThemes(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "voucher_theme` vt LEFT JOIN `" + DB_PREFIX + "voucher_theme_description` `vtd` ON (`vt`.`voucher_theme_id` = `vtd`.`voucher_theme_id`) WHERE `vtd`.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `vtd`.`name`";

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
                        data['start'] = data['start']||0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		voucher_theme_data = await this.cache.get('voucher_theme.' + md5(sql));

		if (!voucher_theme_data) {
			let query = await this.db.query(sql);

			voucher_theme_data = query.rows;

			await this.cache.set('voucher_theme.' + md5(sql), voucher_theme_data);
		}

		return voucher_theme_data;
	}

	/**
	 * @param voucher_theme_id
	 *
	 * @return array
	 */
	async getDescriptions(voucher_theme_id) {
		let voucher_theme_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "voucher_theme_description` WHERE `voucher_theme_id` = '" + voucher_theme_id + "'");

		for (let result of query.rows) {
			voucher_theme_data[result['language_id']] = {'name' : result['name']};
		}

		return voucher_theme_data;
	}

	/**
	 * @return int
	 */
	async getTotalVoucherThemes() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "voucher_theme`");

		return query.row['total'];
	}
}