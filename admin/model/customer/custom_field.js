<?php
namespace Opencart\Admin\Model\Customer;
/**
 * Class Custom Field
 *
 * @package Opencart\Admin\Model\Customer
 */
class CustomFieldModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCustomField(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field` SET `type` = '" + this.db.escape(data['type']) + "', `value` = " + this.db.escape(data['value']) + ", `validation` = '" + this.db.escape(data['validation']) + "', `location` = '" + this.db.escape(data['location']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `sort_order` = '" + data['sort_order'] + "'");

		custom_field_id = this.db.getLastId();

		for (data['custom_field_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_description` SET `custom_field_id` = '" + custom_field_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		if ((data['custom_field_customer_group'])) {
			for (data['custom_field_customer_group'] of custom_field_customer_group) {
				if ((custom_field_customer_group['customer_group_id'])) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_customer_group` SET `custom_field_id` = '" + custom_field_id + "', `customer_group_id` = '" + custom_field_customer_group['customer_group_id'] + "', `required` = '" + ((custom_field_customer_group['required']) ? 1 : 0) + "'");
				}
			}
		}

		if ((data['custom_field_value'])) {
			for (data['custom_field_value'] of custom_field_value) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_value` SET `custom_field_id` = '" + custom_field_id + "', `sort_order` = '" + custom_field_value['sort_order'] + "'");

				custom_field_value_id = this.db.getLastId();

				for (custom_field_value['custom_field_value_description'] of language_id : custom_field_value_description) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_value_description` SET `custom_field_value_id` = '" + custom_field_value_id + "', `language_id` = '" + language_id + "', `custom_field_id` = '" + custom_field_id + "', `name` = '" + this.db.escape(custom_field_value_description['name']) + "'");
				}
			}
		}

		return custom_field_id;
	}

	/**
	 * @param   custom_field_id
	 * @param data
	 *
	 * @return void
	 */
	async editCustomField(custom_field_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "custom_field` SET `type` = '" + this.db.escape(data['type']) + "', `value` = " + this.db.escape(data['value']) + ", `validation` = '" + this.db.escape(data['validation']) + "', `location` = '" + this.db.escape(data['location']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `sort_order` = '" + data['sort_order'] + "' WHERE `custom_field_id` = '" + custom_field_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_description` WHERE `custom_field_id` = '" + custom_field_id + "'");

		for (data['custom_field_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_description` SET `custom_field_id` = '" + custom_field_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_customer_group` WHERE `custom_field_id` = '" + custom_field_id + "'");

		if ((data['custom_field_customer_group'])) {
			for (data['custom_field_customer_group'] of custom_field_customer_group) {
				if ((custom_field_customer_group['customer_group_id'])) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_customer_group` SET `custom_field_id` = '" + custom_field_id + "', `customer_group_id` = '" + custom_field_customer_group['customer_group_id'] + "', `required` = '" + ((custom_field_customer_group['required']) ? 1 : 0) + "'");
				}
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value` WHERE `custom_field_id` = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value_description` WHERE `custom_field_id` = '" + custom_field_id + "'");

		if ((data['custom_field_value'])) {
			for (data['custom_field_value'] of custom_field_value) {
				if (custom_field_value['custom_field_value_id']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_value` SET `custom_field_value_id` = '" + custom_field_value['custom_field_value_id'] + "', `custom_field_id` = '" + custom_field_id + "', `sort_order` = '" + custom_field_value['sort_order'] + "'");
				} else {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_value` SET `custom_field_id` = '" + custom_field_id + "', `sort_order` = '" + custom_field_value['sort_order'] + "'");
				}

				custom_field_value_id = this.db.getLastId();

				for (custom_field_value['custom_field_value_description'] of language_id : custom_field_value_description) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_value_description` SET `custom_field_value_id` = '" + custom_field_value_id + "', `language_id` = '" + language_id + "', `custom_field_id` = '" + custom_field_id + "', `name` = '" + this.db.escape(custom_field_value_description['name']) + "'");
				}
			}
		}
	}

	/**
	 * @param custom_field_id
	 *
	 * @return void
	 */
	async deleteCustomField(custom_field_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field` WHERE `custom_field_id` = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_description` WHERE `custom_field_id` = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_customer_group` WHERE `custom_field_id` = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value` WHERE `custom_field_id` = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value_description` WHERE `custom_field_id` = '" + custom_field_id + "'");
	}

	/**
	 * @param custom_field_id
	 *
	 * @return array
	 */
	async getCustomField(custom_field_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field` cf LEFT JOIN `" + DB_PREFIX + "custom_field_description` cfd ON (cf.`custom_field_id` = cfd.`custom_field_id`) WHERE cf.`custom_field_id` = '" + custom_field_id + "' AND cfd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCustomFields(data = {}) {
		if (empty(data['filter_customer_group_id'])) {
			let sql = "SELECT * FROM `" + DB_PREFIX + "custom_field` cf LEFT JOIN `" + DB_PREFIX + "custom_field_description` cfd ON (cf.`custom_field_id` = cfd.`custom_field_id`) WHERE cfd.`language_id` = '" + this.config.get('config_language_id') + "'";
		} else {
			let sql = "SELECT * FROM `" + DB_PREFIX + "custom_field_customer_group` cfcg LEFT JOIN `" + DB_PREFIX + "custom_field` cf ON (cfcg.`custom_field_id` = cf.`custom_field_id`) LEFT JOIN `" + DB_PREFIX + "custom_field_description` cfd ON (cf.`custom_field_id` = cfd.`custom_field_id`) WHERE cfd.`language_id` = '" + this.config.get('config_language_id') + "'";
		}

		if (data['filter_name']) {
			sql += " AND cfd.`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if (data['filter_status']) {
			sql += " AND cf.`status` = '" + data['filter_status'] + "'";
		}

		if ((data['filter_location'])) {
			sql += " AND cf.`location` = '" + this.db.escape(data['filter_location']) + "'";
		}

		if ((data['filter_customer_group_id'])) {
			sql += " AND cfcg.`customer_group_id` = '" + data['filter_customer_group_id'] + "'";
		}

		let sort_data = [
			'cfd.name',
			'cf.type',
			'cf.location',
			'cf.status',
			'cf.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY cfd.`name`";
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
	 * @param custom_field_id
	 *
	 * @return array
	 */
	async getDescriptions(custom_field_id) {
		custom_field_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_description` WHERE `custom_field_id` = '" + custom_field_id + "'");

		for (let result of query.rows) {
			custom_field_data[result['language_id']] = ['name' : result['name']];
		}

		return custom_field_data;
	}

	/**
	 * @param custom_field_value_id
	 *
	 * @return array
	 */
	async getValue(custom_field_value_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_value` cfv LEFT JOIN `" + DB_PREFIX + "custom_field_value_description` cfvd ON (cfv.`custom_field_value_id` = cfvd.`custom_field_value_id`) WHERE cfv.`custom_field_value_id` = '" + custom_field_value_id + "' AND cfvd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param custom_field_id
	 *
	 * @return array
	 */
	async getValues(custom_field_id) {
		custom_field_value_data = [];

		custom_field_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_value` cfv LEFT JOIN `" + DB_PREFIX + "custom_field_value_description` cfvd ON (cfv.`custom_field_value_id` = cfvd.`custom_field_value_id`) WHERE cfv.`custom_field_id` = '" + custom_field_id + "' AND cfvd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY cfv.`sort_order` ASC");

		for (custom_field_value_query.rows of custom_field_value) {
			custom_field_value_data[custom_field_value['custom_field_value_id']] = [
				'custom_field_value_id' : custom_field_value['custom_field_value_id'],
				'name'                  : custom_field_value['name']
			];
		}

		return custom_field_value_data;
	}

	/**
	 * @param custom_field_id
	 *
	 * @return array
	 */
	async getCustomerGroups(custom_field_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_customer_group` WHERE `custom_field_id` = '" + custom_field_id + "'");

		return query.rows;
	}

	/**
	 * @param custom_field_id
	 *
	 * @return array
	 */
	async getValueDescriptions(custom_field_id) {
		custom_field_value_data = [];

		custom_field_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_value` WHERE `custom_field_id` = '" + custom_field_id + "'");

		for (custom_field_value_query.rows of custom_field_value) {
			custom_field_value_description_data = [];

			custom_field_value_description_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_value_description` WHERE `custom_field_value_id` = '" + custom_field_value['custom_field_value_id'] + "'");

			for (custom_field_value_description_query.rows of custom_field_value_description) {
				custom_field_value_description_data[custom_field_value_description['language_id']] = ['name' : custom_field_value_description['name']];
			}

			custom_field_value_data[] = [
				'custom_field_value_id'          : custom_field_value['custom_field_value_id'],
				'custom_field_value_description' : custom_field_value_description_data,
				'sort_order'                     : custom_field_value['sort_order']
			];
		}

		return custom_field_value_data;
	}

	/**
	 * @return int
	 */
	async getTotalCustomFields() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "custom_field`");

		return query.row['total'];
	}
}
