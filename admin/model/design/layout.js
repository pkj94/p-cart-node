module.exports = class ModelDesignLayout extends Model {
	async addLayout(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "layout SET name = '" + this.db.escape(data['name']) + "'");

		const layout_id = this.db.getLastId();

		if ((data['layout_route'])) {
			for (let layout_route of data['layout_route']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "layout_route SET layout_id = '" + layout_id + "', store_id = '" + layout_route['store_id'] + "', route = '" + this.db.escape(layout_route['route']) + "'");
			}
		}

		if ((data['layout_module'])) {
			for (let [key, layout_module] of Object.entries(data['layout_module'])) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "layout_module SET layout_id = '" + layout_id + "', code = '" + this.db.escape(layout_module['code']) + "', position = '" + this.db.escape(layout_module['position']) + "', sort_order = '" + layout_module['sort_order'] + "'");
			}
		}

		return layout_id;
	}

	async editLayout(layout_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "layout SET name = '" + this.db.escape(data['name']) + "' WHERE layout_id = '" + layout_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "layout_route WHERE layout_id = '" + layout_id + "'");

		if ((data['layout_route'])) {
			for (let layout_route of data['layout_route']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "layout_route SET layout_id = '" + layout_id + "', store_id = '" + layout_route['store_id'] + "', route = '" + this.db.escape(layout_route['route']) + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "layout_module WHERE layout_id = '" + layout_id + "'");

		if ((data['layout_module'])) {
			for (let [key, layout_module] of Object.entries(data['layout_module'])) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "layout_module SET layout_id = '" + layout_id + "', code = '" + this.db.escape(layout_module['code']) + "', position = '" + this.db.escape(layout_module['position']) + "', sort_order = '" + layout_module['sort_order'] + "'");
			}
		}
	}

	async deleteLayout(layout_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "layout WHERE layout_id = '" + layout_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "layout_route WHERE layout_id = '" + layout_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "layout_module WHERE layout_id = '" + layout_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_to_layout WHERE layout_id = '" + layout_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_layout WHERE layout_id = '" + layout_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "information_to_layout WHERE layout_id = '" + layout_id + "'");
	}

	async getLayout(layout_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "layout WHERE layout_id = '" + layout_id + "'");

		return query.row;
	}

	async getLayouts(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "layout";

		let sort_data = ['name'];

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

	async getLayoutRoutes(layout_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "layout_route WHERE layout_id = '" + layout_id + "'");

		return query.rows;
	}

	async getLayoutModules(layout_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "layout_module WHERE layout_id = '" + layout_id + "' ORDER BY position ASC, sort_order ASC");

		return query.rows;
	}

	async getTotalLayouts() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "layout");

		return query.row['total'];
	}
}