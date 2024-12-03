const sha1 = require('locutus/php/strings/sha1');

module.exports = class ModelExtensionPaymentRealexRemote extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}realex_remote_order\` (
			  \`realex_remote_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`order_ref\` CHAR(50) NOT NULL,
			  \`order_ref_previous\` CHAR(50) NOT NULL,
			  \`pasref\` VARCHAR(50) NOT NULL,
			  \`pasref_previous\` VARCHAR(50) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`capture_status\` INT(1) DEFAULT NULL,
			  \`void_status\` INT(1) DEFAULT NULL,
			  \`settle_type\` INT(1) DEFAULT NULL,
			  \`rebate_status\` INT(1) DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`authcode\` VARCHAR(30) NOT NULL,
			  \`account\` VARCHAR(30) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`realex_remote_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}realex_remote_order_transaction\` (
			  \`realex_remote_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`realex_remote_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`realex_remote_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async void(order_id) {
		const realex_order = await this.getOrder(order_id);

		if ((realex_order.order_ref)) {
			let timestamp = date("YmdHis");
			let merchant_id = this.config.get('payment_realex_remote_merchant_id');
			let secret = this.config.get('payment_realex_remote_secret');

			await this.logger('Void hash construct: ' + timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '...');

			let tmp = timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '...';
			let hash = sha1(tmp);
			tmp = hash + '.' + secret;
			hash = sha1(tmp);

			let xml = '';
			xml += '<request type="void" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + realex_order['account'] + '</account>';
			xml += '<orderid>' + realex_order['order_ref'] + '</orderid>';
			xml += '<pasref>' + realex_order['pasref'] + '</pasref>';
			xml += '<authcode>' + realex_order['authcode'] + '</authcode>';
			xml += '<sha1hash>' + hash + '</sha1hash>';
			xml += '</request>';

			await this.logger('Void XML request:\r\n' + JSON.stringify(await parseXmlString(xml), true));

			try {
				const response = await require('axios').post("https://epage.payandshop.com/epage-remote.cgi", xml, {
					headers: {
						'Content-Type': 'text/xml'
					},
					httpsAgent: "OpenCart " + VERSION,
					timeout: 60000,
				});
				return await parseXmlString(response.data);
			} catch (error) {
				await this.logger('Error:', error);
				return null;
			}
		} else {
			return false;
		}
	}

	async updateVoidStatus(realex_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "realex_remote_order` SET `void_status` = '" + status + "' WHERE `realex_remote_order_id` = '" + realex_remote_order_id + "'");
	}

	async capture(order_id, amount) {
		const realex_order = await this.getOrder(order_id);

		if ((realex_order) && realex_order['capture_status'] == 0) {
			let timestamp = date("YmdHis");
			let merchant_id = this.config.get('payment_realex_remote_merchant_id');
			let secret = this.config.get('payment_realex_remote_secret');
			let hash = '', settle_type = '', xml_amount = '';
			if (realex_order['settle_type'] == 2) {
				await this.logger('Capture hash construct: ' + timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + realex_order['currency_code'] + '.');

				let tmp = timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + realex_order['currency_code'] + '.';
				hash = sha1(tmp);
				tmp = hash + '.' + secret;
				hash = sha1(tmp);

				settle_type = 'multisettle';
				xml_amount = '<amount currency="' + realex_order['currency_code'] + '">' + Math.round(amount * 100) + '</amount>';
			} else {
				//this.logger('Capture hash construct: ' + timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '...');
				await this.logger('Capture hash construct: ' + timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + realex_order['currency_code'] + '.');

				let tmp = timestamp + '.' + merchant_id + '.' + realex_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + realex_order['currency_code'] + '.';
				hash = sha1(tmp);
				tmp = hash + '.' + secret;
				hash = sha1(tmp);

				settle_type = 'settle';
				xml_amount = '<amount currency="' + realex_order['currency_code'] + '">' + Math.round(amount * 100) + '</amount>';
			}

			let xml = '';
			xml += '<request type="' + settle_type + '" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + realex_order['account'] + '</account>';
			xml += '<orderid>' + realex_order['order_ref'] + '</orderid>';
			xml += xml_amount;
			xml += '<pasref>' + realex_order['pasref'] + '</pasref>';
			xml += '<authcode>' + realex_order['authcode'] + '</authcode>';
			xml += '<sha1hash>' + hash + '</sha1hash>';
			xml += '</request>';

			await this.logger('Settle XML request:\r\n' + JSON.stringify(await parseXmlString(xml), true));
			try {
				const response = await require('axios').post("https://epage.payandshop.com/epage-remote.cgi", xml, {
					headers: {
						'Content-Type': 'text/xml'
					},
					httpsAgent: "OpenCart " + VERSION,
					timeout: 60000,
				});
				return await parseXmlString(response.data);
			} catch (error) {
				await this.logger('Error:', error);
				return null;
			}
		} else {
			return false;
		}
	}

	async updateCaptureStatus(realex_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "realex_remote_order` SET `capture_status` = '" + status + "' WHERE `realex_remote_order_id` = '" + realex_remote_order_id + "'");
	}

	async updateForRebate(realex_remote_order_id, pas_ref, order_ref) {
		await this.db.query("UPDATE `" + DB_PREFIX + "realex_remote_order` SET `order_ref_previous` = '_multisettle_" + this.db.escape(order_ref) + "', `pasref_previous` = '" + this.db.escape(pas_ref) + "' WHERE `realex_remote_order_id` = '" + realex_remote_order_id + "' LIMIT 1");
	}

	async rebate(order_id, amount) {
		const realex_order = await this.getOrder(order_id);

		if ((realex_order) && realex_order['rebate_status'] != 1) {
			let timestamp = date("YmdHis");
			let merchant_id = this.config.get('payment_realex_remote_merchant_id');
			let secret = this.config.get('payment_realex_remote_secret');
			let order_ref = '', pas_ref = '';
			if (realex_order['settle_type'] == 2) {
				order_ref = '_multisettle_' + realex_order['order_ref'];

				if (empty(realex_order['pasref_previous'])) {
					pas_ref = realex_order['pasref'];
				} else {
					pas_ref = realex_order['pasref_previous'];
				}
			} else {
				order_ref = realex_order['order_ref'];
				pas_ref = realex_order['pasref'];
			}

			await this.logger('Rebate hash construct: ' + timestamp + '.' + merchant_id + '.' + order_ref + '.' + Math.round(amount * 100) + '.' + realex_order['currency_code'] + '.');

			let tmp = timestamp + '.' + merchant_id + '.' + order_ref + '.' + Math.round(amount * 100) + '.' + realex_order['currency_code'] + '.';
			let hash = sha1(tmp);
			tmp = hash + '.' + secret;
			hash = sha1(tmp);

			let rebatehash = sha1(this.config.get('payment_realex_remote_rebate_password'));

			let xml = '';
			xml += '<request type="rebate" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + realex_order['account'] + '</account>';
			xml += '<orderid>' + order_ref + '</orderid>';
			xml += '<pasref>' + pas_ref + '</pasref>';
			xml += '<authcode>' + realex_order['authcode'] + '</authcode>';
			xml += '<amount currency="' + realex_order['currency_code'] + '">' + Math.round(amount * 100) + '</amount>';
			xml += '<refundhash>' + rebatehash + '</refundhash>';
			xml += '<sha1hash>' + hash + '</sha1hash>';
			xml += '</request>';

			await this.logger('Rebate XML request:\r\n' + JSON.stringify(await parseXmlString(xml), true));
			try {
				const response = await require('axios').post("https://epage.payandshop.com/epage-remote.cgi", xml, {
					headers: {
						'Content-Type': 'text/xml'
					},
					httpsAgent: "OpenCart " + VERSION,
					timeout: 60000,
				});
				return await parseXmlString(response.data);
			} catch (error) {
				await this.logger('Error:', error);
				return null;
			}
		} else {
			return false;
		}
	}

	async updateRebateStatus(realex_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "realex_remote_order` SET `rebate_status` = '" + status + "' WHERE `realex_remote_order_id` = '" + realex_remote_order_id + "'");
	}

	async getOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "realex_remote_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = this.getTransactions(order['realex_remote_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(realex_remote_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "realex_remote_order_transaction` WHERE `realex_remote_order_id` = '" + realex_remote_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(realex_remote_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "realex_remote_order_transaction` SET `realex_remote_order_id` = '" + realex_remote_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async logger(message) {
		if (this.config.get('payment_realex_remote_debug') == 1) {
			const log = new Log('realex_remote.log');
			log.write(message);
		}
	}

	async getTotalCaptured(realex_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "realex_remote_order_transaction` WHERE `realex_remote_order_id` = '" + realex_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(realex_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "realex_remote_order_transaction` WHERE `realex_remote_order_id` = '" + realex_order_id + "' AND 'rebate'");

		return query.row['total'];
	}
}