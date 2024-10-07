<?php
namespace Opencart\Admin\Model\Catalog;
/**
 * Class Attribute Group
 *
 * @package Opencart\Admin\Model\Catalog
 */
class AttributeGroupModel  extends Model {
	constructor(registry){
		super(registry)
	}
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addAttributeGroup(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_group` SET `sort_order` = '" + data['sort_order'] + "'");

		attribute_group_id = this.db.getLastId();

		for (data['attribute_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_group_description` SET `attribute_group_id` = '" + attribute_group_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		return attribute_group_id;
	}

	/**
	 * @param   attribute_group_id
	 * @param data
	 *
	 * @return void
	 */
	async editAttributeGroup(attribute_group_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "attribute_group` SET `sort_order` = '" + data['sort_order'] + "' WHERE `attribute_group_id` = '" + attribute_group_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_group_description` WHERE `attribute_group_id` = '" + attribute_group_id + "'");

		for (data['attribute_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_group_description` SET `attribute_group_id` = '" + attribute_group_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}
	}

	/**
	 * @param attribute_group_id
	 *
	 * @return void
	 */
	async deleteAttributeGroup(attribute_group_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_group` WHERE `attribute_group_id` = '" + attribute_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_group_description` WHERE `attribute_group_id` = '" + attribute_group_id + "'");
	}

	/**
	 * @param attribute_group_id
	 *
	 * @return array
	 */
	async getAttributeGroup(attribute_group_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "attribute_group` WHERE `attribute_group_id` = '" + attribute_group_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getAttributeGroups(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "attribute_group` ag LEFT JOIN `" + DB_PREFIX + "attribute_group_description` agd ON (ag.`attribute_group_id` = agd.`attribute_group_id`) WHERE agd.`language_id` = '" + this.config.get('config_language_id') + "'";

		let sort_data = ['agd.name', 'ag.sort_order'];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY agd.`name`";
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
	 * @param attribute_group_id
	 *
	 * @return array
	 */
	async getDescriptions(attribute_group_id) {
		attribute_group_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "attribute_group_description` WHERE `attribute_group_id` = '" + attribute_group_id + "'");

		for (query.rows of result) {
			attribute_group_data[result['language_id']] = ['name' : result['name']];
		}

		return attribute_group_data;
	}

	/**
	 * @return int
	 */
	async getTotalAttributeGroups() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "attribute_group`");

		return query.row['total'];
	}
}
