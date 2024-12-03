const array_replace_recursive = require("locutus/php/array/array_replace_recursive");

module.exports = class ModelExtensionPaymentOpayo extends Model {

	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}opayo_order\` (
			  \`opayo_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
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
			  PRIMARY KEY (\`opayo_order_id\`),
			  KEY (\`order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}opayo_order_transaction\` (
			  \`opayo_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`opayo_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`opayo_order_transaction_id\`),
			  KEY (\`opayo_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}opayo_order_recurring\` (
			  \`opayo_order_recurring_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`order_recurring_id\` INT(11) NOT NULL,
			  \`VPSTxId\` VARCHAR(50),
			  \`VendorTxCode\` VARCHAR(50) NOT NULL,
			  \`SecurityKey\` CHAR(50) NOT NULL,
			  \`TxAuthNo\` INT(50),
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`next_payment\` DATETIME NOT NULL,
			  \`trial_end\` DATETIME DEFAULT NULL,
			  \`subscription_end\` DATETIME DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`opayo_order_recurring_id\`),
			  KEY (\`order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}opayo_card\` (
			  \`card_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`customer_id\` INT(11) NOT NULL,
			  \`token\` VARCHAR(50) NOT NULL,
			  \`digits\` VARCHAR(4) NOT NULL,
			  \`expiry\` VARCHAR(5) NOT NULL,
			  \`type\` VARCHAR(50) NOT NULL,
			  PRIMARY KEY (\`card_id\`),
			  KEY (\`customer_id\`),
			  KEY (\`token\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "opayo_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "opayo_order_transaction`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "opayo_order_recurring`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "opayo_card`;");
	}

	async void(order_id) {
		const opayo_order = await this.getOrder(order_id);

		if ((opayo_order) && opayo_order['release_status'] == 0) {
			const void_data = {};

			// Setting
			const _config = new Config();
			await _config.load('opayo');

			const config_setting = _config.get('opayo_setting');

			let setting = array_replace_recursive(config_setting, this.config.get('payment_opayo_setting'));
			let url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/void.vsp';
			if (setting['general']['environment'] == 'live') {
				url = 'https://live.opayo.eu.elavon.com/gateway/service/void.vsp';
				void_data['VPSProtocol'] = '4.00';
			} else if (setting['general']['environment'] == 'test') {
				url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/void.vsp';
				void_data['VPSProtocol'] = '4.00';
			}

			void_data['TxType'] = 'VOID';
			void_data['Vendor'] = this.config.get('payment_opayo_vendor');
			void_data['VendorTxCode'] = opayo_order['VendorTxCode'];
			void_data['VPSTxId'] = opayo_order['VPSTxId'];
			void_data['SecurityKey'] = opayo_order['SecurityKey'];
			void_data['TxAuthNo'] = opayo_order['TxAuthNo'];

			const response_data = await this.sendCurl(url, void_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateVoidStatus(opayo_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "opayo_order` SET `void_status` = '" + status + "' WHERE `opayo_order_id` = '" + opayo_order_id + "'");
	}

	async release(order_id, amount) {
		const opayo_order = await this.getOrder(order_id);
		const total_released = await this.getTotalReleased(opayo_order['opayo_order_id']);

		if ((opayo_order) && opayo_order['release_status'] == 0 && (total_released + amount <= opayo_order['total'])) {
			const release_data = {};

			// Setting
			const _config = new Config();
			await _config.load('opayo');

			const config_setting = _config.get('opayo_setting');

			const setting = array_replace_recursive(config_setting, this.config.get('payment_opayo_setting'));
			let url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/release.vsp';

			if (setting['general']['environment'] == 'live') {
				url = 'https://live.opayo.eu.elavon.com/gateway/service/release.vsp';
				release_data['VPSProtocol'] = '4.00';
			} else if (setting['general']['environment'] == 'test') {
				url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/release.vsp';
				release_data['VPSProtocol'] = '4.00';
			}

			release_data['TxType'] = 'RELEASE';
			release_data['Vendor'] = this.config.get('payment_opayo_vendor');
			release_data['VendorTxCode'] = opayo_order['VendorTxCode'];
			release_data['VPSTxId'] = opayo_order['VPSTxId'];
			release_data['SecurityKey'] = opayo_order['SecurityKey'];
			release_data['TxAuthNo'] = opayo_order['TxAuthNo'];
			release_data['Amount'] = amount;

			const response_data = await this.sendCurl(url, release_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateReleaseStatus(opayo_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "opayo_order` SET `release_status` = '" + status + "' WHERE `opayo_order_id` = '" + opayo_order_id + "'");
	}

	async rebate(order_id, amount) {
		const opayo_order = await this.getOrder(order_id);

		if ((opayo_order) && opayo_order['rebate_status'] != 1) {
			const refund_data = {};

			// Setting
			const _config = new Config();
			await _config.load('opayo');

			const config_setting = _config.get('opayo_setting');

			const setting = array_replace_recursive(config_setting, this.config.get('payment_opayo_setting'));
			let url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/refund.vsp';
			if (setting['general']['environment'] == 'live') {
				url = 'https://live.opayo.eu.elavon.com/gateway/service/refund.vsp';
				refund_data['VPSProtocol'] = '4.00';
			} else if (setting['general']['environment'] == 'test') {
				url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/refund.vsp';
				refund_data['VPSProtocol'] = '4.00';
			}

			refund_data['TxType'] = 'REFUND';
			refund_data['Vendor'] = this.config.get('payment_opayo_vendor');
			refund_data['VendorTxCode'] = opayo_order['opayo_order_id'] + Math.random();
			refund_data['Amount'] = amount;
			refund_data['Currency'] = opayo_order['currency_code'];
			refund_data['Description'] = this.config.get('config_name').substr(0, 100);
			refund_data['RelatedVPSTxId'] = opayo_order['VPSTxId'];
			refund_data['RelatedVendorTxCode'] = opayo_order['VendorTxCode'];
			refund_data['RelatedSecurityKey'] = opayo_order['SecurityKey'];
			refund_data['RelatedTxAuthNo'] = opayo_order['TxAuthNo'];

			const response_data = await this.sendCurl(url, refund_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateRebateStatus(opayo_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "opayo_order` SET `rebate_status` = '" + status + "' WHERE `opayo_order_id` = '" + opayo_order_id + "'");
	}

	async getOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (query.num_rows) {
			const order = query.row;
			order['transactions'] = this.getOrderTransactions(order['opayo_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getOrderTransactions(opayo_order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_order_transaction` WHERE `opayo_order_id` = '" + opayo_order_id + "'");

		if (query.num_rows) {
			return query.rows;
		} else {
			return false;
		}
	}

	async addOrderTransaction(opayo_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "opayo_order_transaction` SET `opayo_order_id` = '" + opayo_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(opayo_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "opayo_order_transaction` WHERE `opayo_order_id` = '" + opayo_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(opayo_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "opayo_order_transaction` WHERE `opayo_order_id` = '" + opayo_order_id + "' AND 'rebate'");

		return query.row['total'];
	}

	async editRecurringStatus(order_recurring_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `status` = '" + status + "' WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}

	async sendCurl(url, paymentData) {
		try {
			const response = await axios.post(url, paymentData, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				timeout: 30000, // 30 seconds timeout
			});

			const responseData = response.data;
			const responseInfo = responseData.split('\n');
			const data = {};

			responseInfo.forEach((string) => {
				if (string.includes('=')) {
					const parts = string.split('=', 2);
					data[parts[0].trim()] = parts[1].trim();
				}
			});

			// console.log('Response:', data);
			return data;
		} catch (error) {
			console.error('cURL error:', error);
			return null;
		}
	}

	async log(title, data) {
		const _config = new Config();
		await _config.load('opayo');

		const config_setting = _config.get('opayo_setting');

		const setting = array_replace_recursive(config_setting, this.config.get('payment_opayo_setting'));

		if (setting['general']['debug']) {
			const log = new Log('opayo.log');

			await log.write(title + ': ' + JSON.stringify(data, true));
		}
	}
}
