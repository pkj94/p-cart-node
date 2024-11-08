module.exports = use Cardinity\Client;
use Cardinity\Method\Payment;
use Cardinity\Method\Refund;

class ModelExtensionPaymentCardinity extends Model {
	async getOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardinity_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		return query.row;
	}

	async createClient(credentials) {
		return Client::create(array(
			'consumerKey'    : credentials['key'],
			'consumerSecret' : credentials['secret'],
		));
	}

	async verifyCredentials(client) {
		method = new Payment\GetAll(10);

		try {
			client.call(method);

			return true;
		} catch (Exception e) {
			this.log(e.getMessage());

			return false;
		}
	}

	async getPayment(client, payment_id) {
		method = new Payment\Get(payment_id);

		try {
			payment = client.call(method);

			return payment;
		} catch (Exception e) {
			this.log(e.getMessage());

			return false;
		}
	}

	async getRefunds(client, payment_id) {
		method = new Refund\GetAll(payment_id);

		try {
			refunds = client.call(method);

			return refunds;
		} catch (Exception e) {
			this.log(e.getMessage());

			return false;
		}
	}

	async refundPayment(client, payment_id, amount, description) {
		method = new Refund\Create(payment_id, amount, description);

		try {
			refund = client.call(method);

			return refund;
		} catch (Exception e) {
			this.log(e.getMessage());

			return false;
		}
	}

	async log(data) {
		if (this.config.get('payment_cardinity_debug')) {
			backtrace = debug_backtrace();
			log = new Log('cardinity.log');
			log.write('(' + backtrace[1]['class'] + '::' + backtrace[1]['function'] + ') - ' + print_r(data, true));
		}
	}

	async install() {
		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "cardinity_order` (
			  `cardinity_order_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `order_id` INT(11) NOT NULL,
			  `payment_id` VARCHAR(255),
			  PRIMARY KEY (`cardinity_order_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;
		");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "cardinity_order`;");
	}
}