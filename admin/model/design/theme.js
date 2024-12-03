module.exports = class ModelDesignTheme extends Model {
	async editTheme(store_id, theme, route, code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "theme` WHERE store_id = '" + store_id + "' AND theme = '" + this.db.escape(theme) + "' AND route = '" + this.db.escape(route) + "'");
		
		await this.db.query("INSERT INTO `" + DB_PREFIX + "theme` SET store_id = '" + store_id + "', theme = '" + this.db.escape(theme) + "', route = '" + this.db.escape(route) + "', code = " + this.db.escapeDb(code) + ", date_added = NOW()");
	}

	async deleteTheme(theme_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "theme` WHERE theme_id = '" + theme_id + "'");
	}

	async getTheme(store_id, theme, route) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "theme` WHERE store_id = '" + store_id + "' AND theme = '" + this.db.escape(theme) + "' AND route = '" + this.db.escape(route) + "'");

		return query.row;
	}
	
	async getThemes(start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}		
		
		const query = await this.db.query("SELECT *, (SELECT name FROM `" + DB_PREFIX + "store` s WHERE s.store_id = t.store_id) AS store FROM `" + DB_PREFIX + "theme` t ORDER BY t.date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}	
	
	async getTotalThemes() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "theme`");

		return query.row['total'];
	}	
}