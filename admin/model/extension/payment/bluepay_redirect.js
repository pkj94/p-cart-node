module.exports = class ModelExtensionPaymentBluepayredirect extends Model {
	async install() {
		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "bluepay_redirect_order` (
			  `bluepay_redirect_order_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `order_id` INT(11) NOT NULL,
			  `transaction_id` VARCHAR(50),
			  `date_added` DATETIME NOT NULL,
			  `date_modified` DATETIME NOT NULL,
			  `release_status` INT(1) DEFAULT 0,
			  `void_status` INT(1) DEFAULT 0,
			  `rebate_status` INT(1) DEFAULT 0,
			  `currency_code` CHAR(3) NOT NULL,
			  `total` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`bluepay_redirect_order_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "bluepay_redirect_order_transaction` (
			  `bluepay_redirect_order_transaction_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `bluepay_redirect_order_id` INT(11) NOT NULL,
			  `date_added` DATETIME NOT NULL,
			  `type` ENUM('auth', 'payment', 'rebate', 'void') DEFAULT NULL,
			  `amount` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`bluepay_redirect_order_transaction_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "bluepay_redirect_card` (
			  `card_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `customer_id` INT(11) NOT NULL,
			  `token` VARCHAR(50) NOT NULL,
			  `digits` VARCHAR(4) NOT NULL,
			  `expiry` VARCHAR(5) NOT NULL,
			  `type` VARCHAR(50) NOT NULL,
			  PRIMARY KEY (`card_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "bluepay_redirect_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "bluepay_redirect_order_transaction`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "bluepay_redirect_card`;");
	}

	async void(order_id) {
		bluepay_redirect_order = this.getOrder(order_id);

		if ((bluepay_redirect_order) && bluepay_redirect_order['release_status'] == 1) {

			void_data = {};

			void_data['MERCHANT'] = this.config.get('payment_bluepay_redirect_account_id');
			void_data["TRANSACTION_TYPE"] = 'VOID';
			void_data["MODE"] = strtoupper(this.config.get('payment_bluepay_redirect_test'));
			void_data["RRNO"] = bluepay_redirect_order['transaction_id'];

			void_data['APPROVED_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';
			void_data['DECLINED_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';
			void_data['MISSING_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';

			if ((this.request.server["REMOTE_ADDR"])) {
				void_data["REMOTE_IP"] = this.request.server["REMOTE_ADDR"];
			}

			tamper_proof_data = this.config.get('payment_bluepay_redirect_secret_key') + void_data['MERCHANT'] + void_data["TRANSACTION_TYPE"] + void_data["RRNO"] + void_data["MODE"];

			void_data["TAMPER_PROOF_SEAL"] = md5(tamper_proof_data);

			response_data = this.sendCurl('https://secure.bluepay.com/interfaces/bp10emu', void_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateVoidStatus(bluepay_redirect_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_redirect_order` SET `void_status` = '" + status + "' WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");
	}

	async release(order_id, amount) {
		bluepay_redirect_order = this.getOrder(order_id);
		total_released = this.getTotalReleased(bluepay_redirect_order['bluepay_redirect_order_id']);

		if ((bluepay_redirect_order) && bluepay_redirect_order['release_status'] == 0 && (total_released + amount <= bluepay_redirect_order['total'])) {
			release_data = {};

			release_data['MERCHANT'] = this.config.get('payment_bluepay_redirect_account_id');
			release_data["TRANSACTION_TYPE"] = 'CAPTURE';
			release_data["MODE"] = strtoupper(this.config.get('payment_bluepay_redirect_test'));
			release_data["RRNO"] = bluepay_redirect_order['transaction_id'];
			release_data["AMOUNT"] = amount;
			release_data['APPROVED_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';
			release_data['DECLINED_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';
			release_data['MISSING_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';

			if ((this.request.server["REMOTE_ADDR"])) {
				release_data["REMOTE_IP"] = this.request.server["REMOTE_ADDR"];
			}

			tamper_proof_data = this.config.get('payment_bluepay_redirect_secret_key') + release_data['MERCHANT'] + release_data["TRANSACTION_TYPE"] + release_data["AMOUNT"] + release_data["RRNO"] + release_data["MODE"];

			release_data["TAMPER_PROOF_SEAL"] = md5(tamper_proof_data);

			response_data = this.sendCurl('https://secure.bluepay.com/interfaces/bp10emu', release_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateReleaseStatus(bluepay_redirect_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_redirect_order` SET `release_status` = '" + status + "' WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");
	}

	async rebate(order_id, amount) {
		bluepay_redirect_order = this.getOrder(order_id);

		if ((bluepay_redirect_order) && bluepay_redirect_order['rebate_status'] != 1) {
			rebate_data = {};

			rebate_data['MERCHANT'] = this.config.get('payment_bluepay_redirect_account_id');
			rebate_data["TRANSACTION_TYPE"] = 'REFUND';
			rebate_data["MODE"] = strtoupper(this.config.get('payment_bluepay_redirect_test'));
			rebate_data["RRNO"] = bluepay_redirect_order['transaction_id'];
			rebate_data["AMOUNT"] = amount;
			rebate_data['APPROVED_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';
			rebate_data['DECLINED_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';
			rebate_data['MISSING_URL'] = HTTP_CATALOG + 'index.php?route=extension/payment/bluepay_redirect/callback';

			if ((this.request.server["REMOTE_ADDR"])) {
				rebate_data["REMOTE_IP"] = this.request.server["REMOTE_ADDR"];
			}

			tamper_proof_data = this.config.get('payment_bluepay_redirect_secret_key') + rebate_data['MERCHANT'] + rebate_data["TRANSACTION_TYPE"] + rebate_data['AMOUNT'] + rebate_data["RRNO"] + rebate_data["MODE"];

			rebate_data["TAMPER_PROOF_SEAL"] = md5(tamper_proof_data);

			response_data = this.sendCurl('https://secure.bluepay.com/interfaces/bp10emu', rebate_data);

			return response_data;
		} else {
			return false;
		}
	}

	async updateRebateStatus(bluepay_redirect_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_redirect_order` SET `rebate_status` = '" + status + "' WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");
	}

	async updateTransactionId(bluepay_redirect_order_id, transaction_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "bluepay_redirect_order` SET `transaction_id` = '" + transaction_id + "' WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");
	}

	async getOrder(order_id) {

		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			order = qry.row;
			order['transactions'] = this.getTransactions(order['bluepay_redirect_order_id']);

			return order;
		} else {
			return false;
		}
	}

	private function getTransactions(bluepay_redirect_order_id) {
		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_order_transaction` WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(bluepay_redirect_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_redirect_order_transaction` SET `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async getTotalReleased(bluepay_redirect_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "bluepay_redirect_order_transaction` WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "' AND (`type` = 'payment' OR `type` = 'rebate')");

		return query.row['total'];
	}

	async getTotalRebated(bluepay_redirect_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "bluepay_redirect_order_transaction` WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "' AND 'rebate'");

		return query.row['total'];
	}

	async sendCurl(url, post_data) {
		curl = curl_init(url);

		curl_setopt(curl, CURLOPT_PORT, 443);
		curl_setopt(curl, CURLOPT_HEADER, 0);
		curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(curl, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt(curl, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(curl, CURLOPT_FRESH_CONNECT, 1);
		curl_setopt(curl, CURLOPT_POST, 1);
		curl_setopt(curl, CURLOPT_POSTFIELDS, http_build_query(post_data));

		response_data = curl_exec(curl);
		curl_close(curl);

		return JSON.parse(response_data, true);
	}

	async callback() {
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(this.request.get));
	}

	async logger(message) {
		if (this.config.get('payment_bluepay_redirect_debug') == 1) {
			log = new Log('bluepay_redirect.log');
			log.write(message);
		}
	}
}
