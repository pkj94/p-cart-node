module.exports = class ModelSaleRecurring extends Model {
	async getRecurrings(data) {
		let sql = "SELECT `or`.order_recurring_id, `or`.order_id, `or`.reference, `or`.`status`, `or`.`date_added`, CONCAT(`o`.firstname, ' ', `o`.lastname) AS customer FROM `" + DB_PREFIX + "order_recurring` `or` LEFT JOIN `" + DB_PREFIX + "order` `o` ON (`or`.order_id = `o`.order_id)";

		let implode = [];

		if ((data['filter_order_recurring_id'])) {
			implode.push("or.order_recurring_id = " + data['filter_order_recurring_id'];
		}

		if ((data['filter_order_id'])) {
			implode.push("or.order_id = " + data['filter_order_id'];
		}

		if ((data['filter_reference'])) {
			implode.push("or.reference LIKE '" + this.db.escape(data['filter_reference']) + "%'";
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(o.firstname, ' ', o.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "%'";
		}

		if ((data['filter_status'])) {
			implode.push("or.status = " + data['filter_status'];
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(or.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		} 
			 
		let sort_data = [
			'or.order_recurring_id',
			'or.order_id',
			'or.reference',
			'customer',
			'or.status',
			'or.date_added'
		});

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY or.order_recurring_id";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

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

	async getRecurring(order_recurring_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_recurring WHERE order_recurring_id = " + order_recurring_id);

		return query.row;
	}

	async getRecurringTransactions(order_recurring_id) {
		transactions = {};

		const query = await this.db.query("SELECT amount, type, date_added FROM " + DB_PREFIX + "order_recurring_transaction WHERE order_recurring_id = " + order_recurring_id + " ORDER BY date_added DESC");

		for (let result of query.rows ) {
			switch (result['type']) {
				case 0:
					type = this.language.get('text_transaction_date_added');
					break;
				case 1:
					type = this.language.get('text_transaction_payment');
					break;
				case 2:
					type = this.language.get('text_transaction_outstanding_payment');
					break;
				case 3:
					type = this.language.get('text_transaction_skipped');
					break;
				case 4:
					type = this.language.get('text_transaction_failed');
					break;
				case 5:
					type = this.language.get('text_transaction_cancelled');
					break;
				case 6:
					type = this.language.get('text_transaction_suspended');
					break;
				case 7:
					type = this.language.get('text_transaction_suspended_failed');
					break;
				case 8:
					type = this.language.get('text_transaction_outstanding_failed');
					break;
				case 9:
					type = this.language.get('text_transaction_expired');
					break;
				default:
					type = '';
					break;
			}

			transactions.push({
				'date_added' : result['date_added'],
				'amount'     : result['amount'],
				'type'       : type
			});
		}

		return transactions;
	}

	private function getStatus(status) {
		switch (status) {
			case 1:
				result = this.language.get('text_status_inactive');
				break;
			case 2:
				result = this.language.get('text_status_active');
				break;
			case 3:
				result = this.language.get('text_status_suspended');
				break;
			case 4:
				result = this.language.get('text_status_cancelled');
				break;
			case 5:
				result = this.language.get('text_status_expired');
				break;
			case 6:
				result = this.language.get('text_status_pending');
				break;
			default:
				result = '';
				break;
		}

		return result;
	}
	
	async getTotalRecurrings(data) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_recurring` `or` LEFT JOIN `" + DB_PREFIX + "order` o ON (`or`.order_id = `o`.order_id)";
		
		let implode = [];

		if ((data['filter_order_recurring_id'])) {
			implode.push("or.order_recurring_id = " + data['filter_order_recurring_id'];
		}

		if ((data['filter_order_id'])) {
			implode.push("or.order_id = " + data['filter_order_id'];
		}

		if ((data['filter_payment_reference'])) {
			implode.push(" or.reference LIKE '" + this.db.escape(data['filter_reference']) + "%'";
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(o.firstname, ' ', o.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "%'";
		}

		if ((data['filter_status'])) {
			implode.push("or.status = " + data['filter_status'];
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(or.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}
		
		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		} 
		
		const query = await this.db.query(sql);

		return query.row['total'];
	}	
}
