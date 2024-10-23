module.exports = class Activity extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param string key
	 * @param  data
	 *
	 * @return void
	 */
	async addActivity(key, data) {
		if ((data['customer_id'])) {
			const customer_id = data['customer_id'];
		} else {
			const customer_id = 0;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_activity` SET `customer_id` = '" + customer_id + "', `key` = " + this.db.escape(key) + ", `data` = " + this.db.escape(json_encode(data)) + ", `ip` = " + this.db.escape((this.request.server.headers['x-forwarded-for'] ||
					this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress)) + ", `date_added` = NOW()");
	}
}