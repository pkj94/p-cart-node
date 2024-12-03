const array_replace_recursive = require("locutus/php/array/array_replace_recursive");
const mktime = require("locutus/php/datetime/mktime");
const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class ModelExtensionPaymentPayPal extends Model {

	async getTotalSales() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		const query = await this.db.query("SELECT SUM(total) AS paypal_total FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND payment_code = 'paypal'");

		return query.row['paypal_total'];
	}

	async getTotalSalesByDay() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let sale_data = {};

		for (let i = 0; i < 24; i++) {
			sale_data[i] = {
				'hour': i,
				'total': 0,
				'paypal_total': 0
			};
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows) {
			sale_data[result['hour']] = {
				'hour': result['hour'],
				'total': result['total'],
				'paypal_total': result['paypal_total']
			};
		}

		return sale_data;
	}

	async getTotalSalesByWeek() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let sale_data = {};

		let date_start = strtotime('-' + date('w') + ' days');

		for (let i = 0; i < 7; i++) {
			let date1 = date('Y-m-d', date_start + (i * 86400));

			sale_data[date('w', new Date(date1))] = {
				'day': date('D', new Date(date1)),
				'total': 0,
				'paypal_total': 0
			};
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows) {
			sale_data[date('w', new Date(result['date_added']))] = {
				'day': date('D', new Date(result['date_added'])),
				'total': result['total'],
				'paypal_total': result['paypal_total']
			};
		}

		return sale_data;
	}

	async getTotalSalesByMonth() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let sale_data = {};

		for (let i = 1; i <= Number(date('t')); i++) {
			let date1 = date('Y') + '-' + date('m') + '-' + i;

			sale_data[date('j', new Date(date1))] = {
				'day': date('d', new Date(date1)),
				'total': 0,
				'paypal_total': 0
			};
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND DATE(date_added) >= '" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "' GROUP BY DATE(date_added)");

		for (let result of query.rows) {
			sale_data[date('j', new Date(result['date_added']))] = {
				'day': date('d', new Date(result['date_added'])),
				'total': result['total'],
				'paypal_total': result['paypal_total']
			};
		}

		return sale_data;
	}

	async getTotalSalesByYear() {
		let implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let sale_data = {};

		for (let i = 1; i <= 12; i++) {
			sale_data[i] = {
				'month': date('M', mktime(0, 0, 0, i)),
				'total': 0,
				'paypal_total': 0
			};
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode.join(",") + ") AND YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows) {
			sale_data[date('n', new Date(result['date_added']))] = {
				'month': date('M', new Date(result['date_added'])),
				'total': result['total'],
				'paypal_total': result['paypal_total']
			};
		}

		return sale_data;
	}

	async getCountryByCode(code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE iso_code_2 = '" + this.db.escape(code) + "'");

		return query.row;
	}

	async deletePayPalCustomerTokens(customer_id) {
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "paypal_checkout_integration_customer_token` WHERE `customer_id` = '" + customer_id + "'");
	}

	async editPayPalOrder(data) {
		let sql = "UPDATE `" + DB_PREFIX + "paypal_checkout_integration_order` SET";

		let implode = [];

		if ((data['paypal_order_id'])) {
			implode.push("`paypal_order_id` = '" + this.db.escape(data['paypal_order_id']) + "'");
		}

		if ((data['transaction_id'])) {
			implode.push("`transaction_id` = '" + this.db.escape(data['transaction_id']) + "'");
		}

		if ((data['transaction_status'])) {
			implode.push("`transaction_status` = '" + this.db.escape(data['transaction_status']) + "'");
		}

		if ((data['payment_method'])) {
			implode.push("`payment_method` = '" + this.db.escape(data['payment_method']) + "'");
		}

		if ((data['vault_id'])) {
			implode.push("`vault_id` = '" + this.db.escape(data['vault_id']) + "'");
		}

		if ((data['vault_customer_id'])) {
			implode.push("`vault_customer_id` = '" + this.db.escape(data['vault_customer_id']) + "'");
		}

		if ((data['card_type'])) {
			implode.push("`card_type` = '" + this.db.escape(data['card_type']) + "'");
		}

		if ((data['card_nice_type'])) {
			implode.push("`card_nice_type` = '" + this.db.escape(data['card_nice_type']) + "'");
		}

		if ((data['card_last_digits'])) {
			implode.push("`card_last_digits` = '" + this.db.escape(data['card_last_digits']) + "'");
		}

		if ((data['card_expiry'])) {
			implode.push("`card_expiry` = '" + this.db.escape(data['card_expiry']) + "'");
		}

		if ((data['environment'])) {
			implode.push("`environment` = '" + this.db.escape(data['environment']) + "'");
		}

		if (implode.length) {
			sql += implode.join(", ");
		}

		sql += " WHERE `order_id` = '" + data['order_id'] + "'";

		await this.db.query(sql);
	}

	async deletePayPalOrder(order_id) {
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "paypal_checkout_integration_order` WHERE `order_id` = '" + order_id + "'");
	}

	async getPayPalOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_order` WHERE `order_id` = '" + order_id + "'");

		if (query.num_rows) {
			return query.row;
		} else {
			return {};
		}
	}

	async editOrderRecurringStatus(order_recurring_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `status` = '" + status + "' WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}

	async setAgreeStatus() {
		await this.db.query("UPDATE " + DB_PREFIX + "country SET status = '0' WHERE (iso_code_2 = 'CU' OR iso_code_2 = 'IR' OR iso_code_2 = 'SY' OR iso_code_2 = 'KP')");
		await this.db.query("UPDATE " + DB_PREFIX + "zone SET status = '0' WHERE country_id = '220' AND (`code` = '43' OR `code` = '14' OR `code` = '09')");
	}

	async getAgreeStatus() {
		let agree_status = true;

		let query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE status = '1' AND (iso_code_2 = 'CU' OR iso_code_2 = 'IR' OR iso_code_2 = 'SY' OR iso_code_2 = 'KP')");

		if (query.rows) {
			agree_status = false;
		}

		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '220' AND status = '1' AND (`code` = '43' OR `code` = '14' OR `code` = '09')");

		if (query.rows) {
			agree_status = false;
		}

		return agree_status;
	}

	async checkVersion(opencart_version, paypal_version) {
		try {
			const curl = await require('axios').get('https://www.opencart.com/index.php?route=api/promotion/paypalCheckoutIntegration&opencart=' + opencart_version + '&paypal=' + paypal_version, {
				headers: { 'Content-Type': 'application/json' },
				timeout: 30000, // 30 seconds timeout 
				httpsAgent: new (require('https').Agent)({
					rejectUnauthorized: false
				})
			});


			const result = curl.data;

			if (result) {
				return result;
			} else {
				return false;
			}
		} catch (e) {
			return false;
		}
	}

	async sendContact(data) {
		const curl = await require('axios').post('https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8', data);
		const result = curl.data;
		return result;
	}

	async log(data, title = null) {
		const _config = new Config();
		await _config.load('paypal');

		let config_setting = _config.get('paypal_setting');

		let setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));

		if (setting['general']['debug']) {
			const log = new Log('paypal.log');
			await log.write('PayPal debug (' + title + '): ' + JSON.stringify(data, true));
		}
	}

	async install() {
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_customer_token` (`customer_id` INT(11) NOT NULL, `payment_method` VARCHAR(20) NOT NULL, `vault_id` VARCHAR(50) NOT NULL, `vault_customer_id` VARCHAR(50) NOT NULL, `card_type` VARCHAR(40) NOT NULL, `card_nice_type` VARCHAR(40) NOT NULL, `card_last_digits` VARCHAR(4) NOT NULL, `card_expiry` VARCHAR(20) NOT NULL, `main_token_status` TINYINT(1) NOT NULL, PRIMARY KEY (`customer_id`, `payment_method`, `vault_id`), KEY `vault_customer_id` (`vault_customer_id`), KEY `main_token_status` (`main_token_status`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order` (`order_id` INT(11) NOT NULL, `paypal_order_id` VARCHAR(20) NOT NULL, `transaction_id` VARCHAR(20) NOT NULL, `transaction_status` VARCHAR(20) NOT NULL, `payment_method` VARCHAR(20) NOT NULL, `vault_id` VARCHAR(50) NOT NULL, `vault_customer_id` VARCHAR(50) NOT NULL, `card_type` VARCHAR(40) NOT NULL, `card_nice_type` VARCHAR(40) NOT NULL, `card_last_digits` VARCHAR(4) NOT NULL, `card_expiry` VARCHAR(20) NOT NULL, `environment` VARCHAR(20) NOT NULL, PRIMARY KEY (`order_id`), KEY `paypal_order_id` (`paypal_order_id`), KEY `transaction_id` (`transaction_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` (`paypal_order_recurring_id` INT(11) NOT NULL AUTO_INCREMENT, `order_id` INT(11) NOT NULL, `order_recurring_id` INT(11) NOT NULL, `date_added` DATETIME NOT NULL, `date_modified` DATETIME NOT NULL, `next_payment` DATETIME NOT NULL, `trial_end` DATETIME DEFAULT NULL, `subscription_end` DATETIME DEFAULT NULL, `currency_code` CHAR(3) NOT NULL, `total` DECIMAL(10, 2) NOT NULL, PRIMARY KEY (`paypal_order_recurring_id`), KEY (`order_id`), KEY (`order_recurring_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_customer_token`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order_recurring`");
	}
}
