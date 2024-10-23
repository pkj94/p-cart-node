module.exports = class LayoutDesignModel  extends global['\Opencart\System\Engine\Model'] {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addLayout(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "layout` SET `name` = " + this.db.escape(data['name']) );

		let layout_id = this.db.getLastId();

		if ((data['layout_route'])) {
			for (let layout_route of data['layout_route']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "layout_route` SET `layout_id` = '" + layout_id + "', `store_id` = '" + layout_route['store_id'] + "', `route` = " + this.db.escape(layout_route['route']));
			}
		}

		if ((data['layout_module'])) {
			for (let layout_module of data['layout_module']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "layout_module` SET `layout_id` = '" + layout_id + "', `code` = " + this.db.escape(layout_module['code']) + ", `position` = " + this.db.escape(layout_module['position']) + ", `sort_order` = '" + layout_module['sort_order'] + "'");
			}
		}

		return layout_id;
	}

	/**
	 * @param   layout_id
	 * @param data
	 *
	 * @return void
	 */
	async editLayout(layout_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "layout` SET `name` = " + this.db.escape(data['name']) + " WHERE `layout_id` = '" + layout_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_route` WHERE `layout_id` = '" + layout_id + "'");

		if ((data['layout_route'])) {
			for (let layout_route of data['layout_route']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "layout_route` SET `layout_id` = '" + layout_id + "', `store_id` = '" + layout_route['store_id'] + "', `route` = " + this.db.escape(layout_route['route']));
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_module` WHERE `layout_id` = '" + layout_id + "'");

		if ((data['layout_module'])) {
			for (let layout_module of data['layout_module']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "layout_module` SET `layout_id` = '" + layout_id + "', `code` = " + this.db.escape(layout_module['code']) + ", `position` = " + this.db.escape(layout_module['position']) + ", `sort_order` = '" + layout_module['sort_order'] + "'");
			}
		}
	}

	/**
	 * @param layout_id
	 *
	 * @return void
	 */
	async deleteLayout(layout_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_route` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_module` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_layout` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_layout` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_layout` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "blog_to_layout` WHERE `layout_id` = '" + layout_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "blog_category_to_layout` WHERE `layout_id` = '" + layout_id + "'");
	}

	/**
	 * @param layout_id
	 *
	 * @return array
	 */
	async getLayout(layout_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "layout` WHERE `layout_id` = '" + layout_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getLayouts(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "layout`";

		let sort_data = ['name'];

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
	 * @param layout_id
	 *
	 * @return array
	 */
	async getRoutes(layout_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "layout_route` WHERE `layout_id` = '" + layout_id + "'");

		return query.rows;
	}

	/**
	 * @param layout_id
	 *
	 * @return array
	 */
	async getModules(layout_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "layout_module` WHERE `layout_id` = '" + layout_id + "' ORDER BY `position` ASC, `sort_order` ASC");

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalLayouts() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "layout`");

		return query.row['total'];
	}
}
