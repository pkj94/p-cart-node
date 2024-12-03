module.exports = class ModelExtensionPaymentCardConnect extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}cardconnect_card\` (
			  \`cardconnect_card_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`cardconnect_order_id\` INT(11) NOT NULL DEFAULT '0',
			  \`customer_id\` INT(11) NOT NULL DEFAULT '0',
			  \`profileid\` VARCHAR(16) NOT NULL DEFAULT '',
			  \`token\` VARCHAR(19) NOT NULL DEFAULT '',
			  \`type\` VARCHAR(50) NOT NULL DEFAULT '',
			  \`account\` VARCHAR(4) NOT NULL DEFAULT '',
			  \`expiry\` VARCHAR(4) NOT NULL DEFAULT '',
			  \`date_added\` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
			  PRIMARY KEY (\`cardconnect_card_id\`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}cardconnect_order\` (
			  \`cardconnect_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL DEFAULT '0',
			  \`customer_id\` INT(11) NOT NULL DEFAULT '0',
			  \`payment_method\` VARCHAR(255) NOT NULL DEFAULT '',
			  \`retref\` VARCHAR(12) NOT NULL DEFAULT '',
			  \`authcode\` VARCHAR(6) NOT NULL DEFAULT '',
			  \`currency_code\` VARCHAR(3) NOT NULL DEFAULT '',
			  \`total\` DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
			  \`date_added\` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
			  PRIMARY KEY (\`cardconnect_order_id\`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}cardconnect_order_transaction\` (
			  \`cardconnect_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`cardconnect_order_id\` INT(11) NOT NULL DEFAULT '0',
			  \`type\` VARCHAR(50) NOT NULL DEFAULT '',
			  \`retref\` VARCHAR(12) NOT NULL DEFAULT '',
			  \`amount\` DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
			  \`status\` VARCHAR(255) NOT NULL DEFAULT '',
			  \`date_modified\` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
			  \`date_added\` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
			  PRIMARY KEY (\`cardconnect_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "cardconnect_card`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "cardconnect_order`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "cardconnect_order_transaction`");

		this.log('Module uninstalled');
	}

	async getOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardconnect_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (query.num_rows) {
			const order = query.row;

			order['transactions'] = this.getTransactions(order['cardconnect_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(cardconnect_order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardconnect_order_transaction` WHERE `cardconnect_order_id` = '" + cardconnect_order_id + "'");

		if (query.num_rows) {
			return query.rows;
		} else {
			return {};
		}
	}

	async getTotalCaptured(cardconnect_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "cardconnect_order_transaction` WHERE `cardconnect_order_id` = '" + cardconnect_order_id + "' AND (`type` = 'payment' OR `type` = 'refund')");

		return query.row['total'];
	}

	async inquire(orderInfo, retref) {
		this.log('Posting inquire to CardConnect');
		this.log('Order ID: ' + orderInfo.order_id);

		const url = `https://${this.config.cardconnect_site}.cardconnect.com:${this.config.cardconnect_environment === 'live' ? 8443 : 6443}/cardconnect/rest/inquire/${retref}/${this.config.payment_cardconnect_merchant_id}`;

		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${Buffer.from(`${this.config.cardconnect_api_username}:${this.config.cardconnect_api_password}`).toString('base64')}`
		};

		this.log('Header: ' + JSON.stringify(headers, null, 2));
		this.log('URL: ' + url);

		try {
			const response = await require('axios').get(url, {
				headers: headers,
				timeout: 30000,
			});

			const responseData = response.data;
			this.log('Response: ' + JSON.stringify(responseData, null, 2));
			return responseData;
		} catch (error) {
			this.log('Error: ' + error.message);
			return null;
		}
	}

	async capture(order_info, amount) {
		this.load.model('sale/order', this);

		this.log('Posting capture to CardConnect');

		this.log('Order ID: ' + order_info['order_id']);

		const order = await this.model_sale_order.getOrder(order_info['order_id']);

		const totals = await this.model_sale_order.getOrderTotals(order_info['order_id']);

		let shipping_cost = '';

		for (let total of totals) {
			if (total['code'] == 'shipping') {
				shipping_cost = total['value'];
			}
		}

		const products = await this.model_sale_order.getOrderProducts(order_info['order_id']);

		const items = [];

		let i = 1;

		for (let product of products) {
			items.push({
				'lineno': i,
				'material': '',
				'description': product['name'],
				'upc': '',
				'quantity': product['quantity'],
				'uom': '',
				'unitcost': product['price'],
				'netamnt': product['total'],
				'taxamnt': product['tax'],
				'discamnt': ''
			});

			i++;
		}

		const data = {
			'merchid': this.config.get('payment_cardconnect_merchant_id'),
			'retref': order_info['retref'],
			'authcode': order_info['authcode'],
			'ponumber': order_info['order_id'],
			'amount': Math.round(amount, 2),
			'currency': order_info['currency_code'],
			'frtamnt': shipping_cost,
			'dutyamnt': '',
			'orderdate': '',
			'shiptozip': order['shipping_postcode'],
			'shipfromzip': '',
			'shiptocountry': order['shipping_iso_code_2'],
			'Items': items
		};

		const data_json = JSON.stringify(data);

		let url = 'https://' + this.config.get('cardconnect_site') + '.cardconnect.com:' + ((this.config.get('cardconnect_environment') == 'live') ? 8443 : 6443) + '/cardconnect/rest/capture';

		const headers = {
			'Content-Type': 'application/json',
			'Content-length': data_json.length,
			'Authorization': `Basic ${Buffer.from(`${this.config.cardconnect_api_username}:${this.config.cardconnect_api_password}`).toString('base64')}`
		};
		await this.model_extension_payment_cardconnect.log('Header: ' + JSON.stringify(header, true));

		await this.model_extension_payment_cardconnect.log('Post Data: ' + JSON.stringify(data, true));

		await this.model_extension_payment_cardconnect.log('URL: ' + url);

		try {
			const response = await require('axios').put(url, data, {
				headers: headers,
				timeout: 30000,
			});

			const responseData = response.data;
			this.log('Response: ' + JSON.stringify(responseData, null, 2));
			return responseData;
		} catch (error) {
			this.log('Error: ' + error.message);
			return null;
		}
	}

	async refund(order_info, amount) {
		this.log('Posting refund to CardConnect');

		this.log('Order ID: ' + order_info['order_id']);

		const data = {
			'merchid': this.config.get('payment_cardconnect_merchant_id'),
			'amount': Math.round(floatval(amount), 2, PHP_ROUND_HALF_DOWN),
			'currency': order_info['currency_code'],
			'retref': order_info['retref']
		};

		const data_json = JSON.stringify(data);

		const url = 'https://' + this.config.get('cardconnect_site') + '.cardconnect.com:' + ((this.config.get('cardconnect_environment') == 'live') ? 8443 : 6443) + '/cardconnect/rest/refund';

		const headers = {
			'Content-Type': 'application/json',
			'Content-length': data_json.length,
			'Authorization': `Basic ${Buffer.from(`${this.config.cardconnect_api_username}:${this.config.cardconnect_api_password}`).toString('base64')}`
		};

		await this.model_extension_payment_cardconnect.log('Header: ' + JSON.stringify(header, true));

		await this.model_extension_payment_cardconnect.log('Post Data: ' + JSON.stringify(data, true));

		await this.model_extension_payment_cardconnect.log('URL: ' + url);

		try {
			const response = await require('axios').put(url, data, {
				headers: headers,
				timeout: 30000,
			});

			const responseData = response.data;
			this.log('Response: ' + JSON.stringify(responseData, null, 2));
			return responseData;
		} catch (error) {
			this.log('Error: ' + error.message);
			return null;
		}
	}

	async void(order_info, retref) {
		this.log('Posting void to CardConnect');

		this.log('Order ID: ' + order_info['order_id']);

		const data = {
			'merchid': this.config.get('payment_cardconnect_merchant_id'),
			'amount': 0,
			'currency': order_info['currency_code'],
			'retref': retref
		};

		const data_json = JSON.stringify(data);

		let url = 'https://' + this.config.get('cardconnect_site') + '.cardconnect.com:' + ((this.config.get('cardconnect_environment') == 'live') ? 8443 : 6443) + '/cardconnect/rest/void';

		const headers = {
			'Content-Type': 'application/json',
			'Content-length': data_json.length,
			'Authorization': `Basic ${Buffer.from(`${this.config.cardconnect_api_username}:${this.config.cardconnect_api_password}`).toString('base64')}`
		};

		await this.model_extension_payment_cardconnect.log('Header: ' + JSON.stringify(header, true));

		await this.model_extension_payment_cardconnect.log('Post Data: ' + JSON.stringify(data, true));

		await this.model_extension_payment_cardconnect.log('URL: ' + url);
		try {
			const response = await require('axios').put(url, data, {
				headers: headers,
				timeout: 30000,
			});

			const responseData = response.data;
			this.log('Response: ' + JSON.stringify(responseData, null, 2));
			return responseData;
		} catch (error) {
			this.log('Error: ' + error.message);
			await this.model_extension_payment_cardconnect.log('cURL error: ' + error.message);

			return null;
		}
	}

	async updateTransactionStatusByRetref(retref, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "cardconnect_order_transaction` SET `status` = '" + this.db.escape(status) + "', `date_modified` = NOW() WHERE `retref` = '" + this.db.escape(retref) + "'");
	}

	async addTransaction(cardconnect_order_id, type, retref, amount, status) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_order_transaction` SET `cardconnect_order_id` = '" + cardconnect_order_id + "', `type` = '" + this.db.escape(type) + "', `retref` = '" + this.db.escape(retref) + "', `amount` = '" + amount + "', `status` = '" + this.db.escape(status) + "', `date_modified` = NOW(), `date_added` = NOW()");
	}

	async log(data) {
		if (this.config.get('cardconnect_logging')) {
			const log = new Log('cardconnect.log');

			log.write(data);
		}
	}
}