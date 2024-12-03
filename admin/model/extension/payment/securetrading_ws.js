module.exports = class ModelExtensionPaymentSecureTradingWs extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}securetrading_ws_order\` (
			  \`securetrading_ws_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`md\` varchar(1024) DEFAULT NULL,
			  \`transaction_reference\` varchar(127) DEFAULT NULL,
			  \`created\` DATETIME NOT NULL,
			  \`modified\` DATETIME NOT NULL,
			  \`release_status\` INT(1) DEFAULT NULL,
			  \`void_status\` INT(1) DEFAULT NULL,
			  \`settle_type\` INT(1) DEFAULT NULL,
			  \`rebate_status\` INT(1) DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`securetrading_ws_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}securetrading_ws_order_transaction\` (
			  \`securetrading_ws_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`securetrading_ws_order_id\` INT(11) NOT NULL,
			  \`created\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'reversed') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`securetrading_ws_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS " + DB_PREFIX + "securetrading_ws_order");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "securetrading_ws_order_transaction`;");
	}

	async void(order_id) {
		const securetrading_ws_order = await this.getOrder(order_id);

		if ((securetrading_ws_order) && securetrading_ws_order['release_status'] == 0) {
			const builder = new (require('xml2js')).Builder();
			const requestblock_xml = {
				requestblock: {
					$: { version: '3.67' },
					alias: this.config.get('payment_securetrading_ws_username'),
					request: {
						$: { type: 'TRANSACTIONUPDATE' },
						filter: {
							sitereference: this.config.get('payment_securetrading_ws_site_reference'),
							transactionreference: securetrading_ws_order['transaction_reference']
						},
						updates: {
							settlement: {
								settlestatus: 3
							}
						}
					}
				}
			};
			const xml = builder.buildObject(requestblock_xml);
			return await this.call(xml);
		} else {
			return false;
		}
	}

	async updateVoidStatus(securetrading_ws_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_ws_order` SET `void_status` = '" + status + "' WHERE `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "'");
	}


	async release(orderId, amount) {
		const securetradingWsOrder = await this.getOrder(orderId);
		const totalReleased = await this.getTotalReleased(securetradingWsOrder.securetrading_ws_order_id);

		if (securetradingWsOrder && securetradingWsOrder.release_status === 0 && totalReleased <= amount) {
			const builder = new (require('xml2js')).Builder();
			const requestBlock = {
				requestblock: {
					$: { version: '3.67' },
					alias: this.config.get('payment_securetrading_ws_username'),
					request: {
						$: { type: 'TRANSACTIONUPDATE' },
						filter: {
							sitereference: this.config.get('payment_securetrading_ws_site_reference'),
							transactionreference: securetradingWsOrder.transaction_reference
						},
						updates: {
							settlement: {
								settlestatus: 0,
								settlemainamount: {
									_: amount,
									$: { currencycode: securetradingWsOrder.currency_code }
								}
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

	async updateReleaseStatus(securetrading_ws_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_ws_order` SET `release_status` = '" + status + "' WHERE `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "'");
	}

	async updateForRebate(securetrading_ws_order_id, order_ref) {
		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_ws_order` SET `order_ref_previous` = '_multisettle_" + this.db.escape(order_ref) + "' WHERE `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "' LIMIT 1");
	}


	async rebate(orderId, refundedAmount) {
		const securetradingWsOrder = await this.getOrder(orderId);

		if (securetradingWsOrder && securetradingWsOrder.rebate_status !== 1) {
			const builder = new (require('xml2js')).Builder();
			const requestBlock = {
				requestblock: {
					$: { version: '3.67' },
					alias: this.config.get('payment_securetrading_ws_username'),
					request: {
						$: { type: 'REFUND' },
						merchant: {
							orderreference: orderId
						},
						operation: {
							accounttypedescription: 'ECOM',
							parenttransactionreference: securetradingWsOrder.transaction_reference,
							sitereference: this.config.get('payment_securetrading_ws_site_reference')
						},
						billing: {
							$: { currencycode: securetradingWsOrder.currency_code },
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
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "securetrading_ws_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['securetrading_ws_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(securetrading_ws_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "securetrading_ws_order_transaction` WHERE `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(securetrading_ws_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "securetrading_ws_order_transaction` SET `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "', `created` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(securetrading_ws_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "securetrading_ws_order_transaction` WHERE `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(securetrading_ws_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "securetrading_ws_order_transaction` WHERE `securetrading_ws_order_id` = '" + securetrading_ws_order_id + "' AND 'rebate'");

		return query.row['total'];
	}

	async increaseRefundedAmount(order_id, amount) {
		await this.db.query("UPDATE " + DB_PREFIX + "securetrading_ws_order SET refunded = refunded + " + amount + " WHERE order_id = " + order_id);
	}

	async getCsv(data) {
		const postData = {
			sitereferences: this.config.get('payment_securetrading_ws_site_reference'),
			startdate: data.date_from,
			enddate: data.date_to,
			accounttypedescriptions: 'ECOM',
			optionalfields: data.detail ? [
				'parenttransactionreference',
				'accounttypedescription',
				'requesttypedescription',
				'mainamount',
				'currencyiso3a',
				'errorcode',
				'authcode',
				'customerip',
				'fraudrating',
				'orderreference',
				'paymenttypedescription',
				'maskedpan',
				'expirydate',
				'settlestatus',
				'settlemainamount',
				'settleduedate',
				'securityresponsesecuritycode',
				'securityresponseaddress',
				'securityresponsepostcode',
				'billingprefixname',
				'billingfirstname',
				'billingmiddlename',
				'billinglastname',
				'billingpremise',
				'billingstreet',
				'billingtown',
				'billingcounty',
				'billingemail',
				'billingcountryiso2a',
				'billingpostcode',
				'billingtelephones',
				'customerprefixname',
				'customerfirstname',
				'customermiddlename',
				'customerlastname',
				'customerpremise',
				'customerstreet',
				'customertown',
				'customercounty',
				'customeremail',
				'customercountryiso2a',
				'customerpostcode',
				'customertelephones',
			] : [
				'orderreference',
				'currencyiso3a',
				'errorcode',
				'paymenttypedescription',
				'settlestatus',
				'requesttypedescription',
				'mainamount',
				'billingfirstname',
				'billinglastname',
			],
		};

		if (data.currency) {
			postData.currencyiso3as = data.currency;
		}

		if (data.status) {
			postData.errorcodes = data.status;
		}

		if (data.payment_type) {
			postData.paymenttypedescriptions = data.payment_type;
		}

		if (data.request) {
			postData.requesttypedescriptions = data.request;
		}

		if (data.settle_status) {
			postData.settlestatuss = data.settle_status;
		}

		try {
			const response = await require('axios').post('https://myst.securetrading.net/auto/transactions/transactionsearch', require('querystring').stringify(postData), {
				headers: {
					'User-Agent': 'OpenCart - Secure Trading WS',
					'Authorization': 'Basic ' + Buffer.from(`${this.config.get('payment_securetrading_ws_csv_username')}:${this.config.get('payment_securetrading_ws_csv_password')}`).toString('base64'),
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				timeout: 15000, // 15 seconds timeout
			});

			const responseData = response.data;

			if (!responseData || responseData === 'No records found for search') {
				return false;
			}

			if (responseData.includes('401 Authorization Required')) {
				return false;
			}

			return responseData;
		} catch (error) {
			this.logger('Secure Trading WS Axios Error:', error.message);
			return false;
		}
	}


	async encodePost(data) {
		const params = [];

		for (let [key, value] of Object.entries(data)) {
			if (Array.isArray(value)) {
				for (let v of value) {
					params.push(key + '=' + rawencodeURIComponent(v));
				}
			} else {
				params.push(key + '=' + rawencodeURIComponent(value));
			}
		}

		return params.join('&');
	}



	async call(data) {
		const url = 'https://webservices.securetrading.net/xml/';

		try {
			const response = await require('axios').post(url, data, {
				headers: {
					'User-Agent': 'OpenCart - Secure Trading WS',
					'Content-Length': Buffer.byteLength(data),
					'Authorization': 'Basic ' + Buffer.from(`${this.config.get('payment_securetrading_ws_username')}:${this.config.get('payment_securetrading_ws_password')}`).toString('base64'),
					'Content-Type': 'application/xml' // Ensure the correct content type for XML
				},
				timeout: 15000, // 15 seconds timeout
			});

			return response.data;
		} catch (error) {
			await this.logger('Secure Trading WS Axios Error:', error.message);
			return false;
		}
	}


	async logger(message) {
		const log = new Log('securetrading_ws.log');
		log.write(message);
	}
}