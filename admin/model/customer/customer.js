const sha1 = require("locutus/php/strings/sha1");

module.exports = class ModelCustomerCustomer extends Model {
	async addCustomer(data) {
		let salt = oc_token(9)
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer SET customer_group_id = '" + data['customer_group_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', custom_field = '" + this.db.escape((data['custom_field']) ? JSON.stringify(data['custom_field']) : JSON.stringify({})) + "', newsletter = '" + data['newsletter'] + "', salt = '" + this.db.escape(salt) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(data['password'])))) + "', status = '" + data['status'] + "', safe = '" + data['safe'] + "', date_added = NOW()");

		const customer_id = this.db.getLastId();

		if ((data['address'])) {
			for (let address of data['address']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "address SET customer_id = '" + customer_id + "', firstname = '" + this.db.escape(address['firstname']) + "', lastname = '" + this.db.escape(address['lastname']) + "', company = '" + this.db.escape(address['company']) + "', address_1 = '" + this.db.escape(address['address_1']) + "', address_2 = '" + this.db.escape(address['address_2']) + "', city = '" + this.db.escape(address['city']) + "', postcode = '" + this.db.escape(address['postcode']) + "', country_id = '" + address['country_id'] + "', zone_id = '" + address['zone_id'] + "', custom_field = '" + this.db.escape((address['custom_field']) ? JSON.stringify(address['custom_field']) : JSON.stringify({})) + "'");

				if ((address['default'])) {
					const address_id = this.db.getLastId();

					await this.db.query("UPDATE " + DB_PREFIX + "customer SET address_id = '" + address_id + "' WHERE customer_id = '" + customer_id + "'");
				}
			}
		}

		if (data['affiliate']) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "customer_affiliate SET customer_id = '" + customer_id + "', company = '" + this.db.escape(data['company']) + "', website = '" + this.db.escape(data['website']) + "', tracking = '" + this.db.escape(data['tracking']) + "', commission = '" + data['commission'] + "', tax = '" + this.db.escape(data['tax']) + "', payment = '" + this.db.escape(data['payment']) + "', cheque = '" + this.db.escape(data['cheque']) + "', paypal = '" + this.db.escape(data['paypal']) + "', bank_name = '" + this.db.escape(data['bank_name']) + "', bank_branch_number = '" + this.db.escape(data['bank_branch_number']) + "', bank_swift_code = '" + this.db.escape(data['bank_swift_code']) + "', bank_account_name = '" + this.db.escape(data['bank_account_name']) + "', bank_account_number = '" + this.db.escape(data['bank_account_number']) + "', custom_field = '" + this.db.escape((data['custom_field'] && data['custom_field']['affiliate']) ? JSON.stringify(data['custom_field']['affiliate']) : JSON.stringify({})) + "', status = '" + data['affiliate'] + "', date_added = NOW()");
		}

		return customer_id;
	}

	async editCustomer(customer_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "customer SET customer_group_id = '" + data['customer_group_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', custom_field = '" + this.db.escape((data['custom_field']) ? JSON.stringify(data['custom_field']) : JSON.stringify({})) + "', newsletter = '" + data['newsletter'] + "', status = '" + data['status'] + "', safe = '" + data['safe'] + "' WHERE customer_id = '" + customer_id + "'");

		if (data['password']) {
			await this.db.query("UPDATE " + DB_PREFIX + "customer SET salt = '" + this.db.escape(salt = oc_token(9)) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(data['password'])))) + "' WHERE customer_id = '" + customer_id + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "address WHERE customer_id = '" + customer_id + "'");

		if ((data['address'])) {
			for (let address of data['address']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "address SET address_id = '" + address['address_id'] + "', customer_id = '" + customer_id + "', firstname = '" + this.db.escape(address['firstname']) + "', lastname = '" + this.db.escape(address['lastname']) + "', company = '" + this.db.escape(address['company']) + "', address_1 = '" + this.db.escape(address['address_1']) + "', address_2 = '" + this.db.escape(address['address_2']) + "', city = '" + this.db.escape(address['city']) + "', postcode = '" + this.db.escape(address['postcode']) + "', country_id = '" + address['country_id'] + "', zone_id = '" + address['zone_id'] + "', custom_field = '" + this.db.escape((address['custom_field']) ? JSON.stringify(address['custom_field']) : JSON.stringify({})) + "'");

				if ((address['default'])) {
					const address_id = this.db.getLastId();

					await this.db.query("UPDATE " + DB_PREFIX + "customer SET address_id = '" + address_id + "' WHERE customer_id = '" + customer_id + "'");
				}
			}
		}

		if (data['affiliate']) {
			await this.db.query("REPLACE INTO " + DB_PREFIX + "customer_affiliate SET customer_id = '" + customer_id + "', company = '" + this.db.escape(data['company']) + "', website = '" + this.db.escape(data['website']) + "', tracking = '" + this.db.escape(data['tracking']) + "', commission = '" + data['commission'] + "', tax = '" + this.db.escape(data['tax']) + "', payment = '" + this.db.escape(data['payment']) + "', cheque = '" + this.db.escape(data['cheque']) + "', paypal = '" + this.db.escape(data['paypal']) + "', bank_name = '" + this.db.escape(data['bank_name']) + "', bank_branch_number = '" + this.db.escape(data['bank_branch_number']) + "', bank_swift_code = '" + this.db.escape(data['bank_swift_code']) + "', bank_account_name = '" + this.db.escape(data['bank_account_name']) + "', bank_account_number = '" + this.db.escape(data['bank_account_number']) + "', custom_field = '" + this.db.escape((data['custom_field'] && data['custom_field']['affiliate']) ? JSON.stringify(data['custom_field']['affiliate']) : JSON.stringify({})) + "', status = '" + data['affiliate'] + "', date_added = NOW()");
		}
	}

	async editToken(customer_id, token) {
		await this.db.query("UPDATE " + DB_PREFIX + "customer SET token = '" + this.db.escape(token) + "' WHERE customer_id = '" + customer_id + "'");
	}

	async deleteCustomer(customer_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_activity WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_affiliate WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_approval WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_history WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_reward WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_transaction WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_ip WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "address WHERE customer_id = '" + customer_id + "'");
	}

	async getCustomer(customer_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "customer WHERE customer_id = '" + customer_id + "'");

		return query.row;
	}

	async getCustomerByEmail(email) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "customer WHERE LCASE(email) = '" + this.db.escape(oc_strtolower(email)) + "'");

		return query.row;
	}

	async getCustomers(data = {}) {
		let sql = "SELECT *, CONCAT(c.firstname, ' ', c.lastname) AS name, cgd.name AS customer_group FROM " + DB_PREFIX + "customer c LEFT JOIN " + DB_PREFIX + "customer_group_description cgd ON (c.customer_group_id = cgd.customer_group_id)";

		if (data['filter_affiliate']) {
			sql += " LEFT JOIN " + DB_PREFIX + "customer_affiliate ca ON (c.customer_id = ca.customer_id)";
		}

		sql += " WHERE cgd.language_id = '" + this.config.get('config_language_id') + "'";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '%" + this.db.escape(data['filter_name']) + "%'");
		}

		if ((data['filter_email'])) {
			implode.push("c.email LIKE '" + this.db.escape(data['filter_email']) + "%'");
		}

		if ((data['filter_newsletter']) && !is_null(data['filter_newsletter'])) {
			implode.push("c.newsletter = '" + data['filter_newsletter'] + "'");
		}

		if ((data['filter_customer_group_id'])) {
			implode.push("c.customer_group_id = '" + data['filter_customer_group_id'] + "'");
		}

		if ((data['filter_affiliate'])) {
			implode.push("ca.status = '" + data['filter_affiliate'] + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("c.customer_id IN (SELECT customer_id FROM " + DB_PREFIX + "customer_ip WHERE ip = '" + this.db.escape(data['filter_ip']) + "')");
		}

		if ((data['filter_status']) && data['filter_status'] !== '') {
			implode.push("c.status = '" + data['filter_status'] + "'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(c.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if (implode.length) {
			sql += " AND " + implode.join(" AND ");
		}

		let sort_data = [
			'name',
			'c.email',
			'customer_group',
			'c.status',
			'c.ip',
			'c.date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY name";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getAddress(address_id) {
		const address_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "address WHERE address_id = '" + address_id + "'");

		if (address_query.num_rows) {
			const country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + address_query.row['country_id'] + "'");
			let country = '';
			let iso_code_2 = '';
			let iso_code_3 = '';
			let address_format = '';
			if (country_query.num_rows) {
				country = country_query.row['name'];
				iso_code_2 = country_query.row['iso_code_2'];
				iso_code_3 = country_query.row['iso_code_3'];
				address_format = country_query.row['address_format'];
			} else {
				country = '';
				iso_code_2 = '';
				iso_code_3 = '';
				address_format = '';
			}

			const zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + address_query.row['zone_id'] + "'");
			let zone = '';
			let zone_code = '';
			if (zone_query.num_rows) {
				zone = zone_query.row['name'];
				zone_code = zone_query.row['code'];
			} else {
				zone = '';
				zone_code = '';
			}

			return {
				'address_id': address_query.row['address_id'],
				'customer_id': address_query.row['customer_id'],
				'firstname': address_query.row['firstname'],
				'lastname': address_query.row['lastname'],
				'company': address_query.row['company'],
				'address_1': address_query.row['address_1'],
				'address_2': address_query.row['address_2'],
				'postcode': address_query.row['postcode'],
				'city': address_query.row['city'],
				'zone_id': address_query.row['zone_id'],
				'zone': zone,
				'zone_code': zone_code,
				'country_id': address_query.row['country_id'],
				'country': country,
				'iso_code_2': iso_code_2,
				'iso_code_3': iso_code_3,
				'address_format': address_format,
				'custom_field': JSON.parse(address_query.row['custom_field'])
			};
		}
	}

	async getAddresses(customer_id) {
		let address_data = {};

		const query = await this.db.query("SELECT address_id FROM " + DB_PREFIX + "address WHERE customer_id = '" + customer_id + "'");

		for (let result of query.rows) {
			const address_info = await this.getAddress(result['address_id']);

			if (address_info) {
				address_data[result['address_id']] = address_info;
			}
		}

		return address_data;
	}

	async getTotalCustomers(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer c";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("CONCAT(firstname, ' ', lastname) LIKE '%" + this.db.escape(data['filter_name']) + "%'");
		}

		if ((data['filter_email'])) {
			implode.push("email LIKE '" + this.db.escape(data['filter_email']) + "%'");
		}

		if ((data['filter_newsletter']) && !is_null(data['filter_newsletter'])) {
			implode.push("newsletter = '" + data['filter_newsletter'] + "'");
		}

		if ((data['filter_customer_group_id'])) {
			implode.push("customer_group_id = '" + data['filter_customer_group_id'] + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("customer_id IN (SELECT customer_id FROM " + DB_PREFIX + "customer_ip WHERE ip = '" + this.db.escape(data['filter_ip']) + "')");
		}

		if ((data['filter_status']) && data['filter_status'] !== '') {
			implode.push("status = '" + data['filter_status'] + "'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getAffiliateByTracking(tracking) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_affiliate WHERE tracking = '" + this.db.escape(tracking) + "'");

		return query.row;
	}

	async getAffiliate(customer_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_affiliate WHERE customer_id = '" + customer_id + "'");

		return query.row;
	}

	async getAffiliates(data = {}) {
		let sql = "SELECT DISTINCT *, CONCAT(c.firstname, ' ', c.lastname) AS name FROM " + DB_PREFIX + "customer_affiliate ca LEFT JOIN " + DB_PREFIX + "customer c ON (ca.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '%" + this.db.escape(data['filter_name']) + "%'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql + "ORDER BY name");

		return query.rows;
	}

	async getTotalAffiliates(data = {}) {
		let sql = "SELECT DISTINCT COUNT(*) AS total FROM " + DB_PREFIX + "customer_affiliate ca LEFT JOIN " + DB_PREFIX + "customer c ON (ca.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '%" + this.db.escape(data['filter_name']) + "%'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getTotalAddressesByCustomerId(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "address WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getTotalAddressesByCountryId(country_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "address WHERE country_id = '" + country_id + "'");

		return query.row['total'];
	}

	async getTotalAddressesByZoneId(zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "address WHERE zone_id = '" + zone_id + "'");

		return query.row['total'];
	}

	async getTotalCustomersByCustomerGroupId(customer_group_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer WHERE customer_group_id = '" + customer_group_id + "'");

		return query.row['total'];
	}

	async addHistory(customer_id, comment) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer_history SET customer_id = '" + customer_id + "', comment = '" + this.db.escape(strip_tags(comment)) + "', date_added = NOW()");
	}

	async getHistories(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT comment, date_added FROM " + DB_PREFIX + "customer_history WHERE customer_id = '" + customer_id + "' ORDER BY date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalHistories(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_history WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async addTransaction(customer_id, description = '', amount = '', order_id = 0) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer_transaction SET customer_id = '" + customer_id + "', order_id = '" + order_id + "', description = '" + this.db.escape(description) + "', amount = '" + amount + "', date_added = NOW()");
	}

	async deleteTransactionByOrderId(order_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_transaction WHERE order_id = '" + order_id + "'");
	}

	async getTransactions(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_transaction WHERE customer_id = '" + customer_id + "' ORDER BY date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalTransactions(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total  FROM " + DB_PREFIX + "customer_transaction WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getTransactionTotal(customer_id) {
		const query = await this.db.query("SELECT SUM(amount) AS total FROM " + DB_PREFIX + "customer_transaction WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getTotalTransactionsByOrderId(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_transaction WHERE order_id = '" + order_id + "'");

		return query.row['total'];
	}

	async addReward(customer_id, description = '', points = '', order_id = 0) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "customer_reward SET customer_id = '" + customer_id + "', order_id = '" + order_id + "', points = '" + points + "', description = '" + this.db.escape(description) + "', date_added = NOW()");
	}

	async deleteReward(order_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_reward WHERE order_id = '" + order_id + "' AND points > 0");
	}

	async getRewards(customer_id, start = 0, limit = 10) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_reward WHERE customer_id = '" + customer_id + "' ORDER BY date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalRewards(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_reward WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getRewardTotal(customer_id) {
		const query = await this.db.query("SELECT SUM(points) AS total FROM " + DB_PREFIX + "customer_reward WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getTotalCustomerRewardsByOrderId(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_reward WHERE order_id = '" + order_id + "' AND points > 0");

		return query.row['total'];
	}

	async getIps(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}
		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_ip WHERE customer_id = '" + customer_id + "' ORDER BY date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalIps(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_ip WHERE customer_id = '" + customer_id + "'");

		return query.row['total'];
	}

	async getTotalCustomersByIp(ip) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_ip WHERE ip = '" + this.db.escape(ip) + "'");

		return query.row['total'];
	}

	async getTotalLoginAttempts(email) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_login` WHERE `email` = '" + this.db.escape(email) + "'");

		return query.row;
	}

	async deleteLoginAttempts(email) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_login` WHERE `email` = '" + this.db.escape(email) + "'");
	}
}
