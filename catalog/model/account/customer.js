module.exports = class Customer extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCustomer(data) {
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((data['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && in_array(data['customer_group_id'], this.config.get('config_customer_group_display'))) {
			customer_group_id = data['customer_group_id'];
		}

		this.load.model('account/customer_group', this);

		const customer_group_info = await this.registry.get('model_account_customer_group').getCustomerGroup(customer_group_id);

		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer` SET `customer_group_id` = '" + customer_group_id + "', `store_id` = '" + this.config.get('config_store_id') + "', `language_id` = '" + this.config.get('config_language_id') + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `custom_field` = " + this.db.escape((data['custom_field']) ? JSON.stringify(data['custom_field']) : '') + ", `password` = " + this.db.escape(await password_hash(html_entity_decode(data['password']))) + ", `newsletter` = '" + ((data['newsletter']) ? data['newsletter'] : 0) + "', `ip` = " + this.db.escape((this.request.server.headers['x-forwarded-for'] ||
			this.request.server.connection.remoteAddress ||
			this.request.server.socket.remoteAddress ||
			this.request.server.connection.socket.remoteAddress)) + ", `status` = '" + !customer_group_info['approval'] + "', `date_added` = NOW()");

		const customer_id = this.db.getLastId();

		if (customer_group_info['approval']) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_approval` SET `customer_id` = '" + customer_id + "', `type` = 'customer', `date_added` = NOW()");
		}

		return customer_id;
	}

	/**
	 * @param   customer_id
	 * @param data
	 *
	 * @return void
	 */
	async editCustomer(customer_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `custom_field` = " + this.db.escape((data['custom_field']) ? JSON.stringify(data['custom_field']) : '') + " WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param string email
	 * @param string password
	 *
	 * @return void
	 */
	async editPassword(email, password) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `password` = " + this.db.escape(await password_hash(html_entity_decode(password))) + ", `code` = '' WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)));
	}

	/**
	 * @param string email
	 * @param string code
	 *
	 * @return void
	 */
	async editCode(email, code) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `code` = " + this.db.escape(code) + " WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)));
	}

	/**
	 * @param string email
	 * @param string token
	 *
	 * @return void
	 */
	async editToken(email, token) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `token` = " + this.db.escape(token) + " WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)));
	}

	/**
	 * @param newsletter
	 *
	 * @return void
	 */
	async editNewsletter(newsletter) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `newsletter` = '" + newsletter + "' WHERE `customer_id` = '" + await this.customer.getId() + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return void
	 */
	async deleteCustomer(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_activity` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_affiliate` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_affiliate_report` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_history` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_transaction` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_wishlist` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_ip` WHERE `customer_id` = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "address` WHERE `customer_id` = '" + customer_id + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getCustomer(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer` WHERE `customer_id` = '" + customer_id + "'");

		return query.row;
	}

	/**
	 * @param string email
	 *
	 * @return array
	 */
	async getCustomerByEmail(email) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)));

		return query.row;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getCustomerByCode(code) {
		const query = await this.db.query("SELECT `customer_id`, `firstname`, `lastname`, `email` FROM `" + DB_PREFIX + "customer` WHERE `code` = " + this.db.escape(code) + " AND `code` != ''");

		return query.row;
	}

	/**
	 * @param string token
	 *
	 * @return array
	 */
	async getCustomerByToken(token) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer` WHERE `token` = " + this.db.escape(token) + " AND `token` != ''");

		if (query.num_rows) {
			await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `token` = '' WHERE `customer_id` = '" + query.row['customer_id'] + "'");
		}

		return query.row;
	}

	/**
	 * @param string email
	 *
	 * @return int
	 */
	async getTotalCustomersByEmail(email) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)) + "");

		return query.row['total'];
	}

	/**
	 * @param    customer_id
	 * @param string description
	 * @param  amount
	 * @param    order_id
	 *
	 * @return void
	 */
	async addTransaction(customer_id, description, amount = 0, order_id = 0) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_transaction` SET `customer_id` = '" + customer_id + "', `order_id` = '" + order_id + "', `description` = " + this.db.escape(description) + ", `amount` = '" + amount + "', `date_added` = NOW()");
	}

	/**
	 * @param order_id
	 *
	 * @return void
	 */
	async deleteTransactionByOrderId(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_transaction` WHERE `order_id` = '" + order_id + "'");
	}

	/**
	 * @param customer_id
	 *
	 * @return float
	 */
	async getTransactionTotal(customer_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "customer_transaction` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalTransactionsByOrderId(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_transaction` WHERE `order_id` = '" + order_id + "'");

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getRewardTotal(customer_id) {
		const query = await this.db.query("SELECT SUM(`points`) AS `total` FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getIps(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_ip` WHERE `customer_id` = '" + customer_id + "'");

		return query.rows;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalIps(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_ip` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param    customer_id
	 * @param string ip
	 * @param string country
	 *
	 * @return void
	 */
	async addLogin(customer_id, ip, country = '') {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_ip` SET `customer_id` = '" + customer_id + "', `store_id` = '" + this.config.get('config_store_id') + "', `ip` = " + this.db.escape(ip) + ", `country` = " + this.db.escape(country) + ", `date_added` = NOW()");
	}

	/**
	 * @param string email
	 *
	 * @return void
	 */
	async addLoginAttempt(email) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_login` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)) + " AND `ip` = " + this.db.escape((this.request.server.headers['x-forwarded-for'] ||
			this.request.server.connection.remoteAddress ||
			this.request.server.socket.remoteAddress ||
			this.request.server.connection.socket.remoteAddress)) + "");

		if (!query.num_rows) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_login` SET `email` = " + this.db.escape(oc_strtolower(email)) + ", `ip` = " + this.db.escape((this.request.server.headers['x-forwarded-for'] ||
				this.request.server.connection.remoteAddress ||
				this.request.server.socket.remoteAddress ||
				this.request.server.connection.socket.remoteAddress)) + ", `total` = '1', `date_added` = " + this.db.escape(date('Y-m-d H:i:s')) + ", `date_modified` = " + this.db.escape(date('Y-m-d H:i:s')) + "");
		} else {
			await this.db.query("UPDATE `" + DB_PREFIX + "customer_login` SET `total` = (`total` + 1), `date_modified` = " + this.db.escape(date('Y-m-d H:i:s')) + " WHERE `customer_login_id` = '" + query.row['customer_login_id'] + "'");
		}
	}

	/**
	 * @param string email
	 *
	 * @return array
	 */
	async getLoginAttempts(email) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_login` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)) + "");

		return query.row;
	}

	/**
	 * @param string email
	 *
	 * @return void
	 */
	async deleteLoginAttempts(email) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_login` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)) + "");
	}
}
