module.exports = class ModelReportStatistics extends Model {
	async getStatistics() {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "statistics");

		return query.rows;
	}
	
	async getValue(code) {
		const query = await this.db.query("SELECT value FROM " + DB_PREFIX + "statistics WHERE `code` = '" + this.db.escape(code) + "'");

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return null;	
		}
	}
	
	async addValue(code, value) {
		await this.db.query("UPDATE " + DB_PREFIX + "statistics SET `value` = (`value` + '" + value + "') WHERE `code` = '" + this.db.escape(code) + "'");
	}
	
	async editValue(code, value) {
		await this.db.query("UPDATE " + DB_PREFIX + "statistics SET `value` = '" + value + "' WHERE `code` = '" + this.db.escape(code) + "'");
	}
		
	async removeValue(code, value) {
		await this.db.query("UPDATE " + DB_PREFIX + "statistics SET `value` = (`value` - '" + value + "') WHERE `code` = '" + this.db.escape(code) + "'");
	}	
}
