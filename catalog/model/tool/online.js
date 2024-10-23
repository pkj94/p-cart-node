module.exports = class Online extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param string ip
	 * @param    customer_id
	 * @param string url
	 * @param string referer
	 *
	 * @return void
	 */
	async addOnline(ip, customer_id, url, referer) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_online` WHERE `date_added` < '" + date('Y-m-d H:i:s', new Date('-' + this.config.get('config_customer_online_expire') + ' hour')) + "'");

		await this.db.query("REPLACE INTO `" + DB_PREFIX + "customer_online` SET `ip` = " + this.db.escape(ip) + ", `customer_id` = '" + customer_id + "', `url` = " + this.db.escape(url) + ", `referer` = " + this.db.escape(referer) + ", `date_added` = " + this.db.escape(date('Y-m-d H:i:s')));
	}
}
