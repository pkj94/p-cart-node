<?php
namespace Opencart\Catalog\Model\Cms;
/**
 *
 *
 * @package Opencart\Catalog\Model\Cms
 */
class ArticleController extends Model {
	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getArticle(article_id) {
		const sql = "SELECT DISTINCT * FROM `" + DB_PREFIX + "article` `a` LEFT JOIN `" + DB_PREFIX + "article_description` `ad` ON (`a`.`article_id` = `ad`.`article_id`) LEFT JOIN `" + DB_PREFIX + "article_to_store` `a2s` ON (`a`.`article_id` = `a2s`.`article_id`) WHERE `a`.`article_id` = '" + article_id + "' AND `ad`.`language_id` = '" + this.config.get('config_language_id') + "' AND `a2s`.`store_id` = '" + this.config.get('config_store_id') + "'";

		article_data = await this.cache.get('article+'+ md5(sql));

		if (!article_data) {
			const query = await this.db.query(sql);

			article_data = query.row;

			await this.cache.set('article+'+ md5(sql), article_data);
		}

		return article_data;
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getArticles(data = {}) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "article` `a` LEFT JOIN `" + DB_PREFIX + "article_description` `ad` ON (`a`.`article_id` = `ad`.`article_id`) LEFT JOIN `" + DB_PREFIX + "article_to_store` `a2s` ON (`a`.`article_id` = `a2s`.`article_id`) WHERE `ad`.`language_id` = '" + this.config.get('config_language_id') + "' AND `a2s`.`store_id` = '" + this.config.get('config_store_id') + "'";

		if ((data['filter_search'])) {
			sql += " AND (";

			implode = [];

			words = explode(' ', trim(preg_replace('/\s+/', ' ', data['filter_search'])));

			for (let word of words) {
				implode.push("`bd`.`name` LIKE '" + this.db.escape('%' + word + '%') + "'";
			}

			if (implode) {
				sql += " (" + implode.join(" OR ") + ")";
			}

			sql += " OR `bd`.`description` LIKE '" + this.db.escape('%' + data['filter_search'] + '%') + "'";

			implode = [];

			for (let word of words) {
				implode.push("`bd`.`tag` LIKE '" + this.db.escape('%' + word + '%') + "'";
			}

			if (implode) {
				sql += " OR (" + implode.join(" OR ") + ")";
			}

			sql += ")";
		}

		if ((data['filter_topic_id'])) {
			sql += " AND `a`.`topic_id` = '" + data['filter_topic_id'] + "'";
		}

		if ((data['filter_author'])) {
			sql += " AND `a`.`author` = '" + data['filter_author'] + "'";
		}

		sql += " ORDER BY `a`.`date_added` DESC";

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		article_data = await this.cache.get('article+'+ md5(sql));

		if (!article_data) {
			const query = await this.db.query(sql);

			article_data = query.rows;

			await this.cache.set('article+'+ md5(sql), article_data);
		}

		return article_data;
	}

	/**
	 * @return int
	 */
	async getTotalArticles() {
		const sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "article` `a` LEFT JOIN `" + DB_PREFIX + "article_description` `ad` ON (`a`.`article_id` = `ad`.`article_id`) LEFT JOIN `" + DB_PREFIX + "article_to_store` `a2s` ON (`a`.`article_id` = `a2s`.`article_id`) WHERE `ad`.`language_id` = '" + this.config.get('config_language_id') + "' AND `a2s`.`store_id` = '" + this.config.get('config_store_id') + "'";

		if ((data['filter_search'])) {
			sql += " AND (";

			implode = [];

			words = explode(' ', trim(preg_replace('/\s+/', ' ', data['filter_search'])));

			for (let word of words) {
				implode.push("`ad`.`name` LIKE '" + this.db.escape('%' + word + '%') + "'";
			}

			if (implode) {
				sql += " (" + implode.join(" OR ") + ")";
			}

			sql += " OR `ad`.`description` LIKE '" + this.db.escape('%' + data['filter_search'] + '%') + "'";

			implode = [];

			for (let word of words) {
				implode.push("`ad`.`tag` LIKE '" + this.db.escape('%' + word + '%') + "'";
			}

			if (implode) {
				sql += " OR (" + implode.join(" OR ") + ")";
			}

			sql += ")";
		}

		if ((data['filter_topic_id'])) {
			sql += " AND `a`.`topic_id` = '" + data['filter_topic_id'] + "'";
		}

		if ((data['filter_author'])) {
			sql += " AND `a`.`author` = '" + data['filter_author'] + "'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param article_id
	 *
	 * @return array
	 */
	async getLayoutId(article_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "article_to_layout` WHERE `article_id` = '" + article_id + "' AND `store_id` = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}

	/**
	 * @param   product_id
	 * @param array data
	 *
	 * @return int
	 */
	async addComment(article_id, array data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "article_comment` SET `article_id` = '" + article_id + "', `customer_id` = '" + await this.customer.getId() + "', `author` = '" + this.db.escape(data['author']) + "', `comment` = '" + this.db.escape(data['comment']) + "', `status` = '" + (data['status']) + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getComments(article_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			let limit = 10;
		}

		const sql = "SELECT * FROM `" + DB_PREFIX + "article_comment` WHERE `article_id` = '" + article_id + "' AND `status` = '1' ORDER BY `date_added` DESC LIMIT " + start + "," + limit;

		comment_data = await this.cache.get('comment+'+ md5(sql));

		if (!comment_data) {
			const query = await this.db.query(sql);

			comment_data = query.rows;

			await this.cache.set('comment+'+ md5(sql), comment_data);
		}

		return comment_data;
	}

	/**
	 * @param array data
	 *
	 * @return int
	 */
	async getTotalComments(article_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "article_comment` WHERE `article_id` = '" + article_id + "' AND `status` = '1'");

		return query.row['total'];
	}
}
