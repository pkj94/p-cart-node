<?php
namespace Opencart\Admin\Model\Design;
/**
 *  Class Banner
 *
 * @package Opencart\Admin\Model\Design
 */
class BannerModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addBanner(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "banner` SET `name` = '" + this.db.escape(data['name']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "'");

		banner_id = this.db.getLastId();

		if ((data['banner_image'])) {
			for (data['banner_image'] of language_id : value) {
				for (value of banner_image) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "banner_image` SET `banner_id` = '" + banner_id + "', `language_id` = '" + language_id + "', `title` = '" +  this.db.escape(banner_image['title']) + "', `link` = '" +  this.db.escape(banner_image['link']) + "', `image` = '" +  this.db.escape(banner_image['image']) + "', `sort_order` = '" +  banner_image['sort_order'] + "'");
				}
			}
		}

		return banner_id;
	}

	/**
	 * @param   banner_id
	 * @param data
	 *
	 * @return void
	 */
	async editBanner(banner_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "banner` SET `name` = '" + this.db.escape(data['name']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `banner_id` = '" + banner_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "banner_image` WHERE `banner_id` = '" + banner_id + "'");

		if ((data['banner_image'])) {
			for (data['banner_image'] of language_id : value) {
				for (value of banner_image) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "banner_image` SET `banner_id` = '" + banner_id + "', `language_id` = '" + language_id + "', `title` = '" +  this.db.escape(banner_image['title']) + "', `link` = '" +  this.db.escape(banner_image['link']) + "', `image` = '" +  this.db.escape(banner_image['image']) + "', `sort_order` = '" + banner_image['sort_order'] + "'");
				}
			}
		}
	}

	/**
	 * @param banner_id
	 *
	 * @return void
	 */
	async deleteBanner(banner_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "banner` WHERE `banner_id` = '" + banner_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "banner_image` WHERE `banner_id` = '" + banner_id + "'");
	}

	/**
	 * @param banner_id
	 *
	 * @return array
	 */
	async getBanner(banner_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "banner` WHERE `banner_id` = '" + banner_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getBanners(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "banner`";

		let sort_data = [
			'name',
			'status'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
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
	 * @param banner_id
	 *
	 * @return array
	 */
	async getImages(banner_id) {
		banner_image_data = [];

		banner_image_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "banner_image` WHERE `banner_id` = '" + banner_id + "' ORDER BY `sort_order` ASC");

		for (banner_image_query.rows of banner_image) {
			banner_image_data[banner_image['language_id']][] = [
				'title'      : banner_image['title'],
				'link'       : banner_image['link'],
				'image'      : banner_image['image'],
				'sort_order' : banner_image['sort_order']
			];
		}

		return banner_image_data;
	}

	/**
	 * @return int
	 */
	async getTotalBanners() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "banner`");

		return query.row['total'];
	}
}
