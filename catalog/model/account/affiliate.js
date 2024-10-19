module.exports =class AffiliateModel extends Model {
	/**
	 * @param   customer_id
	 * @param data
	 *
	 * @return void
	 */
	async addAffiliate(customer_id, data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_affiliate` SET `customer_id` = '" + customer_id + "', `company` = " + this.db.escape(data['company']) + ", `website` = " + this.db.escape(data['website']) + ", `tracking` = " + this.db.escape(oc_token(10)) + ", `commission` = '" + this.config.get('config_affiliate_commission') + "', `tax` = " + this.db.escape(data['tax']) + ", `payment_method` = " + this.db.escape(data['payment_method']) + ", `cheque` = " + this.db.escape(data['cheque']) + ", `paypal` = " + this.db.escape(data['paypal']) + ", `bank_name` = " + this.db.escape(data['bank_name']) + ", `bank_branch_number` = " + this.db.escape(data['bank_branch_number']) + ", `bank_swift_code` = " + this.db.escape(data['bank_swift_code']) + ", `bank_account_name` = " + this.db.escape(data['bank_account_name']) + ", `bank_account_number` = " + this.db.escape(data['bank_account_number']) + ", custom_field = " + this.db.escape((data['custom_field']) ? json_encode(data['custom_field']) : '') + ", `status` = '" + !this.config.get('config_affiliate_approval') + "', `date_added` = NOW()");

		if (this.config.get('config_affiliate_approval')) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_approval` SET `customer_id` = '" + customer_id + "', `type` = 'affiliate', `date_added` = NOW()");
		}
	}

	/**
	 * @param   customer_id
	 * @param data
	 *
	 * @return void
	 */
	async editAffiliate(customer_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer_affiliate` SET `company` = " + this.db.escape(data['company']) + ", `website` = " + this.db.escape(data['website']) + ", `commission` = '" + this.config.get('config_affiliate_commission') + "', `tax` = " + this.db.escape(data['tax']) + ", `payment_method` = " + this.db.escape(data['payment_method']) + ", `cheque` = " + this.db.escape(data['cheque']) + ", `paypal` = " + this.db.escape(data['paypal']) + ", `bank_name` = " + this.db.escape(data['bank_name']) + ", `bank_branch_number` = " + this.db.escape(data['bank_branch_number']) + ", `bank_swift_code` = " + this.db.escape(data['bank_swift_code']) + ", `bank_account_name` = " + this.db.escape(data['bank_account_name']) + ", `bank_account_number` = " + this.db.escape(data['bank_account_number']) + ", custom_field = " + this.db.escape((data['custom_field']) ? json_encode(data['custom_field']) : '') + " WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getAffiliate(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_affiliate` WHERE `customer_id` = '" + customer_id + "'");

		return query.row;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getAffiliateByTracking(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_affiliate` WHERE `tracking` = " + this.db.escape(code) );

		return query.row;
	}

	/**
	 * @param    customer_id
	 * @param string ip
	 * @param string country
	 *
	 * @return void
	 */
	async addReport(customer_id, ip, country = '') {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_affiliate_report` SET `customer_id` = '" + customer_id + "', `store_id` = '" + this.config.get('config_store_id') + "', `ip` = " + this.db.escape(ip) + ", `country` = " + this.db.escape(country) + ", `date_added` = NOW()");
	}
}
