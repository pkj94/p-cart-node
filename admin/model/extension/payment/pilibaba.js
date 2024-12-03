module.exports = class ModelExtensionPaymentPilibaba extends Model {
	async install() {
		await this.db.query(`CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}pilibaba_order\` (
			\`pilibaba_order_id\` int(11) NOT NULL AUTO_INCREMENT,
			\`order_id\` int(11) NOT NULL DEFAULT '0',
			\`amount\` double NOT NULL,
			\`fee\` double NOT NULL,
			\`tracking\` VARCHAR(50) NOT NULL DEFAULT '',
			\`date_added\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY (\`pilibaba_order_id\`)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "pilibaba_order`");

		await this.disablePiliExpress();

		await this.log('Module uninstalled');
	}

	async getCurrencies() {
		try {
			const response = await require('axios').get('http://www.pilibaba.com/pilipay/getCurrency', {
				timeout: 30000, // 30 seconds timeout 
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching currencies:', error);
			return null;
		}
	}

	async getWarehouses() {
		try {
			const response = await require('axios').get('http://www.pilibaba.com/pilipay/getAddressList', {
				timeout: 30000, // 30 seconds timeout 
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching currencies:', error);
			return null;
		}
	}


	async getOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "pilibaba_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (query.num_rows) {
			return query.row;
		} else {
			return false;
		}
	}

	async register(email, password, currency, warehouse, country, environment) {
		await this.log('Posting register');

		if (warehouse == 'other') {
			warehouse = '';
		}

		if (warehouse) {
			country = '';
		}
		let url = '';
		if (environment == 'live') {
			url = 'http://en.pilibaba.com/autoRegist';
		} else {
			url = 'http://preen.pilibaba.com/autoRegist';
		}

		await this.log('URL: ' + url);

		let app_secret = md5(((warehouse) ? warehouse : country) + '0210000574' + '0b8l3ww5' + currency + email + md5(password)).toUpperCase();

		let data = {
			'platformNo': '0210000574',
			'appSecret': app_secret,
			'email': email,
			'password': md5(password),
			'currency': currency,
			'logistics': warehouse,
			'countryCode': country
		};

		await this.log('Data: ' + JSON.stringify(data, true));
		try {
			let curl = await require('axios').post(url, data, {
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				timeout: 30000
			})
			return curl.data;
		} catch (e) {
			await this.log('cURL error: ' + JSON.stringify(e, true));
		}
	}

	async updateTrackingNumber(order_id, tracking_number, merchant_number) {
		await this.log('Posting tracking');

		let sign_msg = md5(order_id + tracking_number + merchant_number + this.config.get('payment_pilibaba_secret_key')).toUpperCase();
		let url = '';
		if (this.config.get('payment_pilibaba_environment') == 'live') {
			url = 'https://www.pilibaba.com/pilipay/updateTrackNo';
		} else {
			url = 'http://pre.pilibaba.com/pilipay/updateTrackNo';
		}

		url += '?orderNo=' + order_id + '&logisticsNo=' + tracking_number + '&merchantNo=' + merchant_number + '&signMsg=' + sign_msg;

		await this.log('URL: ' + url);
		try {
			let curl = await require('axios').get(url, {
				timeout: 30000
			})
			const response = curl.data;
		} catch (e) {
			await this.log('cURL error: ' + JSON.stringify(e, true));
		}

		await this.db.query("UPDATE `" + DB_PREFIX + "pilibaba_order` SET `tracking` = '" + this.db.escape(tracking_number) + "' WHERE `order_id` = '" + order_id + "'");

	}

	async enablePiliExpress() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension` WHERE `type` = 'shipping' AND `code` = 'pilibaba'");

		if (!query.num_rows) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "extension` SET `type` = 'shipping', `code` = 'pilibaba'");
		}
	}

	async disablePiliExpress() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "extension` WHERE `type` = 'shipping' AND `code` = 'pilibaba'");
	}

	async log(data) {
		if (this.config.has('payment_pilibaba_logging') && Number(this.config.get('payment_pilibaba_logging'))) {
			const log = new Log('pilibaba.log');

			awaitclog.write(data);
		}
	}
}