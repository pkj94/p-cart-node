module.exports = use Cardinity\Client;
use Cardinity\Method\Payment;
use Cardinity\Exception as CardinityException;

class ModelExtensionPaymentCardinity extends Model {
	async addOrder(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardinity_order` SET `order_id` = '" + data['order_id'] + "', `payment_id` = '" + this.db.escape(data['payment_id']) + "'");
	}

	async getOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardinity_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		return query.row;
	}

	async createPayment(key, secret, payment_data) {
		client = Client::create(array(
			'consumerKey'     key,
			'consumerSecret'  secret,
		));

		method = new Payment\Create(payment_data);

		try {
			payment = client.call(method);

			return payment;
		} catch (Exception exception) {
			this.exception(exception);

			throw exception;
		}
	}

	async finalizePayment(key, secret, payment_id, pares) {
		client = Client::create(array(
			'consumerKey'     key,
			'consumerSecret'  secret,
		));

		method = new Payment\Finalize(payment_id, pares);

		try {
			payment = client.call(method);

			return payment;
		} catch (Exception exception) {
			this.exception(exception);

			return false;
		}
	}

	async getMethod(address, total) {
		await this.load.language('extension/payment/cardinity');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_cardinity_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_cardinity_total') > 0 && this.config.get('payment_cardinity_total') > total) {
			status = false;
		} else if (!this.config.get('payment_cardinity_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		if (!in_array(this.session.data['currency'], this.getSupportedCurrencies())) {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'		  'cardinity',
				'title'		  this.language.get('text_title'),
				'terms'		  '',
				'sort_order'  this.config.get('payment_cardinity_sort_order')
			});
		}

		return method_data;
	}

	async getSupportedCurrencies() {
		return array(
			'USD',
			'GBP',
			'EUR'
		});
	}

	async cardinityLog(string data, int class_step = 6, int function_step = 6): void {
		if (this.config.get('payment_cardinity_debug')) {
			backtrace = debug_backtrace();
			log = new \Log('cardinity.log');
			log.write('(' + backtrace[class_step]['class'] + '::' + backtrace[function_step]['function'] + ') - ' + print_r(data, true));
		}
	}

	async exception(Exception exception) {
		this.cardinityLog(exception.getMessage(), 1, 2);

		switch (true) {
			case exception instanceof CardinityException\Request:
				if (exception.getErrorsAsString()) {
					this.cardinityLog(exception.getErrorsAsString(), 1, 2);
				}

				break;
			case exception instanceof CardinityException\InvalidAttributeValue:
				for (exception.getViolations() as violation) {
					this.cardinityLog(violation.getMessage(), 1, 2);
				}

				break;
		}
	}
}