module.exports = class ModelExtensionPaymentCardinity extends Model {

	async getOrder(orderId) {
		const query = await this.db.query("SELECT * FROM `cardinity_order` WHERE `order_id` = '" + orderId + "' LIMIT 1");
		return query.rows;
	}

	createClient(credentials) {
		return require('axios').create({
			baseURL: 'https://api.cardinity.com/v1',
			auth: {
				username: credentials.key,
				password: credentials.secret
			}
		});
	}

	async verifyCredentials(client) {
		try {
			const response = await client.get('/payments?page=1&limit=10');
			return response.status === 200;
		} catch (error) {
			this.log(error.message);
			return false;
		}
	}

	async getPayment(client, paymentId) {
		try {
			const response = await client.get(`/payments/${paymentId}`);
			return response.data;
		} catch (error) {
			this.log(error.message);
			return false;
		}
	}

	async getRefunds(client, paymentId) {
		try {
			const response = await client.get(`/payments/${paymentId}/refunds`);
			return response.data;
		} catch (error) {
			this.log(error.message);
			return false;
		}
	}

	async refundPayment(client, paymentId, amount, description) {
		try {
			const response = await client.post(`/payments/${paymentId}/refunds`, { amount, description });
			return response.data;
		} catch (error) {
			this.log(error.message);
			return false;
		}
	}

	log(data) {
		if (this.config.get('payment_cardinity_debug')) {
			const backtrace = getStackTrace();
			const log = new Log('cardinity.log');
			log.write('(' + backtrace[1]['class'] + '::' + backtrace[1]['function'] + ') - ' + JSON.stringify(data, true));
		}
	}

	async install() {
		await this.db.query(`
      CREATE TABLE IF NOT EXISTS \`cardinity_order\` (
        \`cardinity_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`order_id\` INT(11) NOT NULL,
        \`payment_id\` VARCHAR(255),
        PRIMARY KEY (\`cardinity_order_id\`)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    `);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `cardinity_order`;");
	}
}