module.exports = 
class ModelExtensionPaymentG2aPay extends Model {

	async install() {
		await this.db.query("
			CREATE TABLE `" + DB_PREFIX + "g2apay_order` (
				`g2apay_order_id` INT(11) NOT NULL AUTO_INCREMENT,
				`order_id` int(11) NOT NULL,
				`g2apay_transaction_id` varchar(255) NOT NULL,
				`date_added` DATETIME NOT NULL,
				`modified` DATETIME NOT NULL,
				`refund_status` INT(1) DEFAULT NULL,
				`currency_code` CHAR(3) NOT NULL,
				`total` DECIMAL( 10, 2 ) NOT NULL,
				KEY `g2apay_transaction_id` (`g2apay_transaction_id`),
				PRIMARY KEY `g2apay_order_id` (`g2apay_order_id`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci;
		");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "g2apay_order_transaction` (
			  `g2apay_order_transaction_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `g2apay_order_id` INT(11) NOT NULL,
			  `date_added` DATETIME NOT NULL,
			  `type` ENUM('payment', 'refund') DEFAULT NULL,
			  `amount` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`g2apay_order_transaction_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;
			");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "g2apay_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "g2apay_order_transaction`;");
	}

	async getOrder(order_id) {

		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "g2apay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			order = qry.row;
			order['transactions'] = this.getTransactions(order['g2apay_order_id'], qry.row['currency_code']);
			return order;
		} else {
			return false;
		}
	}

	async getTotalReleased(g2apay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "g2apay_order_transaction` WHERE `g2apay_order_id` = '" + g2apay_order_id + "' AND (`type` = 'payment' OR `type` = 'refund')");

		return query.row['total'];
	}

	async refund(g2apay_order, amount) {
		if ((g2apay_order) && g2apay_order['refund_status'] != 1) {
			if (this.config.get('payment_g2apay_environment') == 1) {
				url = 'https://pay.g2a.com/rest/transactions/' + g2apay_order['g2apay_transaction_id'];
			} else {
				url = 'https://www.test.pay.g2a.com/rest/transactions/' + g2apay_order['g2apay_transaction_id'];
			}

			refunded_amount = Math.round(amount, 2);

			string = g2apay_order['g2apay_transaction_id'] + g2apay_order['order_id'] + round(g2apay_order['total'], 2) + refunded_amount + html_entity_decode(this.config.get('payment_g2apay_secret'));
			hash = hash('sha256', string);

			fields = array(
				'action' : 'refund',
				'amount' : refunded_amount,
				'hash' : hash,
			});

			return this.sendCurl(url, fields);
		} else {
			return false;
		}
	}

	async updateRefundStatus(g2apay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "g2apay_order` SET `refund_status` = '" + status + "' WHERE `g2apay_order_id` = '" + g2apay_order_id + "'");
	}

	private function getTransactions(g2apay_order_id, currency_code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "g2apay_order_transaction` WHERE `g2apay_order_id` = '" + g2apay_order_id + "'");

		transactions = {};
		if (query.num_rows) {
			for (query.rows of row) {
				row['amount'] = this.currency.format(row['amount'], currency_code, true, true);
				transactions.push(row;
			}
			return transactions;
		} else {
			return false;
		}
	}

	async addTransaction(g2apay_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "g2apay_order_transaction` SET `g2apay_order_id` = '" + g2apay_order_id + "',`date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalRefunded(g2apay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "g2apay_order_transaction` WHERE `g2apay_order_id` = '" + g2apay_order_id + "' AND 'refund'");

		return query.row['total'];
	}

	async sendCurl(url, fields) {
		curl = curl_init(url);
		curl_setopt(curl, CURLOPT_URL, url);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt(curl, CURLOPT_CUSTOMREQUEST, "PUT");
		curl_setopt(curl, CURLOPT_POSTFIELDS, http_build_query(fields));

		auth_hash = hash('sha256', this.config.get('payment_g2apay_api_hash') + this.config.get('payment_g2apay_username') + html_entity_decode(this.config.get('payment_g2apay_secret')));
		authorization = this.config.get('payment_g2apay_api_hash') + ";" + auth_hash;
		curl_setopt(
				curl, CURLOPT_HTTPHEADER, array(
			"Authorization: " + authorization
				)
		});

		response = JSON.parse(curl_exec(curl));

		curl_close(curl);
		if (is_object(response)) {
			return response.status;
		} else {
			return str_replace('"', "", response);
		}
	}

	async logger(message) {
		if (this.config.get('payment_g2apay_debug') == 1) {
			log = new Log('g2apay.log');
			backtrace = debug_backtrace();
			log.write('Origin: ' + backtrace[6]['class'] + '::' + backtrace[6]['function']);
			log.write(print_r(message, 1));
		}
	}

}
