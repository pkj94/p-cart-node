module.exports = class ModelDesignLayout extends Model {
	async getLayout(route) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "layout_route WHERE '" + this.db.escape(route) + "' LIKE route AND store_id = '" + this.config.get('config_store_id') + "' ORDER BY route DESC LIMIT 1");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}
	
	async getLayoutModules(layout_id, position) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "layout_module WHERE layout_id = '" + layout_id + "' AND position = '" + this.db.escape(position) + "' ORDER BY sort_order");
		
		return query.rows;
	}
}