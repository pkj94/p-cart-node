module.exports = class ModelExtensionDashboardChart extends Model {
	async getTotalOrdersByDay() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		order_data = {};

		for (i = 0; i < 24; i++) {
			order_data[i] = array(
				'hour'  : i,
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(",", implode) + ") AND DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows ) {
			order_data[result['hour']] = array(
				'hour'  : result['hour'],
				'total' : result['total']
			);
		}

		return order_data;
	}

	async getTotalOrdersByWeek() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		order_data = {};

		date_start = strtotime('-' + date('w') + ' days');

		for (i = 0; i < 7; i++) {
			date = date('Y-m-d', date_start + (i * 86400));

			order_data[date('w', strtotime(date))] = array(
				'day'   : date('D', strtotime(date)),
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(",", implode) + ") AND DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows ) {
			order_data[date('w', strtotime(result['date_added']))] = array(
				'day'   : date('D', strtotime(result['date_added'])),
				'total' : result['total']
			);
		}

		return order_data;
	}

	async getTotalOrdersByMonth() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		order_data = {};

		for (i = 1; i <= date('t'); i++) {
			date = date('Y') + '-' + date('m') + '-' + i;

			order_data[date('j', strtotime(date))] = array(
				'day'   : date('d', strtotime(date)),
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(",", implode) + ") AND DATE(date_added) >= DATE('" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "') GROUP BY DATE(date_added)");

		for (let result of query.rows ) {
			order_data[date('j', strtotime(result['date_added']))] = array(
				'day'   : date('d', strtotime(result['date_added'])),
				'total' : result['total']
			);
		}

		return order_data;
	}

	async getTotalOrdersByYear() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		order_data = {};

		for (i = 1; i <= 12; i++) {
			order_data[i] = array(
				'month' : date('M', mktime(0, 0, 0, i)),
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(",", implode) + ") AND YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows ) {
			order_data[date('n', strtotime(result['date_added']))] = array(
				'month' : date('M', strtotime(result['date_added'])),
				'total' : result['total']
			);
		}

		return order_data;
	}
	
	async getTotalCustomersByDay() {
		customer_data = {};

		for (i = 0; i < 24; i++) {
			customer_data[i] = array(
				'hour'  : i,
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows ) {
			customer_data[result['hour']] = array(
				'hour'  : result['hour'],
				'total' : result['total']
			);
		}

		return customer_data;
	}

	async getTotalCustomersByWeek() {
		customer_data = {};

		date_start = strtotime('-' + date('w') + ' days');

		for (i = 0; i < 7; i++) {
			date = date('Y-m-d', date_start + (i * 86400));

			customer_data[date('w', strtotime(date))] = array(
				'day'   : date('D', strtotime(date)),
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows ) {
			customer_data[date('w', strtotime(result['date_added']))] = array(
				'day'   : date('D', strtotime(result['date_added'])),
				'total' : result['total']
			);
		}

		return customer_data;
	}

	async getTotalCustomersByMonth() {
		customer_data = {};

		for (i = 1; i <= date('t'); i++) {
			date = date('Y') + '-' + date('m') + '-' + i;

			customer_data[date('j', strtotime(date))] = array(
				'day'   : date('d', strtotime(date)),
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) >= DATE('" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "') GROUP BY DATE(date_added)");

		for (let result of query.rows ) {
			customer_data[date('j', strtotime(result['date_added']))] = array(
				'day'   : date('d', strtotime(result['date_added'])),
				'total' : result['total']
			);
		}

		return customer_data;
	}

	async getTotalCustomersByYear() {
		customer_data = {};

		for (i = 1; i <= 12; i++) {
			customer_data[i] = array(
				'month' : date('M', mktime(0, 0, 0, i)),
				'total' : 0
			);
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows ) {
			customer_data[date('n', strtotime(result['date_added']))] = array(
				'month' : date('M', strtotime(result['date_added'])),
				'total' : result['total']
			);
		}

		return customer_data;
	}	
}