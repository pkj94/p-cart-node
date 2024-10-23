module.exports = class BannerModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addBanner(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "banner` SET `name` = " + this.db.escape(data['name']) + ", `status` = '" + (data['status'] ? data['status'] : 0) + "'");

		const banner_id = this.db.getLastId();

		if ((data['banner_image'])) {
			for (let [language_id, value] of Object.entries(data['banner_image'])) {
				language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
				for (let banner_image of value) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "banner_image` SET `banner_id` = '" + banner_id + "', `language_id` = '" + language_id + "', `title` = " + this.db.escape(banner_image['title']) + ", `link` = " + this.db.escape(banner_image['link']) + ", `image` = " + this.db.escape(decodeURIComponent(banner_image['image'])) + ", `sort_order` = '" + banner_image['sort_order'] + "'");
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
		await this.db.query("UPDATE `" + DB_PREFIX + "banner` SET `name` = " + this.db.escape(data['name']) + ", `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `banner_id` = '" + banner_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "banner_image` WHERE `banner_id` = '" + banner_id + "'");

		if ((data['banner_image'])) {
			for (let [language_id, value] of Object.entries(data['banner_image'])) {
				language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
				for (let banner_image of value) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "banner_image` SET `banner_id` = '" + banner_id + "', `language_id` = '" + language_id + "', `title` = " + this.db.escape(banner_image['title']) + ", `link` = " + this.db.escape(banner_image['link']) + ", `image` = " + this.db.escape(decodeURIComponent(banner_image['image'])) + ", `sort_order` = '" + banner_image['sort_order'] + "'");
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
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
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
		let banner_image_data = {};

		const banner_image_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "banner_image` WHERE `banner_id` = '" + banner_id + "' ORDER BY `sort_order` ASC");

		for (let banner_image of banner_image_query.rows) {
			banner_image_data[banner_image['language_id']] = banner_image_data[banner_image['language_id']] || [];
			banner_image_data[banner_image['language_id']].push({
				'title': banner_image['title'],
				'link': banner_image['link'],
				'image': banner_image['image'],
				'sort_order': banner_image['sort_order']
			});
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
