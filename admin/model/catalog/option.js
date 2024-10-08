<?php
namespace Opencart\Admin\Model\Catalog;
/**
 * Class Option
 *
 * @package Opencart\Admin\Model\Catalog
 */
class OptionModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addOption(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "option` SET `type` = '" + this.db.escape(data['type']) + "', `sort_order` = '" + data['sort_order'] + "'");

		option_id = this.db.getLastId();

		for (data['option_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "option_description` SET `option_id` = '" + option_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		if ((data['option_value'])) {
			for (data['option_value'] of option_value) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "option_value` SET `option_id` = '" + option_id + "', `image` = '" + this.db.escape(html_entity_decode(option_value['image'])) + "', `sort_order` = '" + option_value['sort_order'] + "'");

				option_value_id = this.db.getLastId();

				for (option_value['option_value_description'] of language_id : option_value_description) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "option_value_description` SET `option_value_id` = '" + option_value_id + "', `language_id` = '" + language_id + "', `option_id` = '" + option_id + "', `name` = '" + this.db.escape(option_value_description['name']) + "'");
				}
			}
		}

		return option_id;
	}

	/**
	 * @param   option_id
	 * @param data
	 *
	 * @return void
	 */
	async editOption(option_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "option` SET `type` = '" + this.db.escape(data['type']) + "', `sort_order` = '" + data['sort_order'] + "' WHERE `option_id` = '" + option_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "option_description` WHERE `option_id` = '" + option_id + "'");

		for (data['option_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "option_description` SET `option_id` = '" + option_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "option_value` WHERE `option_id` = '" + option_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "option_value_description` WHERE `option_id` = '" + option_id + "'");

		if ((data['option_value'])) {
			for (data['option_value'] of option_value) {
				if (option_value['option_value_id']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "option_value` SET `option_value_id` = '" + option_value['option_value_id'] + "', `option_id` = '" + option_id + "', `image` = '" + this.db.escape(html_entity_decode(option_value['image'])) + "', `sort_order` = '" + option_value['sort_order'] + "'");
				} else {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "option_value` SET `option_id` = '" + option_id + "', `image` = '" + this.db.escape(html_entity_decode(option_value['image'])) + "', `sort_order` = '" + option_value['sort_order'] + "'");
				}

				option_value_id = this.db.getLastId();

				for (option_value['option_value_description'] of language_id : option_value_description) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "option_value_description` SET `option_value_id` = '" + option_value_id + "', `language_id` = '" + language_id + "', `option_id` = '" + option_id + "', `name` = '" + this.db.escape(option_value_description['name']) + "'");
				}
			}
		}
	}

	/**
	 * @param option_id
	 *
	 * @return void
	 */
	async deleteOption(option_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "option` WHERE `option_id` = '" + option_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "option_description` WHERE `option_id` = '" + option_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "option_value` WHERE `option_id` = '" + option_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "option_value_description` WHERE `option_id` = '" + option_id + "'");
	}

	/**
	 * @param option_id
	 *
	 * @return array
	 */
	async getOption(option_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option` o LEFT JOIN `" + DB_PREFIX + "option_description` od ON (o.`option_id` = od.`option_id`) WHERE o.`option_id` = '" + option_id + "' AND od.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getOptions(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "option` o LEFT JOIN `" + DB_PREFIX + "option_description` od ON (o.`option_id` = od.`option_id`) WHERE od.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND od.`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		let sort_data = [
			'od.name',
			'o.type',
			'o.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `od`.`name`";
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
	 * @param option_id
	 *
	 * @return array
	 */
	async getDescriptions(option_id) {
		option_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_description` WHERE `option_id` = '" + option_id + "'");

		for (let result of query.rows) {
			option_data[result['language_id']] = ['name' : result['name']];
		}

		return option_data;
	}

	/**
	 * @param option_value_id
	 *
	 * @return array
	 */
	async getValue(option_value_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_value` ov LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (ov.`option_value_id` = ovd.`option_value_id`) WHERE ov.`option_value_id` = '" + option_value_id + "' AND ovd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param option_id
	 *
	 * @return array
	 */
	async getValues(option_id) {
		option_value_data = [];

		option_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_value` ov LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (ov.`option_value_id` = ovd.`option_value_id`) WHERE ov.`option_id` = '" + option_id + "' AND ovd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY ov.`sort_order`, ovd.`name`");

		for (option_value_query.rows of option_value) {
			option_value_data[] = [
				'option_value_id' : option_value['option_value_id'],
				'name'            : option_value['name'],
				'image'           : option_value['image'],
				'sort_order'      : option_value['sort_order']
			];
		}

		return option_value_data;
	}

	/**
	 * @param option_id
	 *
	 * @return array
	 */
	async getValueDescriptions(option_id) {
		option_value_data = [];

		option_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_value` WHERE `option_id` = '" + option_id + "' ORDER BY `sort_order`");

		for (option_value_query.rows of option_value) {
			option_value_description_data = [];

			option_value_description_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_value_description` WHERE `option_value_id` = '" + option_value['option_value_id'] + "'");

			for (option_value_description_query.rows of option_value_description) {
				option_value_description_data[option_value_description['language_id']] = ['name' : option_value_description['name']];
			}

			option_value_data[] = [
				'option_value_id'          : option_value['option_value_id'],
				'option_value_description' : option_value_description_data,
				'image'                    : option_value['image'],
				'sort_order'               : option_value['sort_order']
			];
		}

		return option_value_data;
	}

	/**
	 * @return int
	 */
	async getTotalOptions() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "option`");

		return query.row['total'];
	}
}