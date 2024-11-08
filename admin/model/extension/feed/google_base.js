module.exports = class ModelExtensionFeedGoogleBase extends Model {
	async install() {
		await this.db.query("
			CREATE TABLE `" + DB_PREFIX + "google_base_category` (
				`google_base_category_id` INT(11) NOT NULL AUTO_INCREMENT,
				`name` varchar(255) NOT NULL,
				PRIMARY KEY (`google_base_category_id`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci;
		");

		await this.db.query("
			CREATE TABLE `" + DB_PREFIX + "google_base_category_to_category` (
				`google_base_category_id` INT(11) NOT NULL,
				`category_id` INT(11) NOT NULL,
				PRIMARY KEY (`google_base_category_id`, `category_id`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci;
		");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "google_base_category`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "google_base_category_to_category`");
	}

    async import {
        await this.db.query("DELETE FROM " + DB_PREFIX + "google_base_category");

        lines = explode("\n", string);

        for (lines of line) {
			if (substr(line, 0, 1) != '#') {
	            part = explode(' - ', line, 2);

	            if ((part[1])) {
	                await this.db.query("INSERT INTO " + DB_PREFIX + "google_base_category SET google_base_category_id = '" + part[0] + "', name = '" + this.db.escape(part[1]) + "'");
	            }
			}
        }
    }

    async getGoogleBaseCategories(data = {}) {
        sql = "SELECT * FROM `" + DB_PREFIX + "google_base_category` WHERE name LIKE '%" + this.db.escape(data['filter_name']) + "%' ORDER BY name ASC";

		if ((data['start']) || (data['limit'])) {
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

		const query = await this.db.query(sql);

		return query.rows;
    }

	async addCategory(data) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "google_base_category_to_category WHERE category_id = '" + data['category_id'] + "'");

		await this.db.query("INSERT INTO " + DB_PREFIX + "google_base_category_to_category SET google_base_category_id = '" + data['google_base_category_id'] + "', category_id = '" + data['category_id'] + "'");
	}

	async deleteCategory(category_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "google_base_category_to_category WHERE category_id = '" + category_id + "'");
	}

    async getCategories(data = {}) {
        sql = "SELECT google_base_category_id, (SELECT name FROM `" + DB_PREFIX + "google_base_category` gbc WHERE gbc.google_base_category_id = gbc2c.google_base_category_id) AS google_base_category, category_id, (SELECT name FROM `" + DB_PREFIX + "category_description` cd WHERE cd.category_id = gbc2c.category_id AND cd.language_id = '" + this.config.get('config_language_id') + "') AS category FROM `" + DB_PREFIX + "google_base_category_to_category` gbc2c ORDER BY google_base_category ASC";

		if ((data['start']) || (data['limit'])) {
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

		const query = await this.db.query(sql);

		return query.rows;
    }

	async getTotalCategories() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "google_base_category_to_category`");

		return query.row['total'];
    }
}
