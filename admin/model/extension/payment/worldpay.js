module.exports = 
class ModelExtensionPaymentWorldpay extends Model {

	async install() {
		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "worldpay_order` (
			  `worldpay_order_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `order_id` INT(11) NOT NULL,
			  `order_code` VARCHAR(50),
			  `date_added` DATETIME NOT NULL,
			  `date_modified` DATETIME NOT NULL,
			  `refund_status` INT(1) DEFAULT NULL,
			  `currency_code` CHAR(3) NOT NULL,
			  `total` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`worldpay_order_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "worldpay_order_transaction` (
			  `worldpay_order_transaction_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `worldpay_order_id` INT(11) NOT NULL,
			  `date_added` DATETIME NOT NULL,
			  `type` ENUM('payment', 'refund') DEFAULT NULL,
			  `amount` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`worldpay_order_transaction_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "worldpay_order_recurring` (
			  `worldpay_order_recurring_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `order_id` INT(11) NOT NULL,
			  `order_recurring_id` INT(11) NOT NULL,
			  `order_code` VARCHAR(50),
			  `token` VARCHAR(50),
			  `date_added` DATETIME NOT NULL,
			  `date_modified` DATETIME NOT NULL,
			  `next_payment` DATETIME NOT NULL,
			  `trial_end` datetime DEFAULT NULL,
			  `subscription_end` datetime DEFAULT NULL,
			  `currency_code` CHAR(3) NOT NULL,
			  `total` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`worldpay_order_recurring_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "worldpay_card` (
			  `card_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `customer_id` INT(11) NOT NULL,
			  `order_id` INT(11) NOT NULL,
			  `token` VARCHAR(50) NOT NULL,
			  `digits` VARCHAR(22) NOT NULL,
			  `expiry` VARCHAR(5) NOT NULL,
			  `type` VARCHAR(50) NOT NULL,
			  PRIMARY KEY (`card_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_order_transaction`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_order_recurring`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_card`;");
	}

	async refund(order_id, amount) {
		worldpay_order = this.getOrder(order_id);

		if ((worldpay_order) && worldpay_order['refund_status'] != 1) {
			order['refundAmount'] = (amount * 100);

			url = worldpay_order['order_code'] + '/refund';

			response_data = this.sendCurl(url, order);

			return response_data;
		} else {
			return false;
		}
	}

	async updateRefundStatus(worldpay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "worldpay_order` SET `refund_status` = '" + status + "' WHERE `worldpay_order_id` = '" + worldpay_order_id + "'");
	}

	async getOrder(order_id) {

		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "worldpay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			order = qry.row;
			order['transactions'] = this.getTransactions(order['worldpay_order_id'], qry.row['currency_code']);

			return order;
		} else {
			return false;
		}
	}

	private function getTransactions(worldpay_order_id, currency_code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "worldpay_order_transaction` WHERE `worldpay_order_id` = '" + worldpay_order_id + "'");

		transactions = {};
		if (query.num_rows) {
			for (query.rows of row) {
				row['amount'] = this.currency.format(row['amount'], currency_code, false);
				transactions[] = row;
			}
			return transactions;
		} else {
			return false;
		}
	}

	async addTransaction(worldpay_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "worldpay_order_transaction` SET `worldpay_order_id` = '" + worldpay_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(worldpay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "worldpay_order_transaction` WHERE `worldpay_order_id` = '" + worldpay_order_id + "' AND (`type` = 'payment' OR `type` = 'refund')");

		return query.row['total'];
	}

	async getTotalRefunded(worldpay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "worldpay_order_transaction` WHERE `worldpay_order_id` = '" + worldpay_order_id + "' AND 'refund'");

		return query.row['total'];
	}

	async sendCurl(url, order) {

		json = JSON.stringify(order);

		curl = curl_init();

		curl_setopt(curl, CURLOPT_URL, 'https://api.worldpay.com/v1/orders/' + url);
		curl_setopt(curl, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt(curl, CURLOPT_POSTFIELDS, json);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt(curl, CURLOPT_CONNECTTIMEOUT, 0);
		curl_setopt(curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
		curl_setopt(curl, CURLOPT_TIMEOUT, 10);
		curl_setopt(
				curl, CURLOPT_HTTPHEADER, array(
			"Authorization: " + this.config.get('payment_worldpay_service_key'),
			"Content-Type: application/json",
			"Content-Length: " + strlen(json)
				)
		);

		result = JSON.parse(curl_exec(curl));
		curl_close(curl);

		response = {};

		if ((result)) {
			response['status'] = result.httpStatusCode;
			response['message'] = result.message;
			response['full_details'] = result;
		} else {
			response['status'] = 'success';
		}

		return response;
	}

	async logger(message) {
		if (this.config.get('payment_worldpay_debug') == 1) {
			log = new Log('worldpay.log');
			log.write(message);
		}
	}

}
