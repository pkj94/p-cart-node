<?php
namespace Opencart\Admin\Model\Customer;
/**
 * Class Customer Approval
 *
 * @package Opencart\Admin\Model\Customer
 */
class CustomerApprovalModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCustomerApprovals(data = {}) {
		let sql = "SELECT *, CONCAT(c.`firstname`, ' ', c.`lastname`) AS customer, cgd.`name` AS customer_group, ca.`type` FROM `" + DB_PREFIX + "customer_approval` ca LEFT JOIN `" + DB_PREFIX + "customer` c ON (ca.`customer_id` = c.`customer_id`) LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (c.`customer_group_id` = cgd.`customer_group_id`) WHERE cgd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE '" + this.db.escape('%' + data['filter_customer'] + '%') + "'";
		}

		if ((data['filter_email'])) {
			sql += " AND c.`email` LIKE '" + this.db.escape(data['filter_email'] + '%') + "'";
		}

		if ((data['filter_customer_group_id'])) {
			sql += " AND c.`customer_group_id` = '" + data['filter_customer_group_id'] + "'";
		}

		if ((data['filter_type'])) {
			sql += " AND ca.`type` = '" + this.db.escape(data['filter_type']) + "'";
		}

		if ((data['filter_date_from'])) {
			sql += " AND DATE(c.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			sql += " AND DATE(c.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		sql += " ORDER BY c.`date_added` DESC";

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
	 * @param customer_approval_id
	 *
	 * @return array
	 */
	async getCustomerApproval(customer_approval_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_approval_id` = '" + customer_approval_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalCustomerApprovals(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_approval` ca LEFT JOIN `" + DB_PREFIX + "customer` c ON (ca.`customer_id` = c.`customer_id`)";

		let implode = [];

		if ((data['filter_customer'])) {
			implode.push("CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE '" + this.db.escape('%' + data['filter_customer'] + '%') + "'";
		}

		if ((data['filter_email'])) {
			implode.push("c.`email` LIKE '" + this.db.escape(data['filter_email'] + '%') + "'";
		}

		if ((data['filter_customer_group_id'])) {
			implode.push("c.`customer_group_id` = '" + data['filter_customer_group_id'] + "'";
		}

		if ((data['filter_type'])) {
			implode.push("ca.`type` = '" + this.db.escape(data['filter_type']) + "'";
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(c.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(c.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async approveCustomer(customer_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `status` = '1' WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_id` = '" + customer_id + "' AND `type` = 'customer'");
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async denyCustomer(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_id` = '" + customer_id + "' AND `type` = 'customer'");
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async approveAffiliate(customer_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer_affiliate` SET `status` = '1' WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_id` = '" + customer_id + "' AND `type` = 'affiliate'");
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async denyAffiliate(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_id` = '" + customer_id + "' AND `type` = 'affiliate'");
	}
}
