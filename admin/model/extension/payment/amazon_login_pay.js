module.exports = class ModelExtensionPaymentAmazonLoginPay extends Model {

	async install() {
		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "amazon_login_pay_order` (
				`amazon_login_pay_order_id` INT(11) NOT NULL AUTO_INCREMENT,
				`order_id` int(11) NOT NULL,
				`amazon_order_reference_id` varchar(255) NOT NULL,
				`amazon_authorization_id` varchar(255) NOT NULL,
				`free_shipping`  tinyint NOT NULL DEFAULT 0,
				`date_added` DATETIME NOT NULL,
				`modified` DATETIME NOT NULL,
				`capture_status` INT(1) DEFAULT NULL,
				`cancel_status` INT(1) DEFAULT NULL,
				`refund_status` INT(1) DEFAULT NULL,
				`currency_code` CHAR(3) NOT NULL,
				`total` DECIMAL( 10, 2 ) NOT NULL,
				KEY `amazon_order_reference_id` (`amazon_order_reference_id`),
				PRIMARY KEY `amazon_login_pay_order_id` (`amazon_login_pay_order_id`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=oc_general_ci;
		");

		await this.db.query("
			CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "amazon_login_pay_order_transaction` (
			  `amazon_login_pay_order_transaction_id` INT(11) NOT NULL AUTO_INCREMENT,
			  `amazon_login_pay_order_id` INT(11) NOT NULL,
			  `amazon_authorization_id` varchar(255),
			  `amazon_capture_id` varchar(255),
			  `amazon_refund_id` varchar(255),
			  `date_added` DATETIME NOT NULL,
			  `type` ENUM('authorization', 'capture', 'refund', 'cancel') DEFAULT NULL,
			  `status` ENUM('Open', 'Pending', 'Completed', 'Suspended', 'Declined', 'Closed', 'Canceled') DEFAULT NULL,
			  `amount` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (`amazon_login_pay_order_transaction_id`)
			) ENGINE=MyISAM DEFAULT COLLATE=oc_general_ci;
			");
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "amazon_login_pay_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "amazon_login_pay_order_total_tax`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "amazon_login_pay_order_transaction`;");
	}

	async deleteEvents() {
		this.load.model('setting/event',this);
		await this.model_setting_event.deleteEventByCode('amazon_edit_capture');
		await this.model_setting_event.deleteEventByCode('amazon_history_capture');
	}

	async addEvents() {
		this.load.model('setting/event',this);
		await this.model_setting_event.addEvent('amazon_edit_capture', 'catalog/model/checkout/order/editOrder/after', 'extension/payment/amazon_login_pay/capture');
		await this.model_setting_event.addEvent('amazon_history_capture', 'catalog/model/checkout/order/addOrderHistory/after', 'extension/payment/amazon_login_pay/capture');
	}

	async getOrder(order_id) {

		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			order = qry.row;
			order['transactions'] = this.getTransactions(order['amazon_login_pay_order_id'], qry.row['currency_code']);
			return order;
		} else {
			return false;
		}
	}

	async cancel(amazon_login_pay_order) {
		total_captured = this.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

		if ((amazon_login_pay_order) && total_captured == 0) {

			cancel_response = {};
			cancel_paramter_data = {};

			cancel_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
			cancel_details = this.offAmazon('CancelOrderReference', cancel_paramter_data);
			cancel_details_xml = simplexml_load_string(cancel_details['ResponseBody']);
			this.logger(cancel_details_xml);
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

	async hasOpenAuthorization(transactions) {
		for (transactions of transaction) {
			if (transaction['type'] == 'authorization' && transaction['status'] == 'Open') {
				return true;
			}
		}

		return false;
	}

	async capture(amazon_login_pay_order, amount) {
		total_captured = this.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

		if ((amazon_login_pay_order) && amazon_login_pay_order['capture_status'] == 0 && (total_captured + amount <= amazon_login_pay_order['total'])) {
			if (!this.hasOpenAuthorization(amazon_login_pay_order['transactions'])) {
				amazon_authorization = this.authorize(amazon_login_pay_order, amount);
				if ((amazon_authorization['AmazonAuthorizationId'])) {
					amazon_authorization_id = amazon_authorization['AmazonAuthorizationId'];
				} else {
					return amazon_authorization;
				}
			} else {
				amazon_authorization_id = amazon_login_pay_order['amazon_authorization_id'];
			}

			capture_paramter_data = {};
			capture_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
			capture_paramter_data['AmazonAuthorizationId'] = amazon_authorization_id;
			capture_paramter_data['CaptureAmount.Amount'] = amount;
			capture_paramter_data['CaptureAmount.CurrencyCode'] = amazon_login_pay_order['currency_code'];
			capture_paramter_data['CaptureReferenceId'] = 'capture_' + mt_rand();
			capture_paramter_data['TransactionTimeout'] = 0;
			capture_details = this.offAmazon('Capture', capture_paramter_data);

			capture_response = this.validateResponse('Capture', capture_details);
			capture_response['AmazonAuthorizationId'] = amazon_authorization_id;
			return capture_response;
		} else {
			return false;
		}
	}

	private function authorize(amazon_login_pay_order, amount) {
		authorize_paramter_data = {};
		authorize_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
		authorize_paramter_data['AuthorizationAmount.Amount'] = amount;
		authorize_paramter_data['AuthorizationAmount.CurrencyCode'] = amazon_login_pay_order['currency_code'];
		authorize_paramter_data['AuthorizationReferenceId'] = 'auth_' + mt_rand();
		authorize_paramter_data['TransactionTimeout'] = 0;
		authorize_details = this.offAmazon('Authorize', authorize_paramter_data);

		return this.validateResponse('Authorize', authorize_details);
	}

	async closeOrderRef(amazon_order_reference_id) {
		close_paramter_data = {};
		close_paramter_data['AmazonOrderReferenceId'] = amazon_order_reference_id;
		this.offAmazon('CloseOrderReference', close_paramter_data);
		close_details = this.offAmazon('CloseOrderReference', close_paramter_data);
		this.logger(close_details);
	}

	async updateCaptureStatus(amazon_login_pay_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order` SET `capture_status` = '" + status + "' WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "'");
	}

	async refund(amazon_login_pay_order, amount) {
		if ((amazon_login_pay_order) && amazon_login_pay_order['refund_status'] != 1) {
			amazon_captures_remaining = this.getUnCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

			refund_response = {};
			i = 0;
			count = count(amazon_captures_remaining);
			for (amount; amount > 0 && count > i; amount -= amazon_captures_remaining[i++]['capture_remaining']) {
				refund_amount = amount;
				if (amazon_captures_remaining[i]['capture_remaining'] <= amount) {
					refund_amount = amazon_captures_remaining[i]['capture_remaining'];
				}

				refund_paramter_data = {};
				refund_paramter_data['AmazonOrderReferenceId'] = amazon_login_pay_order['amazon_order_reference_id'];
				refund_paramter_data['AmazonCaptureId'] = amazon_captures_remaining[i]['amazon_capture_id'];
				refund_paramter_data['RefundAmount.Amount'] = refund_amount;
				refund_paramter_data['RefundAmount.CurrencyCode'] = amazon_login_pay_order['currency_code'];
				refund_paramter_data['RefundReferenceId'] = 'refund_' + mt_rand();
				refund_paramter_data['TransactionTimeout'] = 0;
				refund_details = this.offAmazon('Refund', refund_paramter_data);
				refund_response[i] = this.validateResponse('Refund', refund_details);
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
		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE (`type` = 'refund' OR `type` = 'capture') AND `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' ORDER BY `date_added`");
		uncaptured = {};
		for (qry.rows of row) {
			uncaptured[row['amazon_capture_id']]['amazon_authorization_id'] = row['amazon_authorization_id'];
			uncaptured[row['amazon_capture_id']]['amazon_capture_id'] = row['amazon_capture_id'];
			if ((uncaptured[row['amazon_capture_id']]['capture_remaining'])) {
				uncaptured[row['amazon_capture_id']]['capture_remaining'] += row['amount'];
			} else {
				uncaptured[row['amazon_capture_id']]['capture_remaining'] = row['amount'];
			}

			if (uncaptured[row['amazon_capture_id']]['capture_remaining'] == 0) {
				delete uncaptured[row['amazon_capture_id']]);
			}
		}
		return array_values(uncaptured);
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

	private function getTransactions(amazon_login_pay_order_id, currency_code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' ORDER BY `date_added` DESC");

		transactions = {};
		if (query.num_rows) {
			for (query.rows of row) {
				row['amount'] = this.currency.format(row['amount'], currency_code, true, true);
				transactions[] = row;
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
        return in_array(this.fetchOrder(order_reference_id).OrderReferenceStatus.State, states);
    }

    async fetchOrder(order_reference_id) {
    	order = this.offAmazon("GetOrderReferenceDetails", array(
            'AmazonOrderReferenceId' : order_reference_id
        ));

    	responseBody = order['ResponseBody'];

	    details_xml = simplexml_load_string(responseBody);

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
		validate_paramter_data = {};
		validate_paramter_data['AWSAccessKeyId'] = data['payment_amazon_login_pay_access_key'];
		validate_paramter_data['SellerId'] = data['payment_amazon_login_pay_merchant_id'];
		validate_paramter_data['AmazonOrderReferenceId'] = 'validate details';
		validate_details = this.offAmazon('GetOrderReferenceDetails', validate_paramter_data);
		validate_response = this.validateResponse('GetOrderReferenceDetails', validate_details, true);
		if(validate_response['error_code'] && validate_response['error_code'] != 'InvalidOrderReferenceId'){
			return validate_response;
		}
	}

	async offAmazon(Action, parameter_data, post_data = {}) {
		if((post_data)){
			merchant_id = post_data['payment_amazon_login_pay_merchant_id'];
			access_key = post_data['payment_amazon_login_pay_access_key'];
			access_secret = post_data['payment_amazon_login_pay_access_secret'];
			test = post_data['payment_amazon_login_pay_test'];
			payment_region = post_data['payment_amazon_login_pay_payment_region'];
		} else {
			merchant_id = this.config.get('payment_amazon_login_pay_merchant_id');
			access_key = this.config.get('payment_amazon_login_pay_access_key');
			access_secret = this.config.get('payment_amazon_login_pay_access_secret');
			test = this.config.get('payment_amazon_login_pay_test');
			payment_region = this.config.get('payment_amazon_login_pay_payment_region');

		}

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

		parameters = {};
		parameters['AWSAccessKeyId'] = access_key;
		parameters['Action'] = Action;
		parameters['SellerId'] = merchant_id;
		parameters['SignatureMethod'] = 'HmacSHA256';
		parameters['SignatureVersion'] = 2;
		parameters['Timestamp'] = date('c', time());
		parameters['Version'] = '2013-01-01';
		for (parameter_data of k : v) {
			parameters[k] = v;
		}

		const query = this.calculateStringToSignV2(parameters, url);

		parameters['Signature'] = base64_encode(hash_hmac('sha256', query, access_secret, true));

		return this.sendCurl(url, parameters);
	}

	private function validateResponse(action, details, skip_logger = false) {
		details_xml = simplexml_load_string(details['ResponseBody']);
		if (!skip_logger) {
			this.logger(details_xml);
		}
		switch (action) {
			case 'Authorize':
				result = 'AuthorizeResult';
				details = 'AuthorizationDetails';
				status = 'AuthorizationStatus';
				amazon_id = 'AmazonAuthorizationId';
				break;
			case 'Capture':
				result = 'CaptureResult';
				details = 'CaptureDetails';
				status = 'CaptureStatus';
				amazon_id = 'AmazonCaptureId';
				break;
			case 'Refund':
				result = 'RefundResult';
				details = 'RefundDetails';
				status = 'RefundStatus';
				amazon_id = 'AmazonRefundId';
		}

		details_xml.registerXPathNamespace('m', 'http://mws.amazonservices.com/schema/OffAmazonPayments/2013-01-01');
		error_set = details_xml.xpath('//m:ReasonCode');

		if ((details_xml.Error)) {
			response['status'] = 'Error';
			response['error_code'] = details_xml.Error.Code;
			response['status_detail'] = details_xml.Error.Code + ': ' + details_xml.Error.Message;
		} else if ((error_set)) {
			response['status'] = details_xml.result.details.status.State;
			response['status_detail'] = details_xml.result.details.status.ReasonCode;
		} else {
			response['status'] = details_xml.result.details.status.State;
			response[amazon_id] = details_xml.result.details.amazon_id;
		}

		return response;
	}

	async sendCurl(url, parameters) {
		const query = this.getParametersAsString(parameters);

		curl = curl_init(url);

		curl_setopt(curl, CURLOPT_URL, url);
		curl_setopt(curl, CURLOPT_PORT, 443);
		curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, true);
		curl_setopt(curl, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt(curl, CURLOPT_USERAGENT, this.request.server['HTTP_USER_AGENT']);
		curl_setopt(curl, CURLOPT_POST, true);
		curl_setopt(curl, CURLOPT_POSTFIELDS, query);
		curl_setopt(curl, CURLOPT_HEADER, true);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, true);

		response = curl_exec(curl);
		curl_close(curl);

		list(other, responseBody) = explode("\r\n\r\n", response, 2);
		other = preg_split("/\r\n|\n|\r/", other);

		list(protocol, code, text) = explode(' ', trim(array_shift(other)), 3);
		return array('status' : code, 'ResponseBody' : responseBody);
	}

	private function getParametersAsString(array parameters) {
		queryParameters = {};
		for (parameters of key : value) {
			queryParameters[] = key + '=' + this.urlencode(value);
		}
		return implode('&', queryParameters);
	}

	private function calculateStringToSignV2(array parameters, url) {
		data = 'POST';
		data += "\n";
		endpoint = parse_url(url);
		data += endpoint['host'];
		data += "\n";
		uri = array_key_exists('path', endpoint) ? endpoint['path'] : null;
		if (!(uri)) {
			uri = "/";
		}
		uriencoded = implode("/", array_map(array(this, "urlencode"), explode("/", uri)));
		data += uriencoded;
		data += "\n";
		uksort(parameters, 'strcmp');
		data += this.getParametersAsString(parameters);
		return data;
	}

	private function urlencode(value) {
		return str_replace('%7E', '~', rawurlencode(value));
	}

	async logger(message) {
		if (this.config.get('payment_amazon_login_pay_debug') == 1) {
			log = new Log('amazon_login_pay_admin.log');
			backtrace = debug_backtrace();
			class = (backtrace[6]['class']) ? backtrace[6]['class'] + '::' : '';
			log.write('Origin: ' + class + backtrace[6]['function']);
            log.write(!is_string(message) ? print_r(message, true) : message);
            delete log);
		}
	}
}