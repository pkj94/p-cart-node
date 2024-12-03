module.exports = class ModelExtensionModulePayPalSmartButton extends Model {

	async install() {
		const query = await this.db.query("SELECT DISTINCT layout_id FROM " + DB_PREFIX + "layout_route WHERE route = 'product/product' OR route LIKE 'checkout/%'");

		const layouts = query.rows;

		for (let layout of layouts) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "layout_module SET layout_id = '" + layout['layout_id'] + "', code = 'paypal_smart_button', position = 'content_top', sort_order = '0'");
		}
	}
}