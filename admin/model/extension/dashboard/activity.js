module.exports = class ModelExtensionDashboardActivity extends Model {
	async getActivities() {
		const query = await this.db.query("SELECT `key`, `data`, `date_added` FROM `" + DB_PREFIX + "customer_activity` ORDER BY `date_added` DESC LIMIT 0,5");

		return query.rows;
	}
}