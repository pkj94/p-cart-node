const sha1 = require("locutus/php/strings/sha1");

module.exports = class ModelExtensionPaymentGlobalpayRemote extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}globalpay_remote_order\` (
			  \`globalpay_remote_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
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
			  PRIMARY KEY (\`globalpay_remote_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}globalpay_remote_order_transaction\` (
			  \`globalpay_remote_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`globalpay_remote_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`globalpay_remote_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async void(order_id) {
		const globalpay_order = await this.getOrder(order_id);

		if ((globalpay_order)) {
			let timestamp = date("YmdHis");
			let merchant_id = this.config.get('payment_globalpay_remote_merchant_id');
			let secret = this.config.get('payment_globalpay_remote_secret');

			await this.logger('Void hash construct: ' + timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '...');

			let tmp = timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '...';
			let hash = sha1(tmp);
			tmp = hash + '.' + secret;
			hash = sha1(tmp);

			let xml = '';
			xml += '<request type="void" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + globalpay_order['account'] + '</account>';
			xml += '<orderid>' + globalpay_order['order_ref'] + '</orderid>';
			xml += '<pasref>' + globalpay_order['pasref'] + '</pasref>';
			xml += '<authcode>' + globalpay_order['authcode'] + '</authcode>';
			xml += '<sha1hash>' + hash + '</sha1hash>';
			xml += '</request>';

			await this.logger('Void XML request:\r\n' + JSON.stringify(parseXmlString(xml), true));

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
				this.log('Error:', error);
				return null;
			}
		} else {
			return false;
		}
	}

	async updateVoidStatus(globalpay_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "globalpay_remote_order` SET `void_status` = '" + status + "' WHERE `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "'");
	}

	async capture(order_id, amount) {
		const globalpay_order = await this.getOrder(order_id);

		if ((globalpay_order) && globalpay_order['capture_status'] == 0) {
			let timestamp = date("YmdHis");
			let merchant_id = this.config.get('payment_globalpay_remote_merchant_id');
			let secret = this.config.get('payment_globalpay_remote_secret');
			let xml_amount = '', settle_type = '';
			if (globalpay_order['settle_type'] == 2) {
				await this.logger('Capture hash construct: ' + timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + globalpay_order['currency_code'] + '.');

				let tmp = timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + globalpay_order['currency_code'] + '.';
				let hash = sha1(tmp);
				tmp = hash + '.' + secret;
				hash = sha1(tmp);

				settle_type = 'multisettle';
				xml_amount = '<amount currency="' + globalpay_order['currency_code'] + '">' + Math.round(amount * 100) + '</amount>';
			} else {
				//this.logger('Capture hash construct: ' + timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '...');
				await this.logger('Capture hash construct: ' + timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + globalpay_order['currency_code'] + '.');

				let tmp = timestamp + '.' + merchant_id + '.' + globalpay_order['order_ref'] + '.' + Math.round(amount * 100) + '.' + globalpay_order['currency_code'] + '.';
				let hash = sha1(tmp);
				tmp = hash + '.' + secret;
				hash = sha1(tmp);

				settle_type = 'settle';
				xml_amount = '<amount currency="' + globalpay_order['currency_code'] + '">' + Math.round(amount * 100) + '</amount>';
			}

			let xml = '';
			xml += '<request type="' + settle_type + '" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + globalpay_order['account'] + '</account>';
			xml += '<orderid>' + globalpay_order['order_ref'] + '</orderid>';
			xml += xml_amount;
			xml += '<pasref>' + globalpay_order['pasref'] + '</pasref>';
			xml += '<authcode>' + globalpay_order['authcode'] + '</authcode>';
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

	async updateCaptureStatus(globalpay_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "globalpay_remote_order` SET `capture_status` = '" + status + "' WHERE `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "'");
	}

	async updateForRebate(globalpay_remote_order_id, pas_ref, order_ref) {
		await this.db.query("UPDATE `" + DB_PREFIX + "globalpay_remote_order` SET `order_ref_previous` = '_multisettle_" + this.db.escape(order_ref) + "', `pasref_previous` = '" + this.db.escape(pas_ref) + "' WHERE `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "' LIMIT 1");
	}

	async rebate(order_id, amount) {
		const globalpay_order = await this.getOrder(order_id);

		if ((globalpay_order) && globalpay_order['rebate_status'] != 1) {
			let timestamp = date("YmdHis");
			let merchant_id = this.config.get('payment_globalpay_remote_merchant_id');
			let secret = this.config.get('payment_globalpay_remote_secret');
			let pas_ref = '';
			let order_ref = '';
			if (globalpay_order['settle_type'] == 2) {
				order_ref = '_multisettle_' + globalpay_order['order_ref'];

				if (empty(globalpay_order['pasref_previous'])) {
					pas_ref = globalpay_order['pasref'];
				} else {
					pas_ref = globalpay_order['pasref_previous'];
				}
			} else {
				order_ref = globalpay_order['order_ref'];
				pas_ref = globalpay_order['pasref'];
			}

			await this.logger('Rebate hash construct: ' + timestamp + '.' + merchant_id + '.' + order_ref + '.' + Math.round(amount * 100) + '.' + globalpay_order['currency_code'] + '.');

			let tmp = timestamp + '.' + merchant_id + '.' + order_ref + '.' + Math.round(amount * 100) + '.' + globalpay_order['currency_code'] + '.';
			let hash = sha1(tmp);
			tmp = hash + '.' + secret;
			hash = sha1(tmp);

			let rebatehash = sha1(this.config.get('payment_globalpay_remote_rebate_password'));

			let xml = '';
			xml += '<request type="rebate" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + globalpay_order['account'] + '</account>';
			xml += '<orderid>' + order_ref + '</orderid>';
			xml += '<pasref>' + pas_ref + '</pasref>';
			xml += '<authcode>' + globalpay_order['authcode'] + '</authcode>';
			xml += '<amount currency="' + globalpay_order['currency_code'] + '">' + Math.round(amount * 100) + '</amount>';
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

	async updateRebateStatus(globalpay_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "globalpay_remote_order` SET `rebate_status` = '" + status + "' WHERE `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "'");
	}

	async getOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "globalpay_remote_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['globalpay_remote_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(globalpay_remote_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "globalpay_remote_order_transaction` WHERE `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(globalpay_remote_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "globalpay_remote_order_transaction` SET `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async logger(message) {
		if (this.config.get('payment_globalpay_remote_debug') == 1) {
			const log = new Log('globalpay_remote.log');
			log.write(message);
		}
	}

	async getTotalCaptured(globalpay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "globalpay_remote_order_transaction` WHERE `globalpay_remote_order_id` = '" + globalpay_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(globalpay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "globalpay_remote_order_transaction` WHERE `globalpay_remote_order_id` = '" + globalpay_order_id + "' AND 'rebate'");

		return query.row['total'];
	}
}