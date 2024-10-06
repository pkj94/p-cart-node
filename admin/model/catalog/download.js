<?php
namespace Opencart\Admin\Model\Catalog;
/**
 * Class Download
 *
 * @package Opencart\Admin\Model\Catalog
 */
class DownloadModel  extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addDownload(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "download` SET `filename` = '" + this.db.escape(data['filename']) + "', `mask` = '" + this.db.escape(data['mask']) + "', `date_added` = NOW()");

		download_id = this.db.getLastId();

		for (data['download_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "download_description` SET `download_id` = '" + download_id + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(value['name']) + "'");
		}

		return download_id;
	}

	/**
	 * @param   download_id
	 * @param data
	 *
	 * @return void
	 */
	async editDownload(download_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "download` SET `filename` = '" + this.db.escape(data['filename']) + "', `mask` = '" + this.db.escape(data['mask']) + "' WHERE `download_id` = '" + download_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "download_description` WHERE `download_id` = '" + download_id + "'");

		for (data['download_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "download_description` SET `download_id` = '" + download_id + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(value['name']) + "'");
		}
	}

	/**
	 * @param download_id
	 *
	 * @return void
	 */
	async deleteDownload(download_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "download` WHERE `download_id` = '" + download_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "download_description` WHERE `download_id` = '" + download_id + "'");
	}

	/**
	 * @param download_id
	 *
	 * @return array
	 */
	async getDownload(download_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "download` d LEFT JOIN `" + DB_PREFIX + "download_description` dd ON (d.`download_id` = dd.`download_id`) WHERE d.`download_id` = '" + download_id + "' AND dd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getDownloads(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "download` d LEFT JOIN `" + DB_PREFIX + "download_description` dd ON (d.`download_id` = dd.`download_id`) WHERE dd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND dd.`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		sort_data = [
			'dd.name',
			'd.date_added'
		];

		if (data['sort'] && in_array(data['sort'], sort_data)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY dd.`name`";
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
	 * @param download_id
	 *
	 * @return array
	 */
	async getDescriptions(download_id) {
		download_description_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "download_description` WHERE `download_id` = '" + download_id + "'");

		for (query.rows of result) {
			download_description_data[result['language_id']] = ['name' : result['name']];
		}

		return download_description_data;
	}

	/**
	 * @return int
	 */
	async getTotalDownloads() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "download`");

		return query.row['total'];
	}

	/**
	 * @param download_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getReports(download_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `ip`, `store_id`, `country`, `date_added` FROM `" + DB_PREFIX + "download_report` WHERE `download_id` = '" + download_id + "' ORDER BY `date_added` ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param download_id
	 *
	 * @return int
	 */
	async getTotalReports(download_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "download_report` WHERE `download_id` = '" + download_id + "'");

		return query.row['total'];
	}
}
