<?php
namespace Opencart\Admin\Model\Cms;
/**
 * Class Topic
 *
 * @package Opencart\Admin\Model\Cms
 */
class TopicModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return topic
	 */
	async addTopic(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "topic` SET `sort_order` = '" + data['sort_order'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "'");

		topic_id = this.db.getLastId();

		for (data['topic_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "topic_description` SET `topic_id` = '" + topic_id + "', `language_id` = '" + language_id + "', `image` = '" + this.db.escape(value['image']) + "', `name` = " + this.db.escape(value['name']) + ", `description` = " + this.db.escape(value['description']) + ", `meta_title` = " + this.db.escape(value['meta_title']) + ", `meta_description` = " + this.db.escape(value['meta_description']) + ", `meta_keyword` = " + this.db.escape(value['meta_keyword']) + "");
		}

		if ((data['topic_store'])) {
			for (data['topic_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "topic_to_store` SET `topic_id` = '" + topic_id + "', `store_id` = '" + store_id + "'");
			}
		}

		for (data['topic_seo_url'] of store_id : language) {
			for (let [language_id , keyword] of language ) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'topic_id', `value`= '" + topic_id + "', `keyword` = " + this.db.escape(keyword) + "");
			}
		}

		this.cache.delete('topic');

		return topic_id;
	}

	/**
	 * @param   topic_id
	 * @param data
	 *
	 * @return void
	 */
	async editTopic(topic_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "topic` SET `sort_order` = '" + data['sort_order'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `topic_id` = '" + topic_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "topic_description` WHERE `topic_id` = '" + topic_id + "'");

		for (data['topic_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "topic_description` SET `topic_id` = '" + topic_id + "', `language_id` = '" + language_id + "', `image` = '" + this.db.escape(value['image']) + "', `name` = " + this.db.escape(value['name']) + ", `description` = " + this.db.escape(value['description']) + ", `meta_title` = " + this.db.escape(value['meta_title']) + ", `meta_description` = " + this.db.escape(value['meta_description']) + ", `meta_keyword` = " + this.db.escape(value['meta_keyword']) + "");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "topic_to_store` WHERE `topic_id` = '" + topic_id + "'");

		if ((data['topic_store'])) {
			for (data['topic_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "topic_to_store` SET `topic_id` = '" + topic_id + "', `store_id` = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'topic_id' AND `value` = '" + topic_id + "'");

		for (data['topic_seo_url'] of store_id : language) {
			for (let [language_id , keyword] of language ) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'topic_id', `value` = '" + topic_id + "', `keyword` = " + this.db.escape(keyword) + "");
			}
		}

		this.cache.delete('topic');
	}

	/**
	 * @param topic_id
	 *
	 * @return void
	 */
	async deleteTopic(topic_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "topic` WHERE `topic_id` = '" + topic_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "topic_description` WHERE `topic_id` = '" + topic_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "topic_to_store` WHERE `topic_id` = '" + topic_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'topic_id' AND `value` = '" + topic_id + "'");

		this.cache.delete('topic');
	}

	/**
	 * @param topic_id
	 *
	 * @return array
	 */
	async getTopic(topic_id) {
		let sql = "SELECT DISTINCT * FROM `" + DB_PREFIX + "topic` `t` LEFT JOIN `" + DB_PREFIX + "topic_description` `td` ON (`t`.`topic_id` = `td`.`topic_id`) WHERE `t`.`topic_id` = '" + topic_id + "' AND `td`.`language_id` = '" + this.config.get('config_language_id') + "'";

		topic_data = await this.cache.get('topic.'. crypto.createHash('md5').update(sql).digest('hex'));

		if (!topic_data) {
			let query = await this.db.query(sql);

			topic_data = query.row;

			this.cache.set('topic.'. crypto.createHash('md5').update(sql).digest('hex'), topic_data);
		}

		return topic_data;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getTopics(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "topic` `t` LEFT JOIN `" + DB_PREFIX + "topic_description` `td` ON (`t`.`topic_id` = `td`.`topic_id`) WHERE `td`.`language_id` = '" + this.config.get('config_language_id') + "'";

		let sort_data = [
			'td.name',
			't.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `t`.`sort_order`";
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

		topic_data = await this.cache.get('topic.'. crypto.createHash('md5').update(sql).digest('hex'));

		if (!topic_data) {
			let query = await this.db.query(sql);

			topic_data = query.rows;

			this.cache.set('topic.'. crypto.createHash('md5').update(sql).digest('hex'), topic_data);
		}

		return topic_data;
	}

	/**
	 * @param topic_id
	 *
	 * @return array
	 */
	async getDescriptions(topic_id) {
		topic_description_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "topic_description` WHERE `topic_id` = '" + topic_id + "'");

		for (let result of query.rows) {
			topic_description_data[result['language_id']] = [
				'image'            : result['image'],
				'name'             : result['name'],
				'description'      : result['description'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword']
			];
		}

		return topic_description_data;
	}

	/**
	 * @param topic_id
	 *
	 * @return array
	 */
	async getSeoUrls(topic_id) {
		topic_seo_url_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'topic_id' AND `value` = '" + topic_id + "'");

		for (let result of query.rows) {
			topic_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return topic_seo_url_data;
	}

	/**
	 * @param topic_id
	 *
	 * @return array
	 */
	async getStores(topic_id) {
		topic_store_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "topic_to_store` WHERE `topic_id` = '" + topic_id + "'");

		for (let result of query.rows) {
			topic_store_data[] = result['store_id'];
		}

		return topic_store_data;
	}

	/**
	 * @return int
	 */
	async getTotalTopics() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "topic`");

		return query.row['total'];
	}
}
