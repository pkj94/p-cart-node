module.exports = class ModelAccountActivity extends Model {
	async addActivity(key, data) {
		let customer_id = 0;
		if ((data['customer_id'])) {
			customer_id = data['customer_id'];
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_activity` SET `customer_id` = '" + customer_id + "', `key` = '" + this.db.escape(key) + "', `data` = '" + this.db.escape(JSON.stringify(data)) + "', `ip` = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
			this.request.server.connection ? (this.request.server.connection.remoteAddress ||
				this.request.server.socket.remoteAddress ||
				this.request.server.connection.socket.remoteAddress) : '')) + "', `date_added` = NOW()");
	}
}