<?php
namespace Opencart\Admin\Model\Design;
/**
 * Class Translation
 *
 * @package Opencart\Admin\Model\Design
 */
class TranslationModel  extends Model {
	/**
	 * @param data
	 *
	 * @return void
	 */
	async addTranslation(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "translation` SET `store_id` = '" + data['store_id'] + "', `language_id` = '" + data['language_id'] + "', `route` = '" + this.db.escape(data['route']) + "', `key` = '" + this.db.escape(data['key']) + "', `value` = '" + this.db.escape(data['value']) + "', `date_added` = NOW()");
	}

	/**
	 * @param   translation_id
	 * @param data
	 *
	 * @return void
	 */
	async editTranslation(translation_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "translation` SET `store_id` = '" + data['store_id'] + "', `language_id` = '" + data['language_id'] + "', `route` = '" + this.db.escape(data['route']) + "', `key` = '" + this.db.escape(data['key']) + "', `value` = '" + this.db.escape(data['value']) + "' WHERE `translation_id` = '" + translation_id + "'");
	}

	/**
	 * @param translation_id
	 *
	 * @return void
	 */
	async deleteTranslation(translation_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "translation` WHERE `translation_id` = '" + translation_id + "'");
	}

	/**
	 * @param translation_id
	 *
	 * @return array
	 */
	async getTranslation(translation_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "translation` WHERE `translation_id` = '" + translation_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getTranslations(data = {}) {
		let sql = "SELECT *, (SELECT s.`name` FROM `" + DB_PREFIX + "store` s WHERE s.`store_id` = t.`store_id`) AS store, (SELECT l.`name` FROM `" + DB_PREFIX + "language` l WHERE l.`language_id` = t.`language_id`) AS language FROM `" + DB_PREFIX + "translation` t";

		sort_data = [
			'store',
			'language',
			'route',
			'key',
			'value'
		];

		if (data['sort'] && in_array(data['sort'], sort_data)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY store";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalTranslations() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "translation`");

		return query.row['total'];
	}
}