module.exports = class ModelDesignTranslation extends Model {
	async addTranslation(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "translation` SET `store_id` = '" + data['store_id'] + "', `language_id` = '" + data['language_id'] + "', `route` = '" + this.db.escape(data['route']) + "', `key` = '" + this.db.escape(data['key']) + "', `value` = '" + this.db.escape(data['value']) + "', `date_added` = NOW()");
	}

	async editTranslation(translation_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "translation` SET `store_id` = '" + data['store_id'] + "', `language_id` = '" + data['language_id'] + "', `route` = '" + this.db.escape(data['route']) + "', `key` = '" + this.db.escape(data['key']) + "', `value` = '" + this.db.escape(data['value']) + "' WHERE `translation_id` = '" + translation_id + "'");
	}

	async deleteTranslation(translation_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "translation` WHERE `translation_id` = '" + translation_id + "'");
	}

	async getTranslation(translation_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "translation` WHERE `translation_id` = '" + translation_id + "'");

		return query.row;
	}

	async getTranslations(data = {}) {
		let sql = "SELECT *, (SELECT s.name FROM `" + DB_PREFIX + "store` s WHERE s.store_id = t.store_id) AS store, (SELECT l.name FROM `" + DB_PREFIX + "language` l WHERE l.language_id = t.language_id) AS language FROM `" + DB_PREFIX + "translation` t";

		let sort_data = [
			'store',
			'language',
			'route',
			'key',
			'value'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY `" + data['sort'] + "`";
		} else {
			sql += " ORDER BY store";
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

	async getTotalTranslations() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "translation`");

		return query.row['total'];
	}
}
