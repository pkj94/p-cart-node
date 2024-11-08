module.exports = class ModelExtensionPaymentPayPal extends Model {
		
	async getTotalSales() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}
		
		const query = await this.db.query("SELECT SUM(total) AS paypal_total FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(',', implode) + ") AND payment_code = 'paypal'");

		return query.row['paypal_total'];
	}
	
	async getTotalSalesByDay() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		sale_data = {};

		for (i = 0; i < 24; i++) {
			sale_data[i] = array(
				'hour'  		: i,
				'total' 		: 0,
				'paypal_total' 	: 0
			);
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(',', implode) + ") AND DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows ) {
			sale_data[result['hour']] = array(
				'hour'  		: result['hour'],
				'total' 		: result['total'],
				'paypal_total'  : result['paypal_total']
			);
		}

		return sale_data;
	}

	async getTotalSalesByWeek() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		sale_data = {};

		date_start = strtotime('-' + date('w') + ' days');

		for (i = 0; i < 7; i++) {
			date = date('Y-m-d', date_start + (i * 86400));

			sale_data[date('w', strtotime(date))] = array(
				'day'   		: date('D', strtotime(date)),
				'total' 		: 0,
				'paypal_total' 	: 0
			);
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(',', implode) + ") AND DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows ) {
			sale_data[date('w', strtotime(result['date_added']))] = array(
				'day'   		: date('D', strtotime(result['date_added'])),
				'total' 		: result['total'],
				'paypal_total'  : result['paypal_total']
			);
		}

		return sale_data;
	}

	async getTotalSalesByMonth() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		sale_data = {};

		for (i = 1; i <= date('t'); i++) {
			date = date('Y') + '-' + date('m') + '-' + i;

			sale_data[date('j', strtotime(date))] = array(
				'day'   		: date('d', strtotime(date)),
				'total' 		: 0,
				'paypal_total' 	: 0
			);
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(',', implode) + ") AND DATE(date_added) >= '" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "' GROUP BY DATE(date_added)");

		for (let result of query.rows ) {
			sale_data[date('j', strtotime(result['date_added']))] = array(
				'day'   : date('d', strtotime(result['date_added'])),
				'total' 		: result['total'],
				'paypal_total'  : result['paypal_total']
			);
		}

		return sale_data;
	}

	async getTotalSalesByYear() {
		let implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'";
		}

		sale_data = {};

		for (i = 1; i <= 12; i++) {
			sale_data[i] = array(
				'month' 		: date('M', mktime(0, 0, 0, i)),
				'total' 		: 0,
				'paypal_total' 	: 0
			);
		}

		const query = await this.db.query("SELECT SUM(total) AS total, SUM(IF (payment_code = 'paypal', total, 0)) AS paypal_total, date_added FROM `" + DB_PREFIX + "order` WHERE order_status_id IN(" + implode(',', implode) + ") AND YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows ) {
			sale_data[date('n', strtotime(result['date_added']))] = array(
				'month' : date('M', strtotime(result['date_added'])),
				'total' 		: result['total'],
				'paypal_total'  : result['paypal_total']
			);
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
			implode.push("`paypal_order_id` = '" + this.db.escape(data['paypal_order_id']) + "'";
		}
		
		if ((data['transaction_id'])) {
			implode.push("`transaction_id` = '" + this.db.escape(data['transaction_id']) + "'";
		}
					
		if ((data['transaction_status'])) {
			implode.push("`transaction_status` = '" + this.db.escape(data['transaction_status']) + "'";
		}
		
		if ((data['payment_method'])) {
			implode.push("`payment_method` = '" + this.db.escape(data['payment_method']) + "'";
		}
		
		if ((data['vault_id'])) {
			implode.push("`vault_id` = '" + this.db.escape(data['vault_id']) + "'";
		}
		
		if ((data['vault_customer_id'])) {
			implode.push("`vault_customer_id` = '" + this.db.escape(data['vault_customer_id']) + "'";
		}
		
		if ((data['card_type'])) {
			implode.push("`card_type` = '" + this.db.escape(data['card_type']) + "'";
		}
		
		if ((data['card_nice_type'])) {
			implode.push("`card_nice_type` = '" + this.db.escape(data['card_nice_type']) + "'";
		}
		
		if ((data['card_last_digits'])) {
			implode.push("`card_last_digits` = '" + this.db.escape(data['card_last_digits']) + "'";
		}
		
		if ((data['card_expiry'])) {
			implode.push("`card_expiry` = '" + this.db.escape(data['card_expiry']) + "'";
		}
		
		if ((data['environment'])) {
			implode.push("`environment` = '" + this.db.escape(data['environment']) + "'";
		}
				
		if (implode.length) {
			sql += implode(", ", implode);
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
		agree_status = true;
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE status = '1' AND (iso_code_2 = 'CU' OR iso_code_2 = 'IR' OR iso_code_2 = 'SY' OR iso_code_2 = 'KP')");
		
		if (query.rows) {
			agree_status = false;
		}
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '220' AND status = '1' AND (`code` = '43' OR `code` = '14' OR `code` = '09')");
		
		if (query.rows) {
			agree_status = false;
		}
		
		return agree_status;
	}
	
	async checkVersion(opencart_version, paypal_version) {
		curl = curl_init();
			
		curl_setopt(curl, CURLOPT_URL, 'https://www.opencart.com/index.php?route=api/promotion/paypalCheckoutIntegration&opencart=' + opencart_version + '&paypal=' + paypal_version);
		curl_setopt(curl, CURLOPT_HEADER, 0);
		curl_setopt(curl, CURLOPT_HEADER, 0);
		curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(curl, CURLOPT_FOLLOWLOCATION, false);
		curl_setopt(curl, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(curl, CURLOPT_FRESH_CONNECT, 1);
							
		response = curl_exec(curl);
			
		curl_close(curl);
			
		result = JSON.parse(response, true);
		
		if (result) {
			return result;
		} else {
			return false;
		}
	}
		
	async sendContact(data) {
		curl = curl_init();

		curl_setopt(curl, CURLOPT_URL, 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8');
		curl_setopt(curl, CURLOPT_HEADER, 0);
		curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(curl, CURLOPT_FOLLOWLOCATION, false);
		curl_setopt(curl, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(curl, CURLOPT_FRESH_CONNECT, 1);
		curl_setopt(curl, CURLOPT_POST, 1);
		curl_setopt(curl, CURLOPT_POSTFIELDS, http_build_query(data));

		response = curl_exec(curl);

		curl_close(curl);
	}
	
	async log(data, title = null) {
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
		
		setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
			
		if (setting['general']['debug']) {
			log = new Log('paypal.log');
			log.write('PayPal debug (' + title + '): ' + JSON.stringify(data));
		}
	}
	
	async install() {
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_customer_token` (`customer_id` INT(11) NOT NULL, `payment_method` VARCHAR(20) NOT NULL, `vault_id` VARCHAR(50) NOT NULL, `vault_customer_id` VARCHAR(50) NOT NULL, `card_type` VARCHAR(40) NOT NULL, `card_nice_type` VARCHAR(40) NOT NULL, `card_last_digits` VARCHAR(4) NOT NULL, `card_expiry` VARCHAR(20) NOT NULL, `main_token_status` TINYINT(1) NOT NULL, PRIMARY KEY (`customer_id`, `payment_method`, `vault_id`), KEY `vault_customer_id` (`vault_customer_id`), KEY `main_token_status` (`main_token_status`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci");
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order` (`order_id` INT(11) NOT NULL, `paypal_order_id` VARCHAR(20) NOT NULL, `transaction_id` VARCHAR(20) NOT NULL, `transaction_status` VARCHAR(20) NOT NULL, `payment_method` VARCHAR(20) NOT NULL, `vault_id` VARCHAR(50) NOT NULL, `vault_customer_id` VARCHAR(50) NOT NULL, `card_type` VARCHAR(40) NOT NULL, `card_nice_type` VARCHAR(40) NOT NULL, `card_last_digits` VARCHAR(4) NOT NULL, `card_expiry` VARCHAR(20) NOT NULL, `environment` VARCHAR(20) NOT NULL, PRIMARY KEY (`order_id`), KEY `paypal_order_id` (`paypal_order_id`), KEY `transaction_id` (`transaction_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci");
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` (`paypal_order_recurring_id` INT(11) NOT NULL AUTO_INCREMENT, `order_id` INT(11) NOT NULL, `order_recurring_id` INT(11) NOT NULL, `date_added` DATETIME NOT NULL, `date_modified` DATETIME NOT NULL, `next_payment` DATETIME NOT NULL, `trial_end` DATETIME DEFAULT NULL, `subscription_end` DATETIME DEFAULT NULL, `currency_code` CHAR(3) NOT NULL, `total` DECIMAL(10, 2) NOT NULL, PRIMARY KEY (`paypal_order_recurring_id`), KEY (`order_id`), KEY (`order_recurring_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci");
	}
	
	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_customer_token`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order_recurring`");
	}
}
