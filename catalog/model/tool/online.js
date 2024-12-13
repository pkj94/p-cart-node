module.exports = class ModelToolOnline extends Model {
	async addOnline(ip, customer_id, url, referer) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_online` WHERE date_added < '" + date('Y-m-d H:i:s', strtotime('-1 hour')) + "'");

		await this.db.query("REPLACE INTO `" + DB_PREFIX + "customer_online` SET `ip` = '" + this.db.escape(ip) + "', `customer_id` = '" + customer_id + "', `url` = '" + this.db.escape(url) + "', `referer` = '" + this.db.escape(referer) + "', `date_added` = '" + this.db.escape(date('Y-m-d H:i:s')) + "'");
	}
}
