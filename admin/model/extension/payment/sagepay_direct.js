const chr = require('locutus/php/strings/chr');
const explode = require('locutus/php/strings/explode');

module.exports = class ModelExtensionPaymentSagepayDirect extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}sagepay_direct_order\` (
			  \`sagepay_direct_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`VPSTxId\` VARCHAR(50),
			  \`VendorTxCode\` VARCHAR(50) NOT NULL,
			  \`SecurityKey\` CHAR(50) NOT NULL,
			  \`TxAuthNo\` INT(50),
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`release_status\` INT(1) DEFAULT NULL,
			  \`void_status\` INT(1) DEFAULT NULL,
			  \`settle_type\` INT(1) DEFAULT NULL,
			  \`rebate_status\` INT(1) DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  \`card_id\` INT(11),
			  PRIMARY KEY (\`sagepay_direct_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}sagepay_direct_order_transaction\` (
			  \`sagepay_direct_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`sagepay_direct_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`sagepay_direct_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}sagepay_direct_order_recurring\` (
			  \`sagepay_direct_order_recurring_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`order_recurring_id\` INT(11) NOT NULL,
			  \`VPSTxId\` VARCHAR(50),
			  \`VendorTxCode\` VARCHAR(50) NOT NULL,
			  \`SecurityKey\` CHAR(50) NOT NULL,
			  \`TxAuthNo\` INT(50),
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`next_payment\` DATETIME NOT NULL,
			  \`trial_end\` datetime DEFAULT NULL,
			  \`subscription_end\` datetime DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`sagepay_direct_order_recurring_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}sagepay_direct_card\` (
			  \`card_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`customer_id\` INT(11) NOT NULL,
			  \`token\` VARCHAR(50) NOT NULL,
			  \`digits\` VARCHAR(4) NOT NULL,
			  \`expiry\` VARCHAR(5) NOT NULL,
			  \`type\` VARCHAR(50) NOT NULL,
			  PRIMARY KEY (\`card_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "sagepay_direct_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "sagepay_direct_order_transaction`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "sagepay_direct_order_recurring`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "sagepay_direct_card`;");
	}

	async void(order_id) {
		const sagepay_direct_order = await this.getOrder(order_id);

		if ((sagepay_direct_order) && sagepay_direct_order['release_status'] == 0) {

			const void_data = {};
			let url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/void.vsp';
			if (this.config.get('payment_sagepay_direct_test') == 'live') {
				//				url = 'https://live.sagepay.com/gateway/service/void.vsp';
				url = 'https://live.opayo.eu.elavon.com/gateway/service/void.vsp';
				//				void_data['VPSProtocol'] = '3.00';
				void_data['VPSProtocol'] = '4.00';
			} else if (this.config.get('payment_sagepay_direct_test') == 'test') {
				//				url = 'https://test.sagepay.com/gateway/service/void.vsp';
				url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/void.vsp';
				//				void_data['VPSProtocol'] = '3.00';
				void_data['VPSProtocol'] = '4.00';
			}

			void_data['TxType'] = 'VOID';
			void_data['Vendor'] = this.config.get('payment_sagepay_direct_vendor');
			void_data['VendorTxCode'] = sagepay_direct_order['VendorTxCode'];
			void_data['VPSTxId'] = sagepay_direct_order['VPSTxId'];
			void_data['SecurityKey'] = sagepay_direct_order['SecurityKey'];
			void_data['TxAuthNo'] = sagepay_direct_order['TxAuthNo'];

			return await this.sendCurl(url, void_data);
		} else {
			return false;
		}
	}

	async updateVoidStatus(sagepay_direct_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "sagepay_direct_order` SET `void_status` = '" + status + "' WHERE `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "'");
	}

	async release(order_id, amount) {
		const sagepay_direct_order = await this.getOrder(order_id);
		const total_released = this.getTotalReleased(sagepay_direct_order['sagepay_direct_order_id']);

		if ((sagepay_direct_order) && sagepay_direct_order['release_status'] == 0 && (total_released + amount <= sagepay_direct_order['total'])) {
			const release_data = {};
			let url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/release.vsp';
			if (this.config.get('payment_sagepay_direct_test') == 'live') {
				//				url = 'https://live.sagepay.com/gateway/service/release.vsp';
				url = 'https://live.opayo.eu.elavon.com/gateway/service/release.vsp';
				//				release_data['VPSProtocol'] = '3.00';
				release_data['VPSProtocol'] = '4.00';
			} else if (this.config.get('payment_sagepay_direct_test') == 'test') {
				//				url = 'https://test.sagepay.com/gateway/service/release.vsp';
				url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/release.vsp';
				//				release_data['VPSProtocol'] = '3.00';
				release_data['VPSProtocol'] = '4.00';
			}

			release_data['TxType'] = 'RELEASE';
			release_data['Vendor'] = this.config.get('payment_sagepay_direct_vendor');
			release_data['VendorTxCode'] = sagepay_direct_order['VendorTxCode'];
			release_data['VPSTxId'] = sagepay_direct_order['VPSTxId'];
			release_data['SecurityKey'] = sagepay_direct_order['SecurityKey'];
			release_data['TxAuthNo'] = sagepay_direct_order['TxAuthNo'];
			release_data['Amount'] = amount;

			return await this.sendCurl(url, release_data);
		} else {
			return false;
		}
	}

	async updateReleaseStatus(sagepay_direct_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "sagepay_direct_order` SET `release_status` = '" + status + "' WHERE `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "'");
	}

	async rebate(order_id, amount) {
		const sagepay_direct_order = await this.getOrder(order_id);

		if ((sagepay_direct_order) && sagepay_direct_order['rebate_status'] != 1) {

			const refund_data = {};
			let url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/refund.vsp';
			if (this.config.get('payment_sagepay_direct_test') == 'live') {
				//				url = 'https://live.sagepay.com/gateway/service/refund.vsp';
				url = 'https://live.opayo.eu.elavon.com/gateway/service/refund.vsp';
				//				refund_data['VPSProtocol'] = '3.00';
				refund_data['VPSProtocol'] = '4.00';
			} else if (this.config.get('payment_sagepay_direct_test') == 'test') {
				//				url = 'https://test.sagepay.com/gateway/service/refund.vsp';
				url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/refund.vsp';
				//				refund_data['VPSProtocol'] = '3.00';
				refund_data['VPSProtocol'] = '4.00';
			}

			refund_data['TxType'] = 'REFUND';
			refund_data['Vendor'] = this.config.get('payment_sagepay_direct_vendor');
			refund_data['VendorTxCode'] = sagepay_direct_order['sagepay_direct_order_id'] + Math.random();
			refund_data['Amount'] = amount;
			refund_data['Currency'] = sagepay_direct_order['currency_code'];
			refund_data['Description'] = substr(this.config.get('config_name'), 0, 100);
			refund_data['RelatedVPSTxId'] = sagepay_direct_order['VPSTxId'];
			refund_data['RelatedVendorTxCode'] = sagepay_direct_order['VendorTxCode'];
			refund_data['RelatedSecurityKey'] = sagepay_direct_order['SecurityKey'];
			refund_data['RelatedTxAuthNo'] = sagepay_direct_order['TxAuthNo'];


			return await this.sendCurl(url, refund_data);
		} else {
			return false;
		}
	}

	async updateRebateStatus(sagepay_direct_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "sagepay_direct_order` SET `rebate_status` = '" + status + "' WHERE `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "'");
	}

	async getOrder(order_id) {

		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "sagepay_direct_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['sagepay_direct_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(sagepay_direct_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "sagepay_direct_order_transaction` WHERE `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(sagepay_direct_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "sagepay_direct_order_transaction` SET `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(sagepay_direct_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "sagepay_direct_order_transaction` WHERE `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(sagepay_direct_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "sagepay_direct_order_transaction` WHERE `sagepay_direct_order_id` = '" + sagepay_direct_order_id + "' AND 'rebate'");

		return query.row['total'];
	}

	async sendCurl(url, payment_data) {
		try {
			const curl = await require('axios').post(url, payment_data, {

			});
			const response = curl.data;

			const response_info = response.split(chr(10));
			const data = {};
			for (let [i, string] of Object.entries(response_info)) {
				if (string.indexOf('=') != -1) {
					let parts = explode('=', string, 2);
					data['RepeatResponseData_' + i][parts[0].trim()] = parts[1].trim();
				} else if (string.indexOf('=') != -1) {
					parts = explode('=', string, 2);
					data[parts[0].trim()] = parts[1].trim();
				}
			}
			return data;
		} catch (e) {
			this.logger("Curl error", e)
			return false
		}
	}

	async logger(title, data) {
		if (Number(this.config.get('payment_sagepay_direct_debug'))) {
			const log = new Log('sagepay_direct.log');
			log.write(title + ': ' + JSON.stringify(data, true));
		}
	}
}
