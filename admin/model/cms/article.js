<?php
namespace Opencart\Admin\Model\Cms;
/**
 * Class Article
 *
 * @package Opencart\Admin\Model\Cms
 */
class ArticleModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addArticle(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "article` SET `topic_id` = '" + data['topic_id'] + "', `author` = '" + this.db.escape(data['author']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_added` = NOW(), `date_modified` = NOW()");

		article_id = this.db.getLastId();

		for (data['article_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "article_description` SET `article_id` = '" + article_id + "', `language_id` = '" + language_id + "', `image` = '" + this.db.escape(value['image']) + "', `name` = " + this.db.escape(value['name']) + ", `description` = " + this.db.escape(value['description']) + ", `tag` = " + this.db.escape(value['tag']) + ", `meta_title` = " + this.db.escape(value['meta_title']) + ", `meta_description` = " + this.db.escape(value['meta_description']) + ", `meta_keyword` = " + this.db.escape(value['meta_keyword']) + "");
		}

		if ((data['article_store'])) {
			for (data['article_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "article_to_store` SET `article_id` = '" + article_id + "', `store_id` = '" + store_id + "'");
			}
		}

		for (data['article_seo_url'] of store_id : language) {
			for (let [language_id , keyword] of language ) {
				language_id = language_id.split('-')[1];
				await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'article_id', `value`= '" + article_id + "', `keyword` = " + this.db.escape(keyword) + "");
			}
		}

		// Set which layout to use with this article
		if ((data['article_layout'])) {
			for (data['article_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "article_to_layout` SET `article_id` = '" + article_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		await this.cache.delete('article');

		return article_id;
	}

	/**
	 * @param   article_id
	 * @param data
	 *
	 * @return void
	 */
	async editArticle(article_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "article` SET `topic_id` = '" + data['topic_id'] + "', `author` = '" + this.db.escape(data['author']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_modified` = NOW() WHERE `article_id` = '" + article_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_description` WHERE `article_id` = '" + article_id + "'");

		for (data['article_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "article_description` SET `article_id` = '" + article_id + "', `language_id` = '" + language_id + "', `image` = '" + this.db.escape(value['image']) + "', `name` = " + this.db.escape(value['name']) + ", `description` = " + this.db.escape(value['description']) + ", `tag` = " + this.db.escape(value['tag']) + ", `meta_title` = " + this.db.escape(value['meta_title']) + ", `meta_description` = " + this.db.escape(value['meta_description']) + ", `meta_keyword` = " + this.db.escape(value['meta_keyword']) + "");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_to_store` WHERE `article_id` = '" + article_id + "'");

		if ((data['article_store'])) {
			for (data['article_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "article_to_store` SET `article_id` = '" + article_id + "', `store_id` = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'article_id' AND `value` = '" + article_id + "'");

		for (data['article_seo_url'] of store_id : language) {
			for (let [language_id , keyword] of language ) {
				language_id = language_id.split('-')[1];
				await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'article_id', `value` = '" + article_id + "', `keyword` = " + this.db.escape(keyword) + "");
			}
		}

		// Layouts
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_to_layout` WHERE `article_id` = '" + article_id + "'");

		if ((data['article_layout'])) {
			for (data['article_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "article_to_layout` SET `article_id` = '" + article_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		await this.cache.delete('article');
	}

	/**
	 * @param article_id
	 *
	 * @return void
	 */
	async deleteArticle(article_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article` WHERE `article_id` = '" + article_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_comment` WHERE `article_id` = '" + article_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_description` WHERE `article_id` = '" + article_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_to_store` WHERE `article_id` = '" + article_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_to_layout` WHERE `article_id` = '" + article_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'article_id' AND `value` = '" + article_id + "'");

		await this.cache.delete('article');
	}

	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getArticle(article_id) {
		let sql = "SELECT DISTINCT * FROM `" + DB_PREFIX + "article` `a` LEFT JOIN `" + DB_PREFIX + "article_description` `ad` ON (`a`.`article_id` = `ad`.`article_id`) WHERE `a`.`article_id` = '" + article_id + "' AND `ad`.`language_id` = '" + this.config.get('config_language_id') + "'";

		article_data = await this.cache.get('article.'. md5(sql));

		if (!article_data) {
			let query = await this.db.query(sql);

			article_data = query.row;

			await this.cache.set('article.'. md5(sql), article_data);
		}

		return article_data;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getArticles(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "article` `a` LEFT JOIN `" + DB_PREFIX + "article_description` `ad` ON (`a`.`article_id` = `ad`.`article_id`) WHERE `ad`.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND `ad`.`name` LIKE " + this.db.escape(data['filter_name']) + "";
		}

		let sort_data = [
			'ad.name',
			'a.date_added'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `a`.`date_added`";
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

		article_data = await this.cache.get('article.'. md5(sql));

		if (!article_data) {
			let query = await this.db.query(sql);

			article_data = query.rows;

			await this.cache.set('article.'. md5(sql), article_data);
		}

		return article_data;
	}

	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getDescriptions(article_id) {
		article_description_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "article_description` WHERE `article_id` = '" + article_id + "'");

		for (let result of query.rows) {
			article_description_data[result['language_id']] = [
				'image'            : result['image'],
				'name'             : result['name'],
				'description'      : result['description'],
				'tag'              : result['tag'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword']
			];
		}

		return article_description_data;
	}

	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getSeoUrls(article_id) {
		article_seo_url_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'article_id' AND `value` = '" + article_id + "'");

		for (let result of query.rows) {
			article_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return article_seo_url_data;
	}

	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getStores(article_id) {
		article_store_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "article_to_store` WHERE `article_id` = '" + article_id + "'");

		for (let result of query.rows) {
			article_store_data[] = result['store_id'];
		}

		return article_store_data;
	}

	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getLayouts(article_id) {
		article_layout_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "article_to_layout` WHERE `article_id` = '" + article_id + "'");

		for (let result of query.rows) {
			article_layout_data[result['store_id']] = result['layout_id'];
		}

		return article_layout_data;
	}

	/**
	 * @return int
	 */
	async getTotalArticles() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "article`");

		return query.row['total'];
	}

	/**
	 * @param layout_id
	 *
	 * @return int
	 */
	async getTotalArticlesByLayoutId(layout_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "article_to_layout` WHERE `layout_id` = '" + layout_id + "'");

		return query.row['total'];
	}

	/**
	 * @param article_comment_id
	 *
	 * @return void
	 */
	async deleteComment(article_comment_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_comment` WHERE `article_comment_id` = '" + article_comment_id + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async deleteCommentsByCustomerId(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "article_comment` WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param article_comment_id
	 *
	 * @return array
	 */
	async getComment(article_comment_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "article_comment` WHERE `article_comment_id` = '" + article_comment_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getComments(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "article_comment`";

		let implode = [];

		if ((data['filter_keyword'])) {
			implode.push("LCASE(`comment`) LIKE '" + this.db.escape('%' + data['filter_keyword'] + '%') + "'";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		sql += " ORDER BY `date_added` DESC";

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
	 * @param data
	 *
	 * @return int
	 */
	async getTotalComments(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "article_comment`";

		let implode = [];

		if ((data['filter_keyword'])) {
			implode.push("LCASE(`comment`) LIKE '" + this.db.escape('%' + data['filter_keyword'] + '%') + "'";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
