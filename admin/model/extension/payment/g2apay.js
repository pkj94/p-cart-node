module.exports = class ModelExtensionPaymentG2aPay extends Model {

	async install() {
		await this.db.query(`
			CREATE TABLE \`${DB_PREFIX}g2apay_order\` (
				\`g2apay_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
				\`order_id\` int(11) NOT NULL,
				\`g2apay_transaction_id\` varchar(255) NOT NULL,
				\`date_added\` DATETIME NOT NULL,
				\`modified\` DATETIME NOT NULL,
				\`refund_status\` INT(1) DEFAULT NULL,
				\`currency_code\` CHAR(3) NOT NULL,
				\`total\` DECIMAL( 10, 2 ) NOT NULL,
				KEY \`g2apay_transaction_id\` (\`g2apay_transaction_id\`),
				PRIMARY KEY \`g2apay_order_id\` (\`g2apay_order_id\`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
		`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}g2apay_order_transaction\` (
			  \`g2apay_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`g2apay_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('payment', 'refund') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`g2apay_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;
			`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "g2apay_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "g2apay_order_transaction`;");
	}

	async getOrder(order_id) {

		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "g2apay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['g2apay_order_id'], qry.row['currency_code']);
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
			let url = '';
			if (this.config.get('payment_g2apay_environment') == 1) {
				url = 'https://pay.g2a.com/rest/transactions/' + g2apay_order['g2apay_transaction_id'];
			} else {
				url = 'https://www.test.pay.g2a.com/rest/transactions/' + g2apay_order['g2apay_transaction_id'];
			}

			let refunded_amount = Math.round(amount, 2);

			let string = g2apay_order['g2apay_transaction_id'] + g2apay_order['order_id'] + Math.round(g2apay_order['total'], 2) + refunded_amount + html_entity_decode(this.config.get('payment_g2apay_secret'));
			let hash = hash('sha256', string);

			let fields = {
				'action': 'refund',
				'amount': refunded_amount,
				'hash': hash,
			};

			return await this.sendCurl(url, fields);
		} else {
			return false;
		}
	}

	async updateRefundStatus(g2apay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "g2apay_order` SET `refund_status` = '" + status + "' WHERE `g2apay_order_id` = '" + g2apay_order_id + "'");
	}

	async getTransactions(g2apay_order_id, currency_code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "g2apay_order_transaction` WHERE `g2apay_order_id` = '" + g2apay_order_id + "'");

		let transactions = [];
		if (query.num_rows) {
			for (let row of query.rows) {
				row['amount'] = this.currency.format(row['amount'], currency_code, true, true);
				transactions.push(row);
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


	async sendCurl(url, fields, config) {
		const authHash = require('crypto')
			.createHash('sha256')
			.update(config.payment_g2apay_api_hash + config.payment_g2apay_username + config.payment_g2apay_secret)
			.digest('hex');
		const authorization = `${config.payment_g2apay_api_hash};${authHash}`;

		try {
			const response = await require('axios').put(url, require('querystring').stringify(fields), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': authorization
				},
				timeout: 60000 // Adjust timeout as necessary
			});

			return response.data.status ? response.data.status : response.data.replace(/"/g, '');
		} catch (error) {
			console.error('Error making PUT request:', error);
			return null;
		}
	}


	async logger(message) {
		if (this.config.get('payment_g2apay_debug') == 1) {
			const log = new Log('g2apay.log');
			backtrace = getStackTrace();
			log.write('Origin: ' + backtrace[6]['class'] + '::' + backtrace[6]['function']);
			log.write(JSON.stringify(message, true));
		}
	}

}
