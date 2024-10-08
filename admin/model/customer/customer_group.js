<?php
namespace Opencart\Admin\Model\Customer;
/**
 * Class Customer Group
 *
 * @package Opencart\Admin\Model\Customer
 */
class CustomerGroupModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCustomerGroup(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_group` SET `approval` = '" + ((data['approval']) ? data['approval'] : 0) + "', `sort_order` = '" + data['sort_order'] + "'");

		customer_group_id = this.db.getLastId();

		for (data['customer_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_group_description` SET `customer_group_id` = '" + customer_group_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + ", `description` = " + this.db.escape(value['description']) + "");
		}

		return customer_group_id;
	}

	/**
	 * @param   customer_group_id
	 * @param data
	 *
	 * @return void
	 */
	async editCustomerGroup(customer_group_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer_group` SET `approval` = '" + ((data['approval']) ? data['approval'] : 0) + "', `sort_order` = '" + data['sort_order'] + "' WHERE `customer_group_id` = '" + customer_group_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_group_description` WHERE `customer_group_id` = '" + customer_group_id + "'");

		for (data['customer_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_group_description` SET `customer_group_id` = '" + customer_group_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + ", `description` = " + this.db.escape(value['description']) + "");
		}
	}

	/**
	 * @param customer_group_id
	 *
	 * @return void
	 */
	async deleteCustomerGroup(customer_group_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_group` WHERE `customer_group_id` = '" + customer_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_group_description` WHERE `customer_group_id` = '" + customer_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_discount` WHERE `customer_group_id` = '" + customer_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_special` WHERE `customer_group_id` = '" + customer_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_reward` WHERE `customer_group_id` = '" + customer_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_rate_to_customer_group` WHERE `customer_group_id` = '" + customer_group_id + "'");
	}

	/**
	 * @param customer_group_id
	 *
	 * @return array
	 */
	async getCustomerGroup(customer_group_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "customer_group` cg LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (cg.`customer_group_id` = cgd.`customer_group_id`) WHERE cg.`customer_group_id` = '" + customer_group_id + "' AND cgd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCustomerGroups(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "customer_group` cg LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (cg.`customer_group_id` = cgd.`customer_group_id`) WHERE cgd.`language_id` = '" + this.config.get('config_language_id') + "'";

		let sort_data = [
			'cgd.name',
			'cg.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY cgd.`name`";
		}

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

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param customer_group_id
	 *
	 * @return array
	 */
	async getDescriptions(customer_group_id) {
		customer_group_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_group_description` WHERE `customer_group_id` = '" + customer_group_id + "'");

		for (let result of query.rows) {
			customer_group_data[result['language_id']] = [
				'name'        : result['name'],
				'description' : result['description']
			];
		}

		return customer_group_data;
	}

	/**
	 * @return int
	 */
	async getTotalCustomerGroups() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_group`");

		return query.row['total'];
	}
}
