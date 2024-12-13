module.exports = class ModelSettingEvent extends Model {
	async getEvents() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "event` WHERE `trigger` LIKE 'catalog/%' AND status = '1' ORDER BY `sort_order` ASC");

		return query.rows;
	}
}