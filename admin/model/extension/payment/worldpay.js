module.exports =
	class ModelExtensionPaymentWorldpay extends Model {

		async install() {
			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}worldpay_order\` (
			  \`worldpay_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`order_code\` VARCHAR(50),
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`refund_status\` INT(1) DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`worldpay_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}worldpay_order_transaction\` (
			  \`worldpay_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`worldpay_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('payment', 'refund') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`worldpay_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}worldpay_order_recurring\` (
			  \`worldpay_order_recurring_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`order_recurring_id\` INT(11) NOT NULL,
			  \`order_code\` VARCHAR(50),
			  \`token\` VARCHAR(50),
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`next_payment\` DATETIME NOT NULL,
			  \`trial_end\` datetime DEFAULT NULL,
			  \`subscription_end\` datetime DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`worldpay_order_recurring_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}worldpay_card\` (
			  \`card_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`customer_id\` INT(11) NOT NULL,
			  \`order_id\` INT(11) NOT NULL,
			  \`token\` VARCHAR(50) NOT NULL,
			  \`digits\` VARCHAR(22) NOT NULL,
			  \`expiry\` VARCHAR(5) NOT NULL,
			  \`type\` VARCHAR(50) NOT NULL,
			  PRIMARY KEY (\`card_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
		}

		async uninstall() {
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_order`;");
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_order_transaction`;");
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_order_recurring`;");
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "worldpay_card`;");
		}

		async refund(order_id, amount) {
			const worldpay_order = await this.getOrder(order_id);

			if ((worldpay_order) && worldpay_order['refund_status'] != 1) {
				order['refundAmount'] = (amount * 100);

				let url = worldpay_order['order_code'] + '/refund';

				const response_data = await this.sendCurl(url, order);

				return response_data;
			} else {
				return false;
			}
		}

		async updateRefundStatus(worldpay_order_id, status) {
			await this.db.query("UPDATE `" + DB_PREFIX + "worldpay_order` SET `refund_status` = '" + status + "' WHERE `worldpay_order_id` = '" + worldpay_order_id + "'");
		}

		async getOrder(order_id) {
			const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "worldpay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

			if (qry.num_rows) {
				const order = qry.row;
				order['transactions'] = await this.getTransactions(order['worldpay_order_id'], qry.row['currency_code']);

				return order;
			} else {
				return false;
			}
		}

		async getTransactions(worldpay_order_id, currency_code) {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "worldpay_order_transaction` WHERE `worldpay_order_id` = '" + worldpay_order_id + "'");

			const transactions = [];
			if (query.num_rows) {
				for (let row of query.rows) {
					row['amount'] = this.currency.format(row['amount'], currency_code, false);
					transactions.push(row);
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
			const json = JSON.stringify(order);

			try {
				const response = await axios.post(`https://api.worldpay.com/v1/orders/${url}`, json, {
					headers: {
						'Authorization': `Bearer ${this.config.payment_worldpay_service_key}`,
						'Content-Type': 'application/json',
						'Content-Length': json.length
					},
					timeout: 10000 // 10 seconds timeout
				});

				const result = response.data;
				const responseObj = {
					status: result.httpStatusCode || 'success',
					message: result.message,
					full_details: result
				};

				await this.logger('WorldpayAPI Response:', responseObj);
				return responseObj;
			} catch (error) {
				await this.logger('WorldpayAPI Error:', error.message);
				return { status: 'error', message: error.message, full_details: error.response?.data || null };
			}
		}


		async logger(message) {
			if (this.config.get('payment_worldpay_debug') == 1) {
				const log = new Log('worldpay.log');
				await log.write(message);
			}
		}

	}
