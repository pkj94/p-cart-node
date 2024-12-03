const array_key_exists = require("locutus/php/array/array_key_exists");
const uksort = require("locutus/php/array/uksort");
const mt_rand = require("locutus/php/math/mt_rand");
const explode = require("locutus/php/strings/explode");
const is_string = require("locutus/php/var/is_string");
const JSON.stringify = require("locutus/php/var/JSON.stringify");

module.exports = class ModelExtensionPaymentAmazonLoginPay extends Model {

	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}amazon_login_pay_order\` (
				\`amazon_login_pay_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
				\`order_id\` int(11) NOT NULL,
				\`amazon_order_reference_id\` varchar(255) NOT NULL,
				\`amazon_authorization_id\` varchar(255) NOT NULL,
				\`free_shipping\`  tinyint NOT NULL DEFAULT 0,
				\`date_added\` DATETIME NOT NULL,
				\`modified\` DATETIME NOT NULL,
				\`capture_status\` INT(1) DEFAULT NULL,
				\`cancel_status\` INT(1) DEFAULT NULL,
				\`refund_status\` INT(1) DEFAULT NULL,
				\`currency_code\` CHAR(3) NOT NULL,
				\`total\` DECIMAL( 10, 2 ) NOT NULL,
				KEY \`amazon_order_reference_id\` (\`amazon_order_reference_id\`),
				PRIMARY KEY \`amazon_login_pay_order_id\` (\`amazon_login_pay_order_id\`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
		`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}amazon_login_pay_order_transaction\` (
			  \`amazon_login_pay_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`amazon_login_pay_order_id\` INT(11) NOT NULL,
			  \`amazon_authorization_id\` varchar(255),
			  \`amazon_capture_id\` varchar(255),
			  \`amazon_refund_id\` varchar(255),
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('authorization', 'capture', 'refund', 'cancel') DEFAULT NULL,
			  \`status\` ENUM('Open', 'Pending', 'Completed', 'Suspended', 'Declined', 'Closed', 'Canceled') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`amazon_login_pay_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;
			`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "amazon_login_pay_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "amazon_login_pay_order_total_tax`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "amazon_login_pay_order_transaction`;");
	}

	async deleteEvents() {
		this.load.model('setting/event', this);
		await this.model_setting_event.deleteEventByCode('amazon_edit_capture');
		await this.model_setting_event.deleteEventByCode('amazon_history_capture');
	}

	async addEvents() {
		this.load.model('setting/event', this);
		await this.model_setting_event.addEvent('amazon_edit_capture', 'catalog/model/checkout/order/editOrder/after', 'extension/payment/amazon_login_pay/capture');
		await this.model_setting_event.addEvent('amazon_history_capture', 'catalog/model/checkout/order/addOrderHistory/after', 'extension/payment/amazon_login_pay/capture');
	}

	async getOrder(order_id) {

		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['amazon_login_pay_order_id'], qry.row['currency_code']);
			return order;
		} else {
			return false;
		}
	}

	async cancel(amazon_login_pay_order) {
		const total_captured = await this.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

		if ((amazon_login_pay_order) && total_captured == 0) {

			let cancel_response = {};
			let cancel_paramter_data = {};

			cancel_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
			let cancel_details = this.offAmazon('CancelOrderReference', cancel_paramter_data);
			let cancel_details_xml = await parseXmlString(cancel_details['ResponseBody']);
			await this.logger(cancel_details_xml);
			if ((cancel_details_xml.Error)) {
				cancel_response['status'] = 'Error';
				cancel_response['status_detail'] = cancel_details_xml.Error.Code + ': ' + cancel_details_xml.Error.Message;
			} else {
				cancel_response['status'] = 'Completed';
			}
			return cancel_response;
		} else {
			return false;
		}
	}

	async updateCancelStatus(amazon_login_pay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order` SET `cancel_status` = '" + status + "' WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "'");
	}

	hasOpenAuthorization(transactions) {
		for (let transaction of transactions) {
			if (transaction['type'] == 'authorization' && transaction['status'] == 'Open') {
				return true;
			}
		}

		return false;
	}

	async capture(amazon_login_pay_order, amount) {
		const total_captured = await this.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

		if ((amazon_login_pay_order) && amazon_login_pay_order['capture_status'] == 0 && (total_captured + amount <= amazon_login_pay_order['total'])) {
			let amazon_authorization_id;
			if (!this.hasOpenAuthorization(amazon_login_pay_order['transactions'])) {
				const amazon_authorization = await this.authorize(amazon_login_pay_order, amount);
				if ((amazon_authorization['AmazonAuthorizationId'])) {
					amazon_authorization_id = amazon_authorization['AmazonAuthorizationId'];
				} else {
					return amazon_authorization;
				}
			} else {
				amazon_authorization_id = amazon_login_pay_order['amazon_authorization_id'];
			}

			const capture_paramter_data = {};
			capture_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
			capture_paramter_data['AmazonAuthorizationId'] = amazon_authorization_id;
			capture_paramter_data['CaptureAmount.Amount'] = amount;
			capture_paramter_data['CaptureAmount.CurrencyCode'] = amazon_login_pay_order['currency_code'];
			capture_paramter_data['CaptureReferenceId'] = 'capture_' + mt_rand();
			capture_paramter_data['TransactionTimeout'] = 0;
			capture_details = await this.offAmazon('Capture', capture_paramter_data);

			capture_response = await this.validateResponse('Capture', capture_details);
			capture_response['AmazonAuthorizationId'] = amazon_authorization_id;
			return capture_response;
		} else {
			return false;
		}
	}

	async authorize(amazon_login_pay_order, amount) {
		const authorize_paramter_data = {};
		authorize_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
		authorize_paramter_data['AuthorizationAmount.Amount'] = amount;
		authorize_paramter_data['AuthorizationAmount.CurrencyCode'] = amazon_login_pay_order['currency_code'];
		authorize_paramter_data['AuthorizationReferenceId'] = 'auth_' + mt_rand();
		authorize_paramter_data['TransactionTimeout'] = 0;
		const authorize_details = await this.offAmazon('Authorize', authorize_paramter_data);

		return await this.validateResponse('Authorize', authorize_details);
	}

	async closeOrderRef(amazon_order_reference_id) {
		const close_paramter_data = {};
		close_paramter_data['AmazonOrderReferenceId'] = amazon_order_reference_id;
		await this.offAmazon('CloseOrderReference', close_paramter_data);
		const close_details = await this.offAmazon('CloseOrderReference', close_paramter_data);
		await this.logger(close_details);
	}

	async updateCaptureStatus(amazon_login_pay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order` SET `capture_status` = '" + status + "' WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "'");
	}

	async refund(amazon_login_pay_order, amount) {
		if ((amazon_login_pay_order) && amazon_login_pay_order['refund_status'] != 1) {
			const amazon_captures_remaining = await this.getUnCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

			const refund_response = {};
			let i = 0;
			let count = amazon_captures_remaining.length;
			for (amount; amount > 0 && count > i; amount -= amazon_captures_remaining[i++]['capture_remaining']) {
				let refund_amount = amount;
				if (amazon_captures_remaining[i]['capture_remaining'] <= amount) {
					refund_amount = amazon_captures_remaining[i]['capture_remaining'];
				}

				const refund_paramter_data = {};
				refund_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
				refund_paramter_data['AmazonCaptureId'] = amazon_captures_remaining[i]['amazon_capture_id'];
				refund_paramter_data['RefundAmount.Amount'] = refund_amount;
				refund_paramter_data['RefundAmount.CurrencyCode'] = amazon_login_pay_order['currency_code'];
				refund_paramter_data['RefundReferenceId'] = 'refund_' + mt_rand();
				refund_paramter_data['TransactionTimeout'] = 0;
				const refund_details = await this.offAmazon('Refund', refund_paramter_data);
				refund_response[i] = await this.validateResponse('Refund', refund_details);
				refund_response[i]['amazon_authorization_id'] = amazon_captures_remaining[i]['amazon_authorization_id'];
				refund_response[i]['amazon_capture_id'] = amazon_captures_remaining[i]['amazon_capture_id'];
				refund_response[i]['amount'] = refund_amount;
			}

			return refund_response;
		} else {
			return false;
		}
	}

	async getUnCaptured(amazon_login_pay_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE (`type` = 'refund' OR `type` = 'capture') AND `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' ORDER BY `date_added`");
		const uncaptured = {};
		for (let row of qry.rows) {
			uncaptured[row['amazon_capture_id']]['amazon_authorization_id'] = row['amazon_authorization_id'];
			uncaptured[row['amazon_capture_id']]['amazon_capture_id'] = row['amazon_capture_id'];
			if ((uncaptured[row['amazon_capture_id']]['capture_remaining'])) {
				uncaptured[row['amazon_capture_id']]['capture_remaining'] += row['amount'];
			} else {
				uncaptured[row['amazon_capture_id']]['capture_remaining'] = row['amount'];
			}

			if (uncaptured[row['amazon_capture_id']]['capture_remaining'] == 0) {
				delete uncaptured[row['amazon_capture_id']];
			}
		}
		return Object.values(uncaptured);
	}

	async updateRefundStatus(amazon_login_pay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order` SET `refund_status` = '" + status + "' WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "'");
	}

	async getCapturesRemaining(amazon_login_pay_order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' AND capture_remaining != '0' ORDER BY `date_added`");
		if (query.num_rows) {
			return query.rows;
		} else {
			return false;
		}
	}

	async getTransactions(amazon_login_pay_order_id, currency_code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' ORDER BY `date_added` DESC");

		const transactions = [];
		if (query.num_rows) {
			for (let row of query.rows) {
				row['amount'] = this.currency.format(row['amount'], currency_code, true, true);
				transactions.push(row);
			}
			return transactions;
		} else {
			return false;
		}
	}

	async addTransaction(amazon_login_pay_order_id, type, status, total, amazon_authorization_id = null, amazon_capture_id = null, amazon_refund_id = null) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "amazon_login_pay_order_transaction` SET `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "',`amazon_authorization_id` = '" + this.db.escape(amazon_authorization_id) + "',`amazon_capture_id` = '" + this.db.escape(amazon_capture_id) + "',`amazon_refund_id` = '" + this.db.escape(amazon_refund_id) + "',  `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "', `status` = '" + this.db.escape(status) + "'");
	}

	async updateAuthorizationStatus(amazon_authorization_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order_transaction` SET `status` = '" + this.db.escape(status) + "' WHERE `amazon_authorization_id`='" + this.db.escape(amazon_authorization_id) + "' AND `type`='authorization'");
	}

	async isOrderInState(order_reference_id, states = {}) {
		return states.includes((await this.fetchOrder(order_reference_id)).OrderReferenceStatus.State);
	}

	async fetchOrder(order_reference_id) {
		const order = await this.offAmazon("GetOrderReferenceDetails", {
			'AmazonOrderReferenceId': order_reference_id
		});

		const responseBody = order['ResponseBody'];

		const details_xml = await parseXmlString(responseBody);

		return details_xml
			.GetOrderReferenceDetailsResult
			.OrderReferenceDetails;
	}

	async getTotalCaptured(amazon_login_pay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' AND (`type` = 'capture' OR `type` = 'refund') AND (`status` = 'Completed' OR `status` = 'Closed')");

		return query.row['total'];
	}

	async getTotalRefunded(amazon_login_pay_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' AND 'refund'");

		return query.row['total'];
	}

	async validateDetails(data) {
		const validate_paramter_data = {};
		validate_paramter_data['AWSAccessKeyId'] = data['payment_amazon_login_pay_access_key'];
		validate_paramter_data['SellerId'] = data['payment_amazon_login_pay_merchant_id'];
		validate_paramter_data['AmazonOrderReferenceId'] = 'validate details';
		const validate_details = await this.offAmazon('GetOrderReferenceDetails', validate_paramter_data);
		const validate_response = await this.validateResponse('GetOrderReferenceDetails', validate_details, true);
		if (validate_response['error_code'] && validate_response['error_code'] != 'InvalidOrderReferenceId') {
			return validate_response;
		}
	}

	async offAmazon(Action, parameter_data, post_data = {}) {
		let merchant_id = this.config.get('payment_amazon_login_pay_merchant_id');
		let access_key = this.config.get('payment_amazon_login_pay_access_key');
		let access_secret = this.config.get('payment_amazon_login_pay_access_secret');
		let test = this.config.get('payment_amazon_login_pay_test');
		let payment_region = this.config.get('payment_amazon_login_pay_payment_region');
		if (Object.keys(post_data).length) {
			merchant_id = post_data['payment_amazon_login_pay_merchant_id'];
			access_key = post_data['payment_amazon_login_pay_access_key'];
			access_secret = post_data['payment_amazon_login_pay_access_secret'];
			test = post_data['payment_amazon_login_pay_test'];
			payment_region = post_data['payment_amazon_login_pay_payment_region'];
		}
		let url;
		if (test == 'sandbox') {
			if (payment_region == 'USD') {
				url = 'https://mws.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01/';
			} else {
				url = 'https://mws-eu.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01/';
			}
		} else {
			if (payment_region == 'USD') {
				url = 'https://mws.amazonservices.com/OffAmazonPayments/2013-01-01/';
			} else {
				url = 'https://mws-eu.amazonservices.com/OffAmazonPayments/2013-01-01/';
			}
		}

		const parameters = {};
		parameters['AWSAccessKeyId'] = access_key;
		parameters['Action'] = Action;
		parameters['SellerId'] = merchant_id;
		parameters['SignatureMethod'] = 'HmacSHA256';
		parameters['SignatureVersion'] = 2;
		parameters['Timestamp'] = date('c', new Date());
		parameters['Version'] = '2013-01-01';
		for (let [k, v] of Object.entries(parameter_data)) {
			parameters[k] = v;
		}

		const query = await this.calculateStringToSignV2(parameters, url);

		parameters['Signature'] = atob(hash_hmac('sha256', query, access_secret, true));

		return await this.sendCurl(url, parameters);
	}

	async validateResponse(action, details, skipLogger = false) {
		const parser = new xml2js.Parser();
		const detailsXml = await parser.parseStringPromise(details.ResponseBody);
		if (!skipLogger) {
			await this.logger(detailsXml);
		}
		let result, detail, status, amazon_id;
		switch (action) {
			case 'Authorize':
				result = 'AuthorizeResult';
				detail = 'AuthorizationDetails';
				status = 'AuthorizationStatus';
				amazon_id = 'AmazonAuthorizationId';
				break;
			case 'Capture':
				result = 'CaptureResult';
				detail = 'CaptureDetails';
				status = 'CaptureStatus';
				amazon_id = 'AmazonCaptureId';
				break;
			case 'Refund':
				result = 'RefundResult';
				detail = 'RefundDetails';
				status = 'RefundStatus';
				amazon_id = 'AmazonRefundId';
				break;
			default:
				throw new Error('Unknown action');
		}
		const response = {};
		const errorSet = detailsXml.response.status.some(m => m.ReasonCode);
		if (detailsXml.response.Error) {
			response.status = 'Error';
			response.error_code = detailsXml.response.Error.Code[0];
			response.status_detail = `${detailsXml.response.Error.Code[0]}: ${detailsXml.response.Error.Message[0]}`;
		} else if (errorSet) {
			response.status = detailsXml.response[result][0][detail][0][status][0].State[0];
			response.status_detail = detailsXml.response[result][0][detail][0][status][0].ReasonCode[0];
		} else {
			response.status = detailsXml.response[result][0][detail][0][status][0].State[0]; response[amazon_id] = detailsXml.response[result][0][detail][0][amazon_id][0];
		}
		return response;
	}

	async sendCurl(url, parameters) {
		const query = await this.getParametersAsString(parameters);

		const curl = await require('axios').post(url, query);
		response = curl.data;

		const { other, responseBody } = explode("\r\n\r\n", response, 2);
		other = other.split(new RegExp("/\r\n|\n|\r/"));

		const { protocol, code, text } = explode(' ', other.shift().trim(), 3);
		return { 'status': code, 'ResponseBody': responseBody };
	}

	async getParametersAsString(parameters) {
		let queryParameters = [];
		for (let [key, value] of Object.entries(parameters)) {
			queryParameters.push(key + '=' + this.encodeURIComponent(value));
		}
		return queryParameters.join('&');
	}

	async calculateStringToSignV2(parameters, url) {
		let data = 'POST';
		data += "\n";
		const endpoint = new URL(url);
		data += endpoint.host;
		data += "\n";
		let uri = array_key_exists('path', endpoint) ? endpoint['path'] : null;
		if (!(uri)) {
			uri = "/";
		}
		let uriencoded = uri.split("/").map(a => this.encodeURIComponent(a));
		data += uriencoded;
		data += "\n";
		parameters = uksort(parameters, 'strcmp');
		data += await this.getParametersAsString(parameters);
		return data;
	}

	encodeURIComponent(value) {
		return encodeURIComponent(value).replaceAll('%7E', '~');
	}

	async logger(message) {
		if (this.config.get('payment_amazon_login_pay_debug') == 1) {
			const log = new Log('amazon_login_pay_admin.log');
			const backtrace = getStackTrace();
			let class1 = (backtrace[6]['class']) ? backtrace[6]['class'] + '::' : '';
			await log.write('Origin: ' + class1 + backtrace[6]['function']);
			await log.write(!is_string(message) ? JSON.stringify(message, true) : message);
		}
	}
}