<?php
namespace Opencart\Admin\Model\Tool;
/**
 * Class Upload
 *
 * @package Opencart\Admin\Model\Tool
 */
class UploadModel  extends Model {
	/**
	 * @param name
	 * @param filename
	 *
	 * @return string
	 */
	async addUpload(name, filename) {
		code = oc_token(32);

		await this.db.query("INSERT INTO `" + DB_PREFIX + "upload` SET `name` = '" + this.db.escape(name) + "', `filename` = '" + this.db.escape(filename) + "', `code` = '" + this.db.escape(code) + "', `date_added` = NOW()");

		return code;
	}

	/**
	 * @param upload_id
	 *
	 * @return void
	 */
	async deleteUpload(upload_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "upload` WHERE `upload_id` = '" + upload_id + "'");
	}

	/**
	 * @param upload_id
	 *
	 * @return array
	 */
	async getUpload(upload_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "upload` WHERE `upload_id` = '" + upload_id + "'");

		return query.row;
	}

	/**
	 * @param code
	 *
	 * @return array
	 */
	async getUploadByCode(code) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "upload` WHERE `code` = '" + this.db.escape(code) + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getUploads(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "upload`";

		let implode = [];

		if (data['filter_name']) {
			implode.push("`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if (!empty(data['filter_code'])) {
			implode.push("`code` LIKE '" + this.db.escape(data['filter_code'] + '%') + "'";
		}

		if (!empty(data['filter_date_from'])) {
			implode.push("DATE(`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if (!empty(data['filter_date_to'])) {
			implode.push("DATE(`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if (implode) {
			sql += " WHERE " + implode(" AND ", implode);
		}

		sort_data = [
			'name',
			'code',
			'date_added'
		];

		if (data['sort'] && in_array(data['sort'], sort_data)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `date_added`";
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
	 * @param data
	 *
	 * @return int
	 */
	async getTotalUploads(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "upload`";

		let implode = [];

		if (data['filter_name']) {
			implode.push("`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if (!empty(data['filter_code'])) {
			implode.push("`code` LIKE '" + this.db.escape(data['filter_code'] + '%') + "'";
		}

		if (!empty(data['filter_date_from'])) {
			implode.push("DATE(`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if (!empty(data['filter_date_to'])) {
			implode.push("DATE(`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if (implode) {
			sql += " WHERE " + implode(" AND ", implode);
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
