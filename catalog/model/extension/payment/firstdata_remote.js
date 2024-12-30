const sha1 = require('locutus/php/strings/sha1');
const { parseStringPromise } = require('xml2js');

module.exports = class ModelExtensionPaymentFirstdataRemote extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/firstdata_remote');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + this.config.get('payment_firstdata_geo_zone_id') + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");
		let status = false;
		if (Number(this.config.get('firstdata_remote_total')) > 0 && Number(this.config.get('firstdata_remote_total')) > total) {
			status = false;
		} else if (!this.config.get('firstdata_remote_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = null;

		if (status) {
			method_data = {
				'code': 'firstdata_remote',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('firstdata_remote_sort_order')
			};
		}

		return method_data;
	}


	async capturePayment(data, order_id) {
		this.load.model('checkout/order', this);
		const order_info = await this.model_checkout_order.getOrderInfo(order_id);
		const order_ref = `API-${order_id}-${new Date().toISOString()}-${Math.floor(Math.random() * 491) + 10}`;
		const amount = this.currency.format(order_info.total, order_info.currency_code, order_info.currency_value);

		const type = this.config.get('firstdata_remote_auto_settle') === 1 ? 'sale' : 'preAuth';
		const currency = await this.mapCurrency(order_info.currency_code);

		let token = '';
		let payment_token = '';
		if (this.config.get('firstdata_remote_card_storage') === 1) {
			if (data.cc_choice && data.cc_choice !== 'new') {
				payment_token = data.cc_choice;
			} else if (data.cc_store === 1) {
				token = sha1(await this.customer.getId() + '-' + date("Y-m-d-H-i-s") + Math.randomd(10, 500));
			}
		}

		let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
		xml += `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">`;
		xml += `<SOAP-ENV:Header />`;
		xml += `<SOAP-ENV:Body>`;
		xml += `<ipgapi:IPGApiOrderRequest xmlns:v1="http://ipg-online.com/ipgapi/schemas/v1" xmlns:ipgapi="http://ipg-online.com/ipgapi/schemas/ipgapi">`;
		xml += `<v1:Transaction>`;
		xml += `<v1:CreditCardTxType><v1:Type>${type}</v1:Type></v1:CreditCardTxType>`;

		if (!payment_token) {
			xml += `<v1:CreditCardData>`;
			xml += `<v1:CardNumber>${data.cc_number}</v1:CardNumber>`;
			xml += `<v1:ExpMonth>${data.cc_expire_date_month}</v1:ExpMonth>`;
			xml += `<v1:ExpYear>${data.cc_expire_date_year}</v1:ExpYear>`;
			xml += `<v1:CardCodeValue>${data.cc_cvv2}</v1:CardCodeValue>`;
			xml += `</v1:CreditCardData>`;
		}

		xml += `<v1:Payment>`;
		if (token) {
			xml += `<v1:HostedDataID>${token}</v1:HostedDataID>`;
		}
		if (payment_token) {
			xml += `<v1:HostedDataID>${payment_token}</v1:HostedDataID>`;
		}
		xml += `<v1:ChargeTotal>${amount}</v1:ChargeTotal>`;
		xml += `<v1:Currency>${currency}</v1:Currency>`;
		xml += `</v1:Payment>`;

		xml += `<v1:TransactionDetails>`;
		xml += `<v1:OrderId>${order_ref}</v1:OrderId>`;
		xml += `<v1:Ip>${order_info.ip}</v1:Ip>`;
		xml += `<v1:TransactionOrigin>ECI</v1:TransactionOrigin>`;
		xml += `<v1:PONumber>OPENCART2.0${VERSION}</v1:PONumber>`;
		xml += `</v1:TransactionDetails>`;

		xml += `<v1:Billing>`;
		xml += `<v1:CustomerID>${await this.customer.getId()}</v1:CustomerID>`;
		xml += `<v1:Name>${order_info.payment_firstname} ${order_info.payment_lastname}</v1:Name>`;
		xml += `<v1:Company>${order_info.payment_company}</v1:Company>`;
		xml += `<v1:Address1>${order_info.payment_address_1}</v1:Address1>`;
		xml += `<v1:Address2>${order_info.payment_address_2}</v1:Address2>`;
		xml += `<v1:City>${order_info.payment_city}</v1:City>`;
		xml += `<v1:State>${order_info.payment_zone}</v1:State>`;
		xml += `<v1:Zip>${order_info.payment_postcode}</v1:Zip>`;
		xml += `<v1:Country>${order_info.payment_iso_code_2}</v1:Country>`;
		xml += `<v1:Email>${order_info.email}</v1:Email>`;
		xml += `</v1:Billing>`;

		xml += `<v1:Shipping>`;
		xml += `<v1:Name>${order_info.shipping_firstname} ${order_info.shipping_lastname}</v1:Name>`;
		xml += `<v1:Address1>${order_info.shipping_address_1}</v1:Address1>`;
		xml += `<v1:Address2>${order_info.shipping_address_2}</v1:Address2>`;
		xml += `<v1:City>${order_info.shipping_city}</v1:City>`;
		xml += `<v1:State>${order_info.shipping_zone}</v1:State}`;
		xml += `<v1:Zip>${order_info.shipping_postcode}</v1:Zip}`;
		xml += `<v1:Country>${order_info.shipping_iso_code_2}</v1:Country}`;
		xml += `</v1:Shipping>`;

		xml += `</v1:Transaction>`;
		xml += `</ipgapi:IPGApiOrderRequest>`;
		xml += `</SOAP-ENV:Body>`;
		xml += `</SOAP-ENV:Envelope>`;

		try {
			const response = await require('axios').post(this.config.soap_url, xml, {
				headers: { 'Content-Type': 'text/xml' },
				httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
			});

			const responseXml = await parseStringPromise(response.data);

			const namespaces = {
				ipgapi: 'http://ipg-online.com/ipgapi/schemas/ipgapi',
				soap: 'http://schemas.xmlsoap.org/soap/envelope/'
			};

			const responseData = {
				fault: this.extractValue(responseXml, '//soap:Fault/detail', namespaces),
				provider: this.extractValue(responseXml, '//ipgapi:CommercialServiceProvider', namespaces),
				transaction_time: this.extractValue(responseXml, '//ipgapi:TransactionTime', namespaces),
				reference_number: this.extractValue(responseXml, '//ipgapi:ProcessorReferenceNumber', namespaces),
				response_message: this.extractValue(responseXml, '//ipgapi:ProcessorResponseMessage', namespaces),
				response_code: this.extractValue(responseXml, '//ipgapi:ProcessorResponseCode', namespaces),
				error: this.extractValue(responseXml, '//ipgapi:ErrorMessage', namespaces),
				order_id: this.extractValue(responseXml, '//ipgapi:OrderId', namespaces),
				approval_code: this.extractValue(responseXml, '//ipgapi:ApprovalCode', namespaces),
				t_date: this.extractValue(responseXml, '//ipgapi:TDate', namespaces),
				transaction_result: this.extractValue(responseXml, '//ipgapi:TransactionResult', namespaces),
				payment_type: this.extractValue(responseXml, '//ipgapi:PaymentType', namespaces),
				brand: this.extractValue(responseXml, '//ipgapi:Brand', namespaces),
				country: this.extractValue(responseXml, '//ipgapi:Country', namespaces),
				receipt_number: this.extractValue(responseXml, '//ipgapi:ProcessorReceiptNumber', namespaces),
				trace_number: this.extractValue(responseXml, '//ipgapi:ProcessorTraceNumber', namespaces),
				ccv: this.extractValue(responseXml, '//ipgapi:ProcessorCCVResponse', namespaces),
				avs: this.extractValue(responseXml, '//ipgapi:AVSResponse', namespaces),
				card_number_ref: data.cc_number.slice(-4)
			};

			if (responseData.transaction_result === 'APPROVED' && token) {
				this.storeCard(token, this.customer.id, responseData.brand, data.cc_expire_date_month, data.cc_expire_date_year, data.cc_number.slice(-4));
			}

			await this.logger('INFO', responseData);
			return responseData;
		} catch (error) {
			await this.logger('ERROR', error.message);
			throw error;
		}
	}


	async call(xml) {
		try {
			const response = await require('axios').post("https://test.ipg-online.com/ipgapi/services", xml, {
				headers: { 'Content-Type': 'text/xml' },
				auth: {
					username: this.config.get('firstdata_remote_user_id'),
					password: this.config.get('firstdata_remote_password')
				}, httpsAgent: new (require('https').Agent)({
					cert: fs.readFileSync(this.config.get('firstdata_remote_certificate')),
					key: fs.readFileSync(this.config.get('firstdata_remote_key')),
					passphrase: this.config.get('firstdata_remote_key_pw'),
					ca: fs.readFileSync(this.config.get('firstdata_remote_ca')),
					rejectUnauthorized: true
				}), timeout: 60000
			});
			await this.logger('Post data: ' + JSON.stringify(this.request.post, true));
			await this.logger('Request: ' + xml);
			await this.logger('Curl response info: ' + JSON.stringify(curl_getinfo(ch), 1));
			await this.logger('Curl response: ' + response.data);
			return response.data;
		} catch (error) {
			await this.logger('ERROR', error.message);
			return error;
		}
	}

	async addOrder(order_info, capture_result) {
		let settle_status = 0;
		if (Number(this.config.get('firstdata_remote_auto_settle')) == 1) {
			settle_status = 1;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_remote_order` SET `order_id` = '" + order_info['order_id'] + "', `order_ref` = '" + this.db.escape(capture_result['order_id']) + "', `authcode` = '" + this.db.escape(capture_result['approval_code']) + "', `tdate` = '" + this.db.escape(capture_result['t_date']) + "', `date_added` = now(), `date_modified` = now(), `capture_status` = '" + settle_status + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false) + "'");

		return this.db.getLastId();
	}

	async addTransaction(firstdata_remote_order_id, type, order_info = array()) {
		let amount = 0.00;
		if ((order_info.order_id)) {
			amount = this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false);
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_remote_order_transaction` SET `firstdata_remote_order_id` = '" + firstdata_remote_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + amount + "'");
	}

	async logger(message) {
		if (Number(this.config.get('firstdata_remote_debug')) == 1) {
			const log = new Log('firstdata_remote.log');
			log.write(message);
		}
	}

	async addHistory(order_id, order_status_id, comment) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_history` SET `order_id` = '" + order_id + "', `order_status_id` = '" + order_status_id + "', `notify` = '0', `comment` = '" + this.db.escape(comment) + "', `date_added` = NOW()");
	}

	async mapCurrency(code) {
		const currency = {
			'GBP': 826,
			'USD': 840,
			'EUR': 978,
		};

		if (currency[code]) {
			return currency[code];
		} else {
			return false;
		}
	}

	async getStoredCards() {
		const customer_id = await this.customer.getId();

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "firstdata_remote_card WHERE customer_id = '" + customer_id + "'");

		return query.rows;
	}

	async storeCard(token, customer_id, type, month, year, digits) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_remote_card` SET `customer_id` = '" + customer_id + "', `date_added` = now(), `token` = '" + this.db.escape(token) + "', `card_type` = '" + this.db.escape(type) + "', `expire_month` = '" + this.db.escape(month) + "', `expire_year` = '" + this.db.escape(year) + "', `digits` = '" + this.db.escape(digits) + "'");
	}
}