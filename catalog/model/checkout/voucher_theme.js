module.exports = class VoucherTheme extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param voucher_theme_id
	 *
	 * @return array
	 */
	async getVoucherTheme(voucher_theme_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "voucher_theme` vt LEFT JOIN `" + DB_PREFIX + "voucher_theme_description` vtd ON (vt.`voucher_theme_id` = vtd.`voucher_theme_id`) WHERE vt.`voucher_theme_id` = '" + voucher_theme_id + "' AND vtd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getVoucherThemes(data = {}) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "voucher_theme` vt LEFT JOIN `" + DB_PREFIX + "voucher_theme_description` vtd ON (vt.`voucher_theme_id` = vtd.`voucher_theme_id`) WHERE vtd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY vtd.`name`";

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		voucher_theme_data = await this.cache.get('voucher_theme.' + md5(sql));

		if (!voucher_theme_data) {
			const query = await this.db.query(sql);

			voucher_theme_data = query.rows;

			await this.cache.set('voucher_theme.' + md5(sql), voucher_theme_data);
		}

		return voucher_theme_data;
	}
}
