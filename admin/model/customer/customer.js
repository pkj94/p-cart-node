module.exports = class CustomerCustomerModel extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCustomer(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer` SET `store_id` = '" + data['store_id'] + "', `customer_group_id` = '" + data['customer_group_id'] + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `custom_field` = '" + this.db.escape(data['custom_field'] ? JSON.stringify(data['custom_field']) : JSON.stringify({})) + "', `newsletter` = '" + (data['newsletter'] ? data['newsletter'] : 0) + "', `password` = " + this.db.escape(password_hash(data['password'])) + ", `status` = '" + (data['status'] ? data['status'] : 0) + "', `safe` = '" + (data['safe'] ? data['safe'] : 0) + "', `date_added` = NOW()");

		let customer_id = this.db.getLastId();

		if (data['address']) {
			for (let address of data['address']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "address` SET `customer_id` = '" + customer_id + "', `firstname` = '" + this.db.escape(address['firstname']) + "', `lastname` = '" + this.db.escape(address['lastname']) + "', `company` = '" + this.db.escape(address['company']) + "', `address_1` = '" + this.db.escape(address['address_1']) + "', `address_2` = '" + this.db.escape(address['address_2']) + "', `city` = '" + this.db.escape(address['city']) + "', `postcode` = '" + this.db.escape(address['postcode']) + "', `country_id` = '" + address['country_id'] + "', `zone_id` = '" + address['zone_id'] + "', `custom_field` = '" + this.db.escape(address['custom_field'] ? JSON.stringify(address['custom_field']) : JSON.stringify({})) + "', `default` = '" + (address['default'] ? address['default'] : 0) + "'");
			}
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
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `store_id` = '" + data['store_id'] + "', `customer_group_id` = '" + data['customer_group_id'] + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `custom_field` = '" + this.db.escape(data['custom_field'] ? JSON.stringify(data['custom_field']) : JSON.stringify({})) + "', `newsletter` = '" + (data['newsletter'] ? data['newsletter'] : 0) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `safe` = '" + (data['safe'] ? data['safe'] : 0) + "' WHERE `customer_id` = '" + customer_id + "'");

		if (data['password']) {
			await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `password` = " + this.db.escape(password_hash(data['password'])) + " WHERE `customer_id` = '" + customer_id + "'");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "address` WHERE `customer_id` = '" + customer_id + "'");

		if (data['address']) {
			for (let address of data['address']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "address` SET `address_id` = '" + address['address_id'] + "', `customer_id` = '" + customer_id + "', `firstname` = '" + this.db.escape(address['firstname']) + "', `lastname` = '" + this.db.escape(address['lastname']) + "', `company` = '" + this.db.escape(address['company']) + "', `address_1` = '" + this.db.escape(address['address_1']) + "', `address_2` = '" + this.db.escape(address['address_2']) + "', `city` = '" + this.db.escape(address['city']) + "', `postcode` = '" + this.db.escape(address['postcode']) + "', `country_id` = '" + address['country_id'] + "', `zone_id` = '" + address['zone_id'] + "', `custom_field` = '" + this.db.escape(address['custom_field'] ? JSON.stringify(address['custom_field']) : JSON.stringify({})) + "', `default` = '" + (address['default'] ? address['default'] : 0) + "'");
			}
		}
	}

	/**
	 * @param    customer_id
	 * @param token
	 *
	 * @return void
	 */
	async editToken(customer_id, token) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `token` = " + this.db.escape(token) + " WHERE `customer_id` = '" + customer_id + "'");
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
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "customer` WHERE `customer_id` = '" + customer_id + "'");

		return query.row;
	}

	/**
	 * @param email
	 *
	 * @return array
	 */
	async getCustomerByEmail(email) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "customer` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)) + "");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCustomers(data = {}) {
		let sql = "SELECT *, CONCAT(c.`firstname`, ' ', c.`lastname`) AS `name`, cgd.`name` AS `customer_group` FROM `" + DB_PREFIX + "customer` c LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (c.`customer_group_id` = cgd.`customer_group_id`)";

		sql += " WHERE cgd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE " + this.db.escape('%' + data['filter_name'] + '%');
		}

		if ((data['filter_email'])) {
			sql += " AND c.`email` LIKE " + this.db.escape(data['filter_email'] + '%');
		}

		if (data['filter_newsletter'] && data['filter_newsletter'] !== '') {
			sql += " AND c.`newsletter` = '" + data['filter_newsletter'] + "'";
		}

		if ((data['filter_customer_group_id'])) {
			sql += " AND c.`customer_group_id` = '" + data['filter_customer_group_id'] + "'";
		}

		if ((data['filter_ip'])) {
			sql += " AND c.`customer_id` IN (SELECT `customer_id` FROM `" + DB_PREFIX + "customer_ip` WHERE `ip` = " + this.db.escape(data['filter_ip']) + ")";
		}

		if (typeof data['filter_status'] != 'undefined' && data['filter_status'] !== '') {
			sql += " AND c.`status` = '" + data['filter_status'] + "'";
		}

		if ((data['filter_date_from'])) {
			sql += " AND DATE(c.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			sql += " AND DATE(c.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		const sort_data = [
			'name',
			'c.email',
			'customer_group',
			'c.status',
			'c.ip',
			'c.date_added'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY name";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
                        data['start'] = data['start']||0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalCustomers(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer` c";

		let implode = [];

		if (data['filter_name']) {
			implode.push("CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE " + this.db.escape('%' + data['filter_name'] + '%'));
		}

		if ((data['filter_email'])) {
			implode.push("c.`email` LIKE " + this.db.escape(data['filter_email'] + '%'));
		}

		if (data['filter_newsletter'] && data['filter_newsletter'] !== '') {
			implode.push("c.`newsletter` = '" + data['filter_newsletter'] + "'");
		}

		if ((data['filter_customer_group_id'])) {
			implode.push("c.`customer_group_id` = '" + data['filter_customer_group_id'] + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("c.`customer_id` IN (SELECT `customer_id` FROM " + DB_PREFIX + "customer_ip WHERE `ip` = " + this.db.escape(data['filter_ip']) + ")");
		}

		if (typeof data['filter_status'] != 'undefined' && data['filter_status'] !== '') {
			implode.push("c.`status` = '" + data['filter_status'] + "'");
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(c.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")");
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(c.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param address_id
	 *
	 * @return array
	 */
	async getAddress(address_id) {
		let address_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "address` WHERE `address_id` = '" + address_id + "'");

		if (address_query.num_rows) {
			let country_query = await this.db.query("SELECT *, c.name FROM `" + DB_PREFIX + "country` c LEFT JOIN `" + DB_PREFIX + "address_format` af ON (c.`address_format_id` = af.`address_format_id`) WHERE `country_id` = '" + address_query.row['country_id'] + "'");

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

			let zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + address_query.row['zone_id'] + "'");

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
				'custom_field': JSON.parse(address_query.row['custom_field']),
				'default': address_query.row['default']
			};
		}

		return {};
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getAddresses(customer_id) {
		let address_data = [];

		let query = await this.db.query("SELECT `address_id` FROM `" + DB_PREFIX + "address` WHERE `customer_id` = '" + customer_id + "'");

		for (let result of query.rows) {
			let address_info = await this.getAddress(result['address_id']);

			if (address_info) {
				address_data.push(address_info);
			}
		}

		return address_data;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalAddressesByCustomerId(customer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "address` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param country_id
	 *
	 * @return int
	 */
	async getTotalAddressesByCountryId(country_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "address` WHERE `country_id` = '" + country_id + "'");

		return query.row['total'];
	}

	/**
	 * @param zone_id
	 *
	 * @return int
	 */
	async getTotalAddressesByZoneId(zone_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "address` WHERE `zone_id` = '" + zone_id + "'");

		return query.row['total'];
	}

	/**
	 * @param customer_group_id
	 *
	 * @return int
	 */
	async getTotalCustomersByCustomerGroupId(customer_group_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer` WHERE `customer_group_id` = '" + customer_group_id + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param    customer_id
	 * @param comment
	 *
	 * @return void
	 */
	async addHistory(customer_id, comment) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_history` SET `customer_id` = '" + customer_id + "', `comment` = '" + this.db.escape(strip_tags(comment)) + "', `date_added` = NOW()");
	}

	/**
	 * @param customer_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getHistories(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `comment`, `date_added` FROM `" + DB_PREFIX + "customer_history` WHERE `customer_id` = '" + customer_id + "' ORDER BY `date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalHistories(customer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_history` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param    customer_id
	 * @param description
	 * @param  amount
	 * @param    order_id
	 *
	 * @return void
	 */
	async addTransaction(customer_id, description = '', amount = 0, order_id = 0) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_transaction` SET `customer_id` = '" + customer_id + "', `order_id` = '" + order_id + "', `description` = '" + this.db.escape(description) + "', `amount` = '" + amount + "', `date_added` = NOW()");
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
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getTransactions(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_transaction` WHERE `customer_id` = '" + customer_id + "' ORDER BY `date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalTransactions(customer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_transaction` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 *
	 * @return float
	 */
	async getTransactionTotal(customer_id) {
		let query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "customer_transaction` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalTransactionsByOrderId(order_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_transaction` WHERE `order_id` = '" + order_id + "'");

		return query.row['total'];
	}

	/**
	 * @param    customer_id
	 * @param description
	 * @param    points
	 * @param    order_id
	 *
	 * @return void
	 */
	async addReward(customer_id, description = '', points = 0, order_id = 0) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_reward` SET `customer_id` = '" + customer_id + "', `order_id` = '" + order_id + "', `points` = '" + points + "', `description` = '" + this.db.escape(description) + "', `date_added` = NOW()");
	}

	/**
	 * @param order_id
	 *
	 * @return void
	 */
	async deleteReward(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_reward` WHERE `order_id` = '" + order_id + "' AND `points` > '0'");
	}

	/**
	 * @param customer_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getRewards(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + customer_id + "' ORDER BY `date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalRewards(customer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getRewardTotal(customer_id) {
		let query = await this.db.query("SELECT SUM(points) AS `total` FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalRewardsByOrderId(order_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_reward` WHERE `order_id` = '" + order_id + "' AND `points` > '0'");

		return query.row['total'];
	}

	/**
	 * @param customer_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getIps(customer_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}
		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `ip`, `store_id`, `country`, `date_added` FROM `" + DB_PREFIX + "customer_ip` WHERE `customer_id` = '" + customer_id + "' ORDER BY `date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalIps(customer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_ip` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param ip
	 *
	 * @return int
	 */
	async getTotalCustomersByIp(ip) {
		let query = await this.db.query("SELECT COUNT(DISTINCT `customer_id`) AS `total` FROM `" + DB_PREFIX + "customer_ip` WHERE `ip` = '" + this.db.escape(ip) + "'");

		return query.row['total'];
	}

	/**
	 * @param email
	 *
	 * @return array
	 */
	async getTotalLoginAttempts(email) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_login` WHERE `email` = '" + this.db.escape(oc_strtolower(email)) + "'");

		return query.row;
	}

	/**
	 * @param email
	 *
	 * @return void
	 */
	async deleteLoginAttempts(email) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_login` WHERE `email` = " + this.db.escape(oc_strtolower(email)) + "");
	}
}
