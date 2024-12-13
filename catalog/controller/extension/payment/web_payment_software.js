module.exports = class ControllerExtensionPaymentWebPaymentSoftware extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/web_payment_software');

		data['months'] = array();

		for (i = 1; i <= 12; i++) {
			data['months'].push(array(
				'text'  : sprintf('%02d', i),
				'value' : sprintf('%02d', i)
			});
		}

		today = getdate();

		data['year_expire'] = array();

		for (i = today['year']; i < today['year'] + 11; i++) {
			data['year_expire'].push(array(
				'text'  : sprintf('%02d', i % 100),
				'value' : sprintf('%04d', i)
			});
		}

		return await this.load.view('extension/payment/web_payment_software', data);
	}

	async send() {
		this.load.model('checkout/order',this);

		if(!(this.session.data['order_id'])) {
			return false;
		}

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		request  = 'MERCHANT_ID=' + encodeURIComponent(this.config.get('payment_web_payment_software_merchant_name'));
		request += '&MERCHANT_KEY=' + encodeURIComponent(this.config.get('payment_web_payment_software_merchant_key'));
		request += '&TRANS_TYPE=' + encodeURIComponent(this.config.get('payment_web_payment_software_method') == 'capture' ? 'AuthCapture' : 'AuthOnly');
		request += '&AMOUNT=' + encodeURIComponent(this.currency.format(order_info['total'], order_info['currency_code'], 1+00000, false));
		request += '&CC_NUMBER=' + encodeURIComponent(str_replace(' ', '', this.request.post['cc_number']));
		request += '&CC_EXP=' + encodeURIComponent(this.request.post['cc_expire_date_month'] + substr(this.request.post['cc_expire_date_year'], 2));
		request += '&CC_CVV=' + encodeURIComponent(this.request.post['cc_cvv2']);
		request += '&CC_NAME=' + encodeURIComponent(order_info['payment_firstname'] + ' ' + order_info['payment_lastname']);
		request += '&CC_COMPANY=' + encodeURIComponent(order_info['payment_company']);
		request += '&CC_ADDRESS=' + encodeURIComponent(order_info['payment_address_1']);
		request += '&CC_CITY=' + encodeURIComponent(order_info['payment_city']);
		request += '&CC_STATE=' + encodeURIComponent(order_info['payment_iso_code_2'] != 'US' ? order_info['payment_zone'] : order_info['payment_zone_code']);
		request += '&CC_ZIP=' + encodeURIComponent(order_info['payment_postcode']);
		request += '&CC_COUNTRY=' + encodeURIComponent(order_info['payment_country']);
		request += '&CC_PHONE=' + encodeURIComponent(order_info['telephone']);
		request += '&CC_EMAIL=' + encodeURIComponent(order_info['email']);
		request += '&INVOICE_NUM=' + encodeURIComponent(this.session.data['order_id']);

		if (this.config.get('payment_web_payment_software_mode') == 'test') {
			request += '&TEST_MODE=1';
		}

		curl = curl_init('https://secure+web-payment-software+com/gateway');

		curl_setopt(curl, CURLOPT_PORT, 443);
		curl_setopt(curl, CURLOPT_HEADER, 0);
		curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(curl, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(curl, CURLOPT_FRESH_CONNECT, 1);
		curl_setopt(curl, CURLOPT_POST, 1);
		curl_setopt(curl, CURLOPT_POSTFIELDS, request);

		response = curl_exec(curl);

		curl_close(curl);

		//If in test mode strip results to only contain xml data
		if (this.config.get('payment_web_payment_software_mode') == 'test') {
			end_index = strpos(response, '</WebPaymentSoftwareResponse>');
			debug = substr(response, end_index + 30);
			response = substr(response, 0, end_index) + '</WebPaymentSoftwareResponse>';
		}

		//get response xml
		xml = simplexml_load_string(response);

		//create object to use of json
		const json = {};

		//If successful log transaction in opencart system
		if ('00' === xml.response_code) {
			message = '';

			message += 'Response Code: ';

			if ((xml.response_code)) {
				message += xml.response_code + "\n";
			}

			message += 'Approval Code: ';

			if ((xml.approval_code)) {
				message += xml.approval_code + "\n";
			}

			message += 'AVS Result Code: ';

			if ((xml.avs_result_code)) {
				message += xml.avs_result_code + "\n";
			}

			message += 'Transaction ID (web payment software order id): ';

			if ((xml.order_id)) {
				message += xml.order_id + "\n";
			}

			message += 'CVV Result Code: ';

			if ((xml.cvv_result_code)) {
				message += xml.cvv_result_code + "\n";
			}

			message += 'Response Text: ';

			if ((xml.response_text)) {
				message += xml.response_text + "\n";
			}

			await this.model_checkout_order.addOrderHistory(this.session.data['order_id'], this.config.get('payment_web_payment_software_order_status_id'), message, false);

			json['redirect'] = await this.url.link('checkout/success', '', true);
		} else {
			json['error'] = xml.response_text;
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}