module.exports = class ModelDesignBanner extends Model {
	async addBanner(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "banner SET name = '" + this.db.escape(data['name']) + "', status = '" + data['status'] + "'");

		const banner_id = this.db.getLastId();

		if ((data['banner_image'])) {
			for (let [language_id, value] of Object.entries(data['banner_image'])) {
				for (let [banner_image_id,banner_image] of Object.entries(value)) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "banner_image SET banner_id = '" + banner_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(banner_image['title']) + "', link = '" + this.db.escape(banner_image['link']) + "', image = '" + this.db.escape(banner_image['image']) + "', sort_order = '" + banner_image['sort_order'] + "'");
				}
			}
		}

		return banner_id;
	}

	async editBanner(banner_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "banner SET name = '" + this.db.escape(data['name']) + "', status = '" + data['status'] + "' WHERE banner_id = '" + banner_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "banner_image WHERE banner_id = '" + banner_id + "'");

		if ((data['banner_image'])) {
			for (let [language_id, value] of Object.entries(data['banner_image'])) {
				for (let [banner_image_id, banner_image] of Object.entries(value)) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "banner_image SET banner_id = '" + banner_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(banner_image['title']) + "', link = '" + this.db.escape(banner_image['link']) + "', image = '" + this.db.escape(banner_image['image']) + "', sort_order = '" + banner_image['sort_order'] + "'");
				}
			}
		}
	}

	async deleteBanner(banner_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "banner WHERE banner_id = '" + banner_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "banner_image WHERE banner_id = '" + banner_id + "'");
	}

	async getBanner(banner_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "banner WHERE banner_id = '" + banner_id + "'");

		return query.row;
	}

	async getBanners(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "banner";

		let sort_data = [
			'name',
			'status'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY name";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
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

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getBannerImages(banner_id) {
		const banner_image_data = {};

		const banner_image_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "banner_image WHERE banner_id = '" + banner_id + "' ORDER BY sort_order ASC");

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

	async getTotalBanners() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "banner");

		return query.row['total'];
	}
}
