module.exports = class ModelExtensionPaymentSecureTradingPp extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}securetrading_pp_order\` (
			  \`securetrading_pp_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`transaction_reference\` varchar(127) DEFAULT NULL,
			  \`created\` DATETIME NOT NULL,
			  \`modified\` DATETIME NOT NULL,
			  \`release_status\` INT(1) DEFAULT NULL,
			  \`void_status\` INT(1) DEFAULT NULL,
			  \`settle_type\` INT(1) DEFAULT NULL,
			  \`rebate_status\` INT(1) DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`securetrading_pp_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;
			 `);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}securetrading_pp_order_transaction\` (
			  \`securetrading_pp_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`securetrading_pp_order_id\` INT(11) NOT NULL,
			  \`created\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'reversed') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`securetrading_pp_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS " + DB_PREFIX + "securetrading_pp_order");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "securetrading_pp_order_transaction`;");
	}


	async void(orderId) {
		const securetradingOrder = await this.getOrder(orderId);

		if (securetradingOrder && securetradingOrder.release_status === 0) {
			const builder = new (require('xml2js')).Builder();
			const requestBlock = {
				requestblock: {
					$: { version: '3.67' },
					alias: this.config.get('payment_securetrading_pp_webservice_username'),
					request: {
						$: { type: 'TRANSACTIONUPDATE' },
						filter: {
							sitereference: this.config.get('payment_securetrading_pp_site_reference'),
							transactionreference: securetradingOrder.transaction_reference
						},
						updates: {
							settlement: {
								settlestatus: 3
							}
						}
					}
				}
			};

			const xml = builder.buildObject(requestBlock);

			return await this.call(xml);
		} else {
			return false;
		}
	}


	async updateVoidStatus(securetrading_pp_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_pp_order` SET `void_status` = '" + status + "' WHERE `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "'");
	}



	async release(orderId, amount) {
		const securetradingOrder = await this.getOrder(orderId);

		if (securetradingOrder && securetradingOrder.release_status === 0) {
			const builder = new (require('xml2js')).Builder();
			const requestBlock = {
				requestblock: {
					$: { version: '3.67' },
					alias: this.config.get('payment_securetrading_pp_webservice_username'),
					request: {
						$: { type: 'TRANSACTIONUPDATE' },
						filter: {
							sitereference: this.config.get('payment_securetrading_pp_site_reference'),
							transactionreference: securetradingOrder.transaction_reference
						},
						updates: {
							settlement: {
								settlestatus: 0,
								settlebaseamount: amount
							}
						}
					}
				}
			};

			const xml = builder.buildObject(requestBlock);

			return await this.call(xml);
		} else {
			return false;
		}
	}

	async updateReleaseStatus(securetrading_pp_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_pp_order` SET `release_status` = '" + status + "' WHERE `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "'");
	}

	async updateForRebate(securetrading_pp_order_id, order_ref) {
		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_pp_order` SET `order_ref_previous` = '_multisettle_" + this.db.escape(order_ref) + "' WHERE `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "' LIMIT 1");
	}

	async rebate(orderId, refundedAmount) {
		const securetradingOrder = await this.getOrder(orderId);

		if (securetradingOrder && securetradingOrder.rebate_status !== 1) {
			const builder = new (require('xml2js')).Builder();
			const requestBlock = {
				requestblock: {
					$: { version: '3.67' },
					alias: this.config.get('payment_securetrading_pp_webservice_username'),
					request: {
						$: { type: 'REFUND' },
						merchant: {
							orderreference: orderId
						},
						operation: {
							accounttypedescription: 'ECOM',
							parenttransactionreference: securetradingOrder.transaction_reference,
							sitereference: this.config.get('payment_securetrading_pp_site_reference')
						},
						billing: {
							$: { currencycode: securetradingOrder.currency_code },
							amount: refundedAmount.replace('.', '')
						}
					}
				}
			};

			const xml = builder.buildObject(requestBlock);

			return await this.call(xml);
		} else {
			return false;
		}
	}


	async getOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "securetrading_pp_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['securetrading_pp_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(securetrading_pp_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "securetrading_pp_order_transaction` WHERE `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(securetrading_pp_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "securetrading_pp_order_transaction` SET `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "', `created` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(securetrading_pp_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "securetrading_pp_order_transaction` WHERE `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(securetrading_pp_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "securetrading_pp_order_transaction` WHERE `securetrading_pp_order_id` = '" + securetrading_pp_order_id + "' AND 'rebate'");

		return query.row['total'];
	}

	async increaseRefundedAmount(order_id, amount) {
		await this.db.query("UPDATE " + DB_PREFIX + "securetrading_pp_order SET refunded = refunded + " + amount + " WHERE order_id = " + order_id);
	}


	async call(data) {
		const url = 'https://webservices.securetrading.net/xml/';

		try {
			const response = await require('axios').post(url, data, {
				headers: {
					'User-Agent': 'OpenCart - Secure Trading PP',
					'Content-Length': Buffer.byteLength(require('querystring').stringify(data)),
					'Authorization': 'Basic ' + Buffer.from(`${this.config.get('payment_securetrading_pp_webservice_username')}:${this.config.get('payment_securetrading_pp_webservice_password')}`).toString('base64'),
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				timeout: 15000, // 15 seconds timeout
			});

			return response.data;
		} catch (error) {
			await this.logger('Secure Trading PP Axios Error:', error.message);
			return false;
		}
	}


	async logger(message) {
		const log = new Log('securetrading_pp.log');
		log.write(message);
	}
}