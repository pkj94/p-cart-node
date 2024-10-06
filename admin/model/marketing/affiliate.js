<?php
namespace Opencart\Admin\Model\Marketing;
/**
 * Class Affiliate
 *
 * @package Opencart\Admin\Model\Marketing
 */
class AffiliateModel  extends Model {
	/**
	 * @param data
	 *
	 * @return void
	 */
	async addAffiliate(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_affiliate` SET `customer_id` = '" + data['customer_id'] + "', `company` = '" + this.db.escape(data['company']) + "', `website` = '" + this.db.escape(data['website']) + "', `tracking` = '" + this.db.escape(data['tracking']) + "', `commission` = '" + data['commission'] + "', `tax` = '" + this.db.escape(data['tax']) + "', `payment_method` = '" + this.db.escape(data['payment_method']) + "', `cheque` = '" + this.db.escape(data['cheque']) + "', `paypal` = '" + this.db.escape(data['paypal']) + "', `bank_name` = '" + this.db.escape(data['bank_name']) + "', `bank_branch_number` = '" + this.db.escape(data['bank_branch_number']) + "', `bank_swift_code` = '" + this.db.escape(data['bank_swift_code']) + "', `bank_account_name` = '" + this.db.escape(data['bank_account_name']) + "', `bank_account_number` = '" + this.db.escape(data['bank_account_number']) + "', `custom_field` = '" + this.db.escape(data['custom_field'] ? JSON.stringify(data['custom_field']) : JSON.stringify({})) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_added` = NOW()");
	}

	/**
	 * @param   customer_id
	 * @param data
	 *
	 * @return void
	 */
	async editAffiliate(customer_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer_affiliate` SET `company` = '" + this.db.escape(data['company']) + "', `website` = '" + this.db.escape(data['website']) + "', `tracking` = '" + this.db.escape(data['tracking']) + "', `commission` = '" + data['commission'] + "', `tax` = '" + this.db.escape(data['tax']) + "', `payment_method` = '" + this.db.escape(data['payment_method']) + "', `cheque` = '" + this.db.escape(data['cheque']) + "', `paypal` = '" + this.db.escape(data['paypal']) + "', `bank_name` = '" + this.db.escape(data['bank_name']) + "', `bank_branch_number` = '" + this.db.escape(data['bank_branch_number']) + "', `bank_swift_code` = '" + this.db.escape(data['bank_swift_code']) + "', `bank_account_name` = '" + this.db.escape(data['bank_account_name']) + "', `bank_account_number` = '" + this.db.escape(data['bank_account_number']) + "', `custom_field` = '" + this.db.escape(data['custom_field'] ? JSON.stringify(data['custom_field']) : JSON.stringify({})) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param   customer_id
	 * @param amount
	 *
	 * @return void
	 */
	async editBalance(customer_id, amount) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer_affiliate` SET `balance` = '" + amount + "' WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async deleteAffiliate(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_affiliate` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_affiliate_report` WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getAffiliate(customer_id) {
		let query = await this.db.query("SELECT DISTINCT *, CONCAT(c.`firstname`, ' ', c.`lastname`) AS `customer`, ca.`custom_field` FROM `" + DB_PREFIX + "customer_affiliate` ca LEFT JOIN `" + DB_PREFIX + "customer` c ON (ca.`customer_id` = c.`customer_id`) WHERE ca.`customer_id` = '" + customer_id + "'");

		return query.row;
	}

	/**
	 * @param tracking
	 *
	 * @return array
	 */
	async getAffiliateByTracking(tracking) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_affiliate` WHERE `tracking` = '" + this.db.escape(tracking) + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getAffiliates(data = {}) {
		let sql = "SELECT *, CONCAT(`c`.`firstname`, ' ', `c`.`lastname`) AS `name`, `ca`.`status` FROM `" + DB_PREFIX + "customer_affiliate` `ca` LEFT JOIN `" + DB_PREFIX + "customer` `c` ON (`ca`.`customer_id` = `c`.`customer_id`)";

		let implode = [];

		if (data['filter_name']) {
			implode.push("CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if ((data['filter_tracking'])) {
			implode.push("`ca`.`tracking` = '" + this.db.escape(data['filter_tracking']) + "'";
		}

		if ((data['filter_payment_method'])) {
			implode.push("`ca`.`payment_method` = '" + this.db.escape(data['filter_payment_method']) + "'";
		}

		if ((data['filter_commission'])) {
			implode.push("`ca`.`commission` = '" + data['filter_commission'] + "'";
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(`ca`.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(`ca.``date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if (data['filter_status'] && data['filter_status'] !== '') {
			implode.push("`ca`.`status` = '" + data['filter_status'] + "'";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		sort_data = [
			'name',
			'ca.tracking',
			'ca.commission',
			'ca.status',
			'ca.date_added'
		];

		if (data['sort'] && in_array(data['sort'], sort_data)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `name`";
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
	async getTotalAffiliates(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_affiliate` ca LEFT JOIN `" + DB_PREFIX + "customer` c ON (ca.`customer_id` = c.`customer_id`)";

		let implode = [];

		if (data['filter_name']) {
			implode.push("CONCAT(`c`.`firstname`, ' ', `c`.`lastname`) LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if ((data['filter_tracking'])) {
			implode.push("`ca`.`tracking` = '" + this.db.escape(data['filter_tracking']) + "'";
		}

		if ((data['filter_payment_method'])) {
			implode.push("`ca`.`payment_method` = '" + this.db.escape(data['filter_payment_method']) + "'";
		}

		if ((data['filter_commission'])) {
			implode.push("`ca`.`commission` = '" + data['filter_commission'] + "'";
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(`ca`.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(`ca`.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if (data['filter_status'] && data['filter_status'] !== '') {
			implode.push("`ca`.`status` = '" + data['filter_status'] + "'";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getReports(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `ip`, `store_id`, `country`, `date_added` FROM `" + DB_PREFIX + "customer_affiliate_report` WHERE `customer_id` = '" + customer_id + "' ORDER BY `date_added` ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalReports(customer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_affiliate_report` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}
}
