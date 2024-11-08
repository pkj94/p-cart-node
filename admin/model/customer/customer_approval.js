module.exports = class ModelCustomerCustomerApproval extends Model {
	async getCustomerApprovals(data = {}) {
		let sql = "SELECT *, CONCAT(c.`firstname`, ' ', c.`lastname`) AS name, cgd.`name` AS customer_group, ca.`type` FROM `" + DB_PREFIX + "customer_approval` ca LEFT JOIN `" + DB_PREFIX + "customer` c ON (ca.`customer_id` = c.`customer_id`) LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (c.`customer_group_id` = cgd.`customer_group_id`) WHERE cgd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE '%" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_email'])) {
			sql += " AND c.`email` LIKE '" + this.db.escape(data['filter_email']) + "%'";
		}
		
		if ((data['filter_customer_group_id'])) {
			sql += " AND c.`customer_group_id` = '" + data['filter_customer_group_id'] + "'";
		}
		
		if ((data['filter_type'])) {
			sql += " AND ca.`type` = '" + this.db.escape(data['filter_type']) + "'";
		}
		
		if ((data['filter_date_added'])) {
			sql += " AND DATE(c.`date_added`) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		sql += " ORDER BY c.`date_added` DESC";

		if ((data['start']) || (data['limit'])) {
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

		const query = await this.db.query(sql);

		return query.rows;
	}
	
	async getCustomerApproval(customer_approval_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_approval` WHERE `customer_approval_id` = '" + customer_approval_id + "'");
		
		return query.row;
	}
	
	async getTotalCustomerApprovals(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "customer_approval` ca LEFT JOIN `" + DB_PREFIX + "customer` c ON (ca.`customer_id` = c.`customer_id`)";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE '%" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_email'])) {
			implode.push("c.`email` LIKE '" + this.db.escape(data['filter_email']) + "%'";
		}

		if ((data['filter_customer_group_id'])) {
			implode.push("c.`customer_group_id` = '" + data['filter_customer_group_id'] + "'";
		}
		
		if ((data['filter_type'])) {
			implode.push("ca.`type` = '" + this.db.escape(data['filter_type']) + "'";
		}
		
		if ((data['filter_date_added'])) {
			implode.push("DATE(ca.`date_added`) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
	
	async approveCustomer(customer_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET status = '1' WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE customer_id = '" + customer_id + "' AND `type` = 'customer'");
	}

	async denyCustomer(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE customer_id = '" + customer_id + "' AND `type` = 'customer'");
	}

	async approveAffiliate(customer_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "customer_affiliate` SET status = '1' WHERE customer_id = '" + customer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE customer_id = '" + customer_id + "' AND `type` = 'affiliate'");
	}
	
	async denyAffiliate(customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_approval` WHERE customer_id = '" + customer_id + "' AND `type` = 'affiliate'");
	}	
}