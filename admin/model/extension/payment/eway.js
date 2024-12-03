module.exports =
	class ModelExtensionPaymentEway extends Model {

		async install() {
			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}eway_order\` (
			  \`eway_order_id\` int(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` int(11) NOT NULL,
			  \`created\` DATETIME NOT NULL,
			  \`modified\` DATETIME NOT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`transaction_id\` VARCHAR(24) NOT NULL,
			  \`debug_data\` TEXT,
			  \`capture_status\` INT(1) DEFAULT NULL,
			  \`void_status\` INT(1) DEFAULT NULL,
			  \`refund_status\` INT(1) DEFAULT NULL,
			  PRIMARY KEY (\`eway_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}eway_transactions\` (
			  \`eway_order_transaction_id\` int(11) NOT NULL AUTO_INCREMENT,
			  \`eway_order_id\` int(11) NOT NULL,
			  \`transaction_id\` VARCHAR(24) NOT NULL,
			  \`created\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'refund', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`eway_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

			await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}eway_card\` (
			  \`card_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`customer_id\` INT(11) NOT NULL,
			  \`order_id\` INT(11) NOT NULL,
			  \`token\` VARCHAR(50) NOT NULL,
			  \`digits\` VARCHAR(4) NOT NULL,
			  \`expiry\` VARCHAR(5) NOT NULL,
			  \`type\` VARCHAR(50) NOT NULL,
			  PRIMARY KEY (\`card_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
		}

		async uninstall() {
			//await this.model_setting_setting.deleteSetting(this.request.get['extension']);
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "eway_order`;");
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "eway_transactions`;");
			await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "eway_card`;");
		}

		async getOrder(order_id) {
			const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "eway_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

			if (qry.num_rows) {
				const order = qry.row;
				order['transactions'] = this.getTransactions(order['eway_order_id']);
				return order;
			} else {
				return false;
			}
		}

		async addRefundRecord(order, result) {
			const transaction_id = result.TransactionID;
			const total_amount = result.Refund.TotalAmount / 100;
			const refund_amount = order['refund_amount'] + total_amount;

			if ((order['refund_transaction_id']) && (order['refund_transaction_id'])) {
				order['refund_transaction_id'] += ',';
			}
			order['refund_transaction_id'] += transaction_id;

			await this.db.query("UPDATE `" + DB_PREFIX + "eway_order` SET `modified` = NOW(), refund_amount = '" + refund_amount + "', `refund_transaction_id` = '" + this.db.escape(order['refund_transaction_id']) + "' WHERE eway_order_id = '" + order['eway_order_id'] + "'");
		}

		async capture(order_id, capture_amount, currency) {
			const eway_order = await this.getOrder(order_id);

			if (eway_order && capture_amount > 0) {

				const capture_data = {};
				capture_data.Payment = {};
				capture_data.Payment.TotalAmount = (Number(capture_amount.toFixed(2)) * 100);
				capture_data.Payment.CurrencyCode = currency;
				capture_data.TransactionID = eway_order['transaction_id'];
				let url = 'https://api.ewaypayments.com/CapturePayment';
				if (this.config.get('payment_eway_test')) {
					url = 'https://api.sandbox.ewaypayments.com/CapturePayment';
				} else {
					url = 'https://api.ewaypayments.com/CapturePayment';
				}

				const response = await this.sendCurl(url, capture_data);

				return response;

			} else {
				return false;
			}
		}

		async updateCaptureStatus(eway_order_id, status) {
			await this.db.query("UPDATE `" + DB_PREFIX + "eway_order` SET `capture_status` = '" + status + "' WHERE `eway_order_id` = '" + eway_order_id + "'");
		}

		async updateTransactionId(eway_order_id, transaction_id) {
			await this.db.query("UPDATE `" + DB_PREFIX + "eway_order` SET `transaction_id` = '" + transaction_id + "' WHERE `eway_order_id` = '" + eway_order_id + "'");
		}

		async void(order_id) {
			const eway_order = await this.getOrder(order_id);
			if (eway_order.eway_order_id) {

				const data = {};
				data.TransactionID = eway_order['transaction_id'];
				let url = 'https://api.ewaypayments.com/CancelAuthorisation';
				if (this.config.get('payment_eway_test')) {
					url = 'https://api.sandbox.ewaypayments.com/CancelAuthorisation';
				} else {
					url = 'https://api.ewaypayments.com/CancelAuthorisation';
				}

				const response = await this.sendCurl(url, data);

				return response;

			} else {
				return false;
			}
		}

		async updateVoidStatus(eway_order_id, status) {
			await this.db.query("UPDATE `" + DB_PREFIX + "eway_order` SET `void_status` = '" + status + "' WHERE `eway_order_id` = '" + eway_order_id + "'");
		}

		async refund(order_id, refund_amount) {
			const eway_order = await this.getOrder(order_id);

			if (eway_order.eway_order_id && refund_amount > 0) {

				const refund_data = {};
				refund_data.Refund = {};
				refund_data.Refund.TotalAmount = (Number(refund_amount.toFixed(2)) * 100);
				refund_data.Refund.TransactionID = eway_order['transaction_id'];
				refund_data.Refund.CurrencyCode = eway_order['currency_code'];
				let url = 'https://api.ewaypayments.com/Transaction/' + eway_order['transaction_id'] + '/Refund';
				if (this.config.get('payment_eway_test')) {
					url = 'https://api.sandbox.ewaypayments.com/Transaction/' + eway_order['transaction_id'] + '/Refund';
				} else {
					url = 'https://api.ewaypayments.com/Transaction/' + eway_order['transaction_id'] + '/Refund';
				}

				const response = await this.sendCurl(url, refund_data);

				return response;
			} else {
				return false;
			}
		}

		async updateRefundStatus(eway_order_id, status) {
			await this.db.query("UPDATE `" + DB_PREFIX + "eway_order` SET `refund_status` = '" + status + "' WHERE `eway_order_id` = '" + eway_order_id + "'");
		}

		async sendCurl(url, data) {
			ch = curl_init(url);

			const eway_username = html_entity_decode(this.config.get('payment_eway_username'));
			const eway_password = html_entity_decode(this.config.get('payment_eway_password'));

			try {
				const response = await require('axios').post(url, data, {
					headers: { 'Content-Type': 'application/json' },
					auth: {
						username: ewayUsername,
						password: ewayPassword
					},
					timeout: 60000, // 60 seconds timeout
				});
				return response.data;
			} catch (error) {
				const response = {}
				response.Errors = 'Error posting to eWAY:' + error.toSting();
				return response;
			}
		}

		async getTransactions(eway_order_id) {
			const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "eway_transactions` WHERE `eway_order_id` = '" + eway_order_id + "'");

			if (qry.num_rows) {
				return qry.rows;
			} else {
				return false;
			}
		}

		async addTransaction(eway_order_id, transactionid, type, total, currency) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "eway_transactions` SET `eway_order_id` = '" + eway_order_id + "', `created` = NOW(), `transaction_id` = '" + this.db.escape(transactionid) + "', `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(total, currency, false, false) + "'");
		}

		async getTotalCaptured(eway_order_id) {
			const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "eway_transactions` WHERE `eway_order_id` = '" + eway_order_id + "' AND `type` = 'payment' ");

			return query.row['total'];
		}

		async getTotalRefunded(eway_order_id) {
			const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "eway_transactions` WHERE `eway_order_id` = '" + eway_order_id + "' AND `type` = 'refund'");

			return query.row['total'];
		}

	}