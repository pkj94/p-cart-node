<?php
namespace Opencart\Admin\Model\Customer;
/**
 * Class GDPR
 *
 * @package Opencart\Admin\Model\Customer
 */
class GdprModel  extends Model {
	/**
	 * @param gdpr_id
	 * @param status
	 *
	 * @return void
	 */
	async editStatus(gdpr_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "gdpr` SET `status` = '" + status + "' WHERE `gdpr_id` = '" + gdpr_id + "'");
	}

	/**
	 * @param gdpr_id
	 *
	 * @return void
	 */
	async deleteGdpr(gdpr_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "gdpr` WHERE `gdpr_id` = '" + gdpr_id + "'");
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getGdprs(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "gdpr`";

		let implode = [];

		if (!empty(data['filter_email'])) {
			implode.push("`email` LIKE '" + this.db.escape(data['filter_email']) + "'";
		}

		if (!empty(data['filter_action'])) {
			implode.push("`action` = '" + this.db.escape(data['filter_action']) + "'";
		}

		if (data['filter_status'] && data['filter_status'] !== '') {
			implode.push("`status` = '" + data['filter_status'] + "'";
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

		sql += " ORDER BY `date_added` DESC";

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
	 * @param gdpr_id
	 *
	 * @return array
	 */
	async getGdpr(gdpr_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "gdpr` WHERE `gdpr_id` = '" + gdpr_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalGdprs(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "gdpr`";

		let implode = [];

		if (!empty(data['filter_email'])) {
			implode.push("`email` LIKE '" + this.db.escape(data['filter_email']) + "'";
		}

		if (!empty(data['filter_action'])) {
			implode.push("`action` = '" + this.db.escape(data['filter_action']) + "'";
		}

		if (data['filter_status'] && data['filter_status'] !== '') {
			implode.push("`status` = '" + data['filter_status'] + "'";
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

	/**
	 * @return array
	 */
	async getExpires() {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "gdpr` WHERE `status` = '2' AND DATE(`date_added`) <= DATE('" + this.db.escape(date('Y-m-d', strtotime('+' + this.config.get('config_gdpr_limit') + ' days'))) + "') ORDER BY `date_added` DESC");

		return query.rows;
	}
}