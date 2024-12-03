const JSON.stringify = require("locutus/php/var/JSON.stringify");

module.exports = class ModelExtensionPaymentBluePayHosted extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}bluepay_hosted_order\` (
			  \`bluepay_hosted_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`transaction_id\` VARCHAR(50),
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`release_status\` INT(1) DEFAULT 0,
			  \`void_status\` INT(1) DEFAULT 0,
			  \`rebate_status\` INT(1) DEFAULT 0,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`bluepay_hosted_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}bluepay_hosted_order_transaction\` (
			  \`bluepay_hosted_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`bluepay_hosted_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'rebate', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`bluepay_hosted_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}bluepay_hosted_card\` (
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
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "bluepay_hosted_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "bluepay_hosted_order_transaction`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "bluepay_hosted_card`;");
	}

	async void(order_id) {
		const bluepay_hosted_order = await this.getOrder(order_id);

		if ((bluepay_hosted_order.order_id) && bluepay_hosted_order['release_status'] == 1) {

			const void_data = {};

			void_data['MERCHANT'] = this.config.get('payment_bluepay_hosted_account_id');
			void_data["TRANSACTION_TYPE"] = 'VOID';
			void_data["MODE"] = this.config.get('payment_bluepay_hosted_test').toUpperCase();
			void_data["RRNO"] = bluepay_hosted_order['transaction_id'];

			void_data['APPROVED_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';
			void_data['DECLINED_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';
			void_data['MISSING_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';

			if ((this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : ''))) {
				void_data["REMOTE_IP"] = this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : '');
			}

			const tamper_proof_data = this.config.get('payment_bluepay_hosted_secret_key') + void_data['MERCHANT'] + void_data["TRANSACTION_TYPE"] + void_data["RRNO"] + void_data["MODE"];

			void_data["TAMPER_PROOF_SEAL"] = md5(tamper_proof_data);

			await this.logger('void_data:\r\n' + JSON.stringify(void_data, 1));

			const response_data = await this.sendCurl('https://secure.bluepay.com/interfaces/bp10emu', void_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateVoidStatus(bluepay_hosted_order_id, status) {
		await this.logger('bluepay_hosted_order_id:\r\n' + JSON.stringify(bluepay_hosted_order_id, 1));
		await this.logger('status:\r\n' + JSON.stringify(status, 1));
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_hosted_order` SET `void_status` = '" + status + "' WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "'");
	}

	async release(order_id, amount) {
		const bluepay_hosted_order = await this.getOrder(order_id);
		const total_released = await this.getTotalReleased(bluepay_hosted_order['bluepay_hosted_order_id']);

		if ((bluepay_hosted_order.order_id) && bluepay_hosted_order['release_status'] == 0 && (total_released + amount <= bluepay_hosted_order['total'])) {
			const release_data = {};

			release_data['MERCHANT'] = this.config.get('payment_bluepay_hosted_account_id');
			release_data["TRANSACTION_TYPE"] = 'CAPTURE';
			release_data["MODE"] = this.config.get('payment_bluepay_hosted_test').toUpperCase();
			release_data["RRNO"] = bluepay_hosted_order['transaction_id'];

			release_data['APPROVED_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';
			release_data['DECLINED_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';
			release_data['MISSING_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';

			if ((this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : ''))) {
				release_data["REMOTE_IP"] = this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : '');
			}

			const tamper_proof_data = this.config.get('payment_bluepay_hosted_secret_key') + release_data['MERCHANT'] + release_data["TRANSACTION_TYPE"] + release_data["RRNO"] + release_data["MODE"];

			release_data["TAMPER_PROOF_SEAL"] = md5(tamper_proof_data);

			const response_data = await this.sendCurl('https://secure.bluepay.com/interfaces/bp10emu', release_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateReleaseStatus(bluepay_hosted_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_hosted_order` SET `release_status` = '" + status + "' WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "'");
	}

	async rebate(order_id, amount) {
		const bluepay_hosted_order = await this.getOrder(order_id);

		if ((bluepay_hosted_order.order_id) && bluepay_hosted_order['rebate_status'] != 1) {
			const rebate_data = {};

			rebate_data['MERCHANT'] = this.config.get('payment_bluepay_hosted_account_id');
			rebate_data["TRANSACTION_TYPE"] = 'REFUND';
			rebate_data["MODE"] = this.config.get('payment_bluepay_hosted_test').toUpperCase();
			rebate_data["RRNO"] = bluepay_hosted_order['transaction_id'];
			rebate_data["AMOUNT"] = amount;
			rebate_data['APPROVED_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';
			rebate_data['DECLINED_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';
			rebate_data['MISSING_URL'] = HTTP_CATALOG + '?route=extension/payment/bluepay_hosted/adminCallback';

			if ((this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : ''))) {
				rebate_data["REMOTE_IP"] = this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : '');
			}

			const tamper_proof_data = this.config.get('payment_bluepay_hosted_secret_key') + rebate_data['MERCHANT'] + rebate_data["TRANSACTION_TYPE"] + rebate_data['AMOUNT'] + rebate_data["RRNO"] + rebate_data["MODE"];

			rebate_data["TAMPER_PROOF_SEAL"] = md5(tamper_proof_data);

			const response_data = await this.sendCurl('https://secure.bluepay.com/interfaces/bp10emu', rebate_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateRebateStatus(bluepay_hosted_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_hosted_order` SET `rebate_status` = '" + status + "' WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "'");
	}

	async updateTransactionId(bluepay_hosted_order_id, transaction_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_hosted_order` SET `transaction_id` = '" + transaction_id + "' WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "'");
	}

	async getOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_hosted_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			order = qry.row;
			order['transactions'] = await this.getTransactions(order['bluepay_hosted_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(bluepay_hosted_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_hosted_order_transaction` WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(bluepay_hosted_order_id, type, total) {
		await this.logger('type:\r\n' + JSON.stringify(type, 1));
		await this.logger('total:\r\n' + JSON.stringify(total, 1));
		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_hosted_order_transaction` SET `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(bluepay_hosted_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "bluepay_hosted_order_transaction` WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(bluepay_hosted_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "bluepay_hosted_order_transaction` WHERE `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "' AND 'rebate'");

		return query.row['total'];
	}

	async sendCurl(url, post_data) {
		const curl = await require('axios').post(url, post_data)
		response_data = curl.data;
		return typeof response_data === 'string' ? JSON.parse(response_data) : response_data;
	}

	async adminCallback() {
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(this.request.get);
	}

	async logger(message) {
		if (this.config.get('payment_bluepay_hosted_debug') == 1) {
			const log = new Log('bluepay_hosted.log');
			log.write(message);
		}
	}
}