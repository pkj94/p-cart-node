module.exports = class Online extends global['OpencartSystemEngineModel'] {
	/**
	 * @param string ip
	 * @param    customer_id
	 * @param string url
	 * @param string referer
	 *
	 * @return void
	 */
	async addOnline(ip, customer_id, url, referer) {
		// PHP: strtotime('-' . config_customer_online_expire . ' hour')
		const expire = parseInt(this.config.get('config_customer_online_expire')) || 1;
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_online` WHERE `date_added` < " + this.db.escape(date('Y-m-d H:i:s', new Date(Date.now() - (expire * 3600000)))));

		await this.db.query("REPLACE INTO `" + DB_PREFIX + "customer_online` SET `ip` = " + this.db.escape(ip) + ", `customer_id` = '" + (parseInt(customer_id) || 0) + "', `url` = " + this.db.escape(url) + ", `referer` = " + this.db.escape(referer) + ", `date_added` = " + this.db.escape(date('Y-m-d H:i:s')));
	}
}
