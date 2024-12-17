module.exports = class CardinityClient {
	constructor(config, dbConfig, logger) {
		this.config = config;
		this.db = mysql.createConnection(dbConfig);
		this.logger = logger;
	}

	async addOrder(data) {
		await this.db.query('INSERT INTO cardinity_order (order_id, payment_id) VALUES ("' + data.order_id + '", "' + data.payment_id + '")');
	}

	async getOrder(order_id) {
		const sql = await this.db.query('SELECT * FROM cardinity_order WHERE order_id = "' + order_id + '" LIMIT 1');

		return sql.row
	}

	async createPayment(key, secret, payment_data) {
		const url = 'https://api.cardinity.com/v1/payments';
		const auth = Buffer.from(`${key}:${secret}`).toString('base64');

		try {
			const response = await require('axios').post(url, payment_data, {
				headers: {
					'Authorization': `Basic ${auth}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			this.exception(error);
			throw error;
		}
	}

	async finalizePayment(key, secret, payment_id, pares) {
		const url = `https://api.cardinity.com/v1/payments/${payment_id}/finalize`;
		const auth = Buffer.from(`${key}:${secret}`).toString('base64');
		const data = { pares };

		try {
			const response = await require('axios').post(url, data, {
				headers: {
					'Authorization': `Basic ${auth}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			this.exception(error);
			return false;
		}
	}

	async getMethod(address, total) {
		await this.load.language('extension/payment/cardinity');
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_cardinity_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (this.config.get('payment_cardinity_total') > 0 && this.config.get('payment_cardinity_total') > total) {
			status = false;
		} else if (!this.config.get('payment_cardinity_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}
		if (!(this.getSupportedCurrencies()).includes(this.session.data['currency'])) {
			status = false;
		}
		let method_data = {};
		if (status) {
			method_data = {
				'code': 'cardinity',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_cardinity_sort_order')
			};
		}
		return method_data;
	}

	getSupportedCurrencies() {
		return ['USD', 'GBP', 'EUR'];
	}

	cardinityLog(data, class_step = 6, function_step = 6) {
		if (this.config.get('payment_cardinity_debug')) {
			const stack = new Error().stack.split('\n').slice(class_step, function_step + 1).join('\n');
			const log = new Log('cardinity.log');
			log.write('(' + stack[class_step]['class'] + '::' + stack[function_step]['function'] + ') - ' + JSON.stringify(data, true));
		}
	}

	exception(error) {
		this.cardinityLog(error.message, 1, 2);

		if (error.response && error.response.data) {
			this.cardinityLog(error.response.data, 1, 2);
		}

		if (error.isAxiosError && error.response && error.response.data.errors) {
			error.response.data.errors.forEach(violation => {
				this.cardinityLog(violation.message, 1, 2);
			});
		}
	}
}