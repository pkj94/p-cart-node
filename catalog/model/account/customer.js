const sha1 = require("locutus/php/strings/sha1");

module.exports = class ModelAccountCustomer extends Model {
	async addCustomer(data) {
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((data['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && this.config.get('config_customer_group_display').includes(data['customer_group_id'])) {
			customer_group_id = data['customer_group_id'];
		}

		this.load.model('account/customer_group', this);

		const customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);
		let salt = oc_token(9)
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer SET customer_group_id = '" + customer_group_id + "', store_id = '" + this.config.get('config_store_id') + "', language_id = '" + this.config.get('config_language_id') + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', custom_field = '" + this.db.escape((data['custom_field'] && data['custom_field']['account']) ? JSON.stringify(data['custom_field']['account']) : '') + "', salt = '" + this.db.escape(salt) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(data['password'])))) + "', newsletter = '" + ((data['newsletter']) ? data['newsletter'] : 0) + "', ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
			this.request.server.connection ? (this.request.server.connection.remoteAddress ||
				this.request.server.socket.remoteAddress ||
				this.request.server.connection.socket.remoteAddress) : '')) + "', status = '" + (customer_group_info['approval'] ? 0 : 1) + "', date_added = NOW()");

		const customer_id = this.db.getLastId();
		if (customer_group_info['approval']) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_approval` SET customer_id = '" + customer_id + "', type = 'customer', date_added = NOW()");
		}

		return customer_id;
	}

	async editCustomer(customer_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "customer SET firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', custom_field = '" + this.db.escape((data['custom_field'] ? data['custom_field']['account'] : '') ? JSON.stringify(data['custom_field']['account']) : '') + "' WHERE customer_id = '" + customer_id + "'");
	}

	async editPassword(email, password) {
		let salt = oc_token(9)
		await this.db.query("UPDATE " + DB_PREFIX + "customer SET salt = '" + this.db.escape(salt) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(password)))) + "', code = '' WHERE LOWER(email) = '" + this.db.escape(utf8_strtolower(email)) + "'");
	}

	async editAddressId(customer_id, address_id) {
		await this.db.query("UPDATE " + DB_PREFIX + "customer SET address_id = '" + address_id + "' WHERE customer_id = '" + customer_id + "'");
	}

	async editCode(email, code) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET code = '" + this.db.escape(code) + "' WHERE LCASE(email) = '" + this.db.escape(utf8_strtolower(email)) + "'");
	}

	async editNewsletter(newsletter) {
		await this.db.query("UPDATE " + DB_PREFIX + "customer SET newsletter = '" + newsletter + "' WHERE customer_id = '" + await this.customer.getId() + "'");
	}

	async getCustomer(customer_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer WHERE customer_id = '" + customer_id + "'");

		return query.row;
	}

	async getCustomerByEmail(email) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer WHERE LOWER(email) = '" + this.db.escape(utf8_strtolower(email)) + "'");

		return query.row;
	}

	async getCustomerByCode(code) {
		const query = await this.db.query("SELECT customer_id, firstname, lastname, email FROM `" + DB_PREFIX + "customer` WHERE code = '" + this.db.escape(code) + "' AND code != ''");

		return query.row;
	}

	async getCustomerByToken(token) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer WHERE token = '" + this.db.escape(token) + "' AND token != ''");

		await this.db.query("UPDATE " + DB_PREFIX + "customer SET token = ''");

		return query.row;
	}

	async getTotalCustomersByEmail(email) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer WHERE LOWER(email) = '" + this.db.escape(utf8_strtolower(email)) + "'");

		return query.row['total'];
	}

	async addTransaction(customer_id, description, amount = '', order_id = 0) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer_transaction SET customer_id = '" + customer_id + "', order_id = '" + order_id + "', description = '" + this.db.escape(description) + "', amount = '" + amount + "', date_added = NOW()");
	}

	async deleteTransactionByOrderId(order_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_transaction WHERE order_id = '" + order_id + "'");
	}

	async getTransactionTotal(customer_id) {
		const query = await this.db.query("SELECT SUM(amount) AS total FROM " + DB_PREFIX + "customer_transaction WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getTotalTransactionsByOrderId(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_transaction WHERE order_id = '" + order_id + "'");

		return query.row['total'];
	}

	async getRewardTotal(customer_id) {
		const query = await this.db.query("SELECT SUM(points) AS total FROM " + DB_PREFIX + "customer_reward WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getIps(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_ip` WHERE customer_id = '" + customer_id + "'");

		return query.rows;
	}

	async addLoginAttempt(email) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_login WHERE email = '" + this.db.escape(utf8_strtolower(email)) + "'");

		if (!query.num_rows) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "customer_login SET email = '" + this.db.escape(utf8_strtolower(email)) + "', ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : '')) + "', total = 1, date_added = '" + this.db.escape(date('Y-m-d H:i:s')) + "', date_modified = '" + this.db.escape(date('Y-m-d H:i:s')) + "'");
		} else {
			await this.db.query("UPDATE " + DB_PREFIX + "customer_login SET total = (total + 1), date_modified = '" + this.db.escape(date('Y-m-d H:i:s')) + "' WHERE customer_login_id = '" + query.row['customer_login_id'] + "'");
		}
	}

	async getLoginAttempts(email) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_login` WHERE email = '" + this.db.escape(utf8_strtolower(email)) + "'");

		return query.row;
	}

	async deleteLoginAttempts(email) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_login` WHERE email = '" + this.db.escape(utf8_strtolower(email)) + "'");
	}

	async addAffiliate(customer_id, data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer_affiliate SET `customer_id` = '" + customer_id + "', `company` = '" + this.db.escape(data['company']) + "', `website` = '" + this.db.escape(data['website']) + "', `tracking` = '" + this.db.escape(token(64)) + "', `commission` = '" + this.config.get('config_affiliate_commission') + "', `tax` = '" + this.db.escape(data['tax']) + "', `payment` = '" + this.db.escape(data['payment']) + "', `cheque` = '" + this.db.escape(data['cheque']) + "', `paypal` = '" + this.db.escape(data['paypal']) + "', `bank_name` = '" + this.db.escape(data['bank_name']) + "', `bank_branch_number` = '" + this.db.escape(data['bank_branch_number']) + "', `bank_swift_code` = '" + this.db.escape(data['bank_swift_code']) + "', `bank_account_name` = '" + this.db.escape(data['bank_account_name']) + "', `bank_account_number` = '" + this.db.escape(data['bank_account_number']) + "', custom_field = '" + this.db.escape((data['custom_field']['affiliate']) ? JSON.stringify(data['custom_field']['affiliate']) : JSON.stringify([])) + "', `status` = '" + !this.config.get('config_affiliate_approval') + "'");

		if (Number(this.config.get('config_affiliate_approval'))) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_approval` SET customer_id = '" + customer_id + "', type = 'affiliate', date_added = NOW()");
		}
	}

	async editAffiliate(customer_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "customer_affiliate SET `company` = '" + this.db.escape(data['company']) + "', `website` = '" + this.db.escape(data['website']) + "', `commission` = '" + this.config.get('config_affiliate_commission') + "', `tax` = '" + this.db.escape(data['tax']) + "', `payment` = '" + this.db.escape(data['payment']) + "', `cheque` = '" + this.db.escape(data['cheque']) + "', `paypal` = '" + this.db.escape(data['paypal']) + "', `bank_name` = '" + this.db.escape(data['bank_name']) + "', `bank_branch_number` = '" + this.db.escape(data['bank_branch_number']) + "', `bank_swift_code` = '" + this.db.escape(data['bank_swift_code']) + "', `bank_account_name` = '" + this.db.escape(data['bank_account_name']) + "', `bank_account_number` = '" + this.db.escape(data['bank_account_number']) + "', custom_field = '" + this.db.escape((data['custom_field']['affiliate']) ? JSON.stringify(data['custom_field']['affiliate']) : JSON.stringify([])) + "' WHERE `customer_id` = '" + customer_id + "'");
	}

	async getAffiliate(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_affiliate` WHERE `customer_id` = '" + customer_id + "'");

		return query.row;
	}

	async getAffiliateByTracking(tracking) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_affiliate` WHERE `tracking` = '" + this.db.escape(tracking) + "'");

		return query.row;
	}
}
