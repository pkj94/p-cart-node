const mktime = require("locutus/php/datetime/mktime");

module.exports = class ModelExtensionDashboardChart extends Model {
	async getTotalOrdersByDay() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		for (let i = 0; i < 24; i++) {
			order_data[i] = {
				'hour': i,
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows) {
			order_data[result['hour']] = {
				'hour': result['hour'],
				'total': result['total']
			};
		}

		return order_data;
	}

	async getTotalOrdersByWeek() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		let date_start = new Date('-' + date('w') + ' days');

		for (let i = 0; i < 7; i++) {
			let date1 = date('Y-m-d', date_start + (i * 86400));

			order_data[date('w', new Date(date1))] = {
				'day': date('D', new Date(date1)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows) {
			order_data[date('w', new Date(result['date_added']))] = {
				'day': date('D', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return order_data;
	}

	async getTotalOrdersByMonth() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		for (let i = 1; i <= date('t'); i++) {
			let date1 = date('Y') + '-' + date('m') + '-' + i;

			order_data[date('j', new Date(date1))] = {
				'day': date('d', new Date(date1)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND DATE(date_added) >= DATE('" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "') GROUP BY DATE(date_added)");

		for (let result of query.rows) {
			order_data[date('j', new Date(result['date_added']))] = {
				'day': date('d', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return order_data;
	}

	async getTotalOrdersByYear() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		for (let i = 1; i <= 12; i++) {
			order_data[i] = {
				'month': date('M', mktime(0, 0, 0, i)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows) {
			order_data[date('n', new Date(result['date_added']))] = {
				'month': date('M', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return order_data;
	}

	async getTotalCustomersByDay() {
		let customer_data = {};

		for (let i = 0; i < 24; i++) {
			customer_data[i] = {
				'hour': i,
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows) {
			customer_data[result['hour']] = {
				'hour': result['hour'],
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getTotalCustomersByWeek() {
		let customer_data = {};

		let date_start = new Date('-' + date('w') + ' days');

		for (let i = 0; i < 7; i++) {
			let date1 = date('Y-m-d', date_start + (i * 86400));

			customer_data[date('w', new Date(date1))] = {
				'day': date('D', new Date(date1)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows) {
			customer_data[date('w', new Date(result['date_added']))] = {
				'day': date('D', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getTotalCustomersByMonth() {
		let customer_data = {};

		for (let i = 1; i <= date('t'); i++) {
			let date1 = date('Y') + '-' + date('m') + '-' + i;

			customer_data[date('j', new Date(date1))] = {
				'day': date('d', new Date(date1)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) >= DATE('" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "') GROUP BY DATE(date_added)");

		for (let result of query.rows) {
			customer_data[date('j', new Date(result['date_added']))] = {
				'day': date('d', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getTotalCustomersByYear() {
		let customer_data = {};

		for (let i = 1; i <= 12; i++) {
			customer_data[i] = {
				'month': date('M', mktime(0, 0, 0, i)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows) {
			customer_data[date('n', new Date(result['date_added']))] = {
				'month': date('M', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return customer_data;
	}
}