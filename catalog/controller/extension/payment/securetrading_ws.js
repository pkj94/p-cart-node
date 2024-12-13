module.exports = class ControllerExtensionPaymentSecureTradingWs extends Controller {
	async index() {
const data = {};
		this.load.model('checkout/order',this);
		await this.load.language('extension/payment/securetrading_ws');

		if(!(this.session.data['order_id'])) {
			return false;
		}

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		if (order_info) {
			data['entry_type'] = this.language.get('entry_type');
			data['entry_number'] = this.language.get('entry_number');
			data['entry_expire_date'] = this.language.get('entry_expire_date');
			data['entry_cvv2'] = this.language.get('entry_cvv2');

			data['text_card_details'] = this.language.get('text_card_details');
			data['text_wait'] = this.language.get('text_wait');

			data['button_confirm'] = this.language.get('button_confirm');

			cards = array(
				'AMEX' : 'American Express',
				'VISA' : 'Visa',
				'DELTA' : 'Visa Debit',
				'ELECTRON' : 'Visa Electron',
				'PURCHASING' : 'Visa Purchasing',
				'VPAY' : 'V Pay',
				'MASTERCARD' : 'MasterCard',
				'MASTERCARDDEBIT' : 'MasterCard Debit',
				'MAESTRO' : 'Maestro',
				'PAYPAL' : 'PayPal',
			});

			for (i = 1; i <= 12; i++) {
				data['months'].push(array(
					'text' : sprintf('%02d', i),
					'value' : sprintf('%02d', i)
				});
			}

			today = getdate();

			data['year_expire'] = array();

			for (i = today['year']; i < today['year'] + 11; i++) {
				data['year_expire'].push(array(
					'text' : sprintf('%02d', i % 100),
					'value' : sprintf('%04d', i)
				});
			}

			data['cards'] = array();

			for (this.config.get('payment_securetrading_ws_cards_accepted') of card_type) {
				data['cards'][card_type] = cards[card_type];
			}

			return await this.load.view('extension/payment/securetrading_ws', data);
		}
	}

	async process() {
		this.load.model('checkout/order',this);
		this.load.model('localisation/country',this);
		this.load.model('extension/payment/securetrading_ws');
		await this.load.language('extension/payment/securetrading_ws');

		if(!(this.session.data['order_id'])) {
			return false;
		}

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		if (order_info) {
			if (this.config.get('payment_securetrading_ws_3d_secure')) {
				requestblock_xml = new SimpleXMLElement('<requestblock></requestblock>');
				requestblock_xml.addAttribute('version', '3+67');
				requestblock_xml.addChild('alias', this.config.get('payment_securetrading_ws_username'));

				request_node = requestblock_xml.addChild('request');
				request_node.addAttribute('type', 'THREEDQUERY');

				merchant_node = request_node.addChild('merchant');
				merchant_node.addChild('orderreference', order_info['order_id']);
				merchant_node.addChild('termurl', await this.url.link('extension/payment/securetrading_ws/threedreturn', '', true));

				settlement_node = request_node.addChild('settlement');
				settlement_date = date('Y-m-d', strtotime(date('Y-m-d') + ' +' + this.config.get('payment_securetrading_ws_settle_due_date') + ' days'));
				settlement_node.addChild('settleduedate', settlement_date);
				settlement_node.addChild('settlestatus', this.config.get('payment_securetrading_ws_settle_status'));

				customer_node = request_node.addChild('customer');
				customer_node.addChild('useragent', order_info['user_agent']);
				customer_node.addChild('accept', this.request.server['HTTP_ACCEPT']);

				billing_node = request_node.addChild('billing');
				amount_node = billing_node.addChild('amount', str_replace('+', '', await this.model_extension_payment_securetrading_ws.format(order_info['total'], order_info['currency_code'], order_info['currency_value'])));
				amount_node.addAttribute('currencycode', order_info['currency_code']);

				billing_node.addChild('premise', order_info['payment_address_1']);
				billing_node.addChild('postcode', order_info['payment_postcode']);

				name_node = billing_node.addChild('name');
				name_node.addChild('first', order_info['payment_firstname']);
				name_node.addChild('last', order_info['payment_lastname']);

				payment_node = billing_node.addChild('payment');
				payment_node.addAttribute('type', this.request.post['type']);
				payment_node.addChild('pan', this.request.post['number']);
				payment_node.addChild('expirydate', this.request.post['expire_month'] + '/' + this.request.post['expire_year']);
				payment_node.addChild('securitycode', this.request.post['cvv2']);

				operation_node = request_node.addChild('operation');
				operation_node.addChild('sitereference', this.config.get('payment_securetrading_ws_site_reference'));
				operation_node.addChild('accounttypedescription', 'ECOM');

				response = await this.model_extension_payment_securetrading_ws.call(requestblock_xml.asXML());

				if (response !== false) {
					response_xml = simplexml_load_string(response);

					if (response_xml.response['type'] == 'THREEDQUERY') {
						error_code = response_xml.response.error.code;

						if (error_code == 0) {
							enrolled = response_xml.response.threedsecure.enrolled;

							if (enrolled == 'Y') {
								acs_url = response_xml.response.threedsecure.acsurl;
								md = response_xml.response.threedsecure.md;
								pareq = response_xml.response.threedsecure.pareq;

								await this.model_extension_payment_securetrading_ws.addMd(order_info['order_id'], md);

								json['status'] = 1;
								json['acs_url'] = acs_url;
								json['md'] = md;
								json['pareq'] = pareq;
								json['term_url'] = await this.url.link('extension/payment/securetrading_ws/threedreturn', '', true);
							} else {
								requestblock_xml = new SimpleXMLElement('<requestblock></requestblock>');
								requestblock_xml.addAttribute('version', '3+67');
								requestblock_xml.addChild('alias', this.config.get('payment_securetrading_ws_username'));

								request_node = requestblock_xml.addChild('request');
								request_node.addAttribute('type', 'AUTH');

								request_node.addChild('merchant').addChild('orderreference', order_info['order_id']);

								operation_node = request_node.addChild('operation');
								operation_node.addChild('parenttransactionreference', response_xml.response.transactionreference);
								operation_node.addChild('sitereference', this.config.get('payment_securetrading_ws_site_reference'));

								response = await this.model_extension_payment_securetrading_ws.call(requestblock_xml.asXML());

								json = this.processAuthResponse(response, order_info['order_id']);
							}
						} else {
							json['message'] = this.language.get('text_transaction_declined');
							json['status'] = 0;
						}
					} else {
						json['message'] = this.language.get('text_transaction_failed');
						json['status'] = 0;
					}
				} else {
					json['message'] = this.language.get('text_connection_error');
					json['status'] = 0;
				}
			} else {
				country = await this.model_localisation_country.getCountry(order_info['payment_country_id']);

				const json = {};

				requestblock_xml = new SimpleXMLElement('<requestblock></requestblock>');
				requestblock_xml.addAttribute('version', '3+67');
				requestblock_xml.addChild('alias', this.config.get('payment_securetrading_ws_username'));

				request_node = requestblock_xml.addChild('request');
				request_node.addAttribute('type', 'AUTH');
				operation_node = request_node.addChild('operation');
				operation_node.addChild('sitereference', this.config.get('payment_securetrading_ws_site_reference'));
				operation_node.addChild('accounttypedescription', 'ECOM');

				merchant_node = request_node.addChild('merchant');
				merchant_node.addChild('orderreference', order_info['order_id']);

				settlement_node = request_node.addChild('settlement');
				settlement_date = date('Y-m-d', strtotime(date('Y-m-d') + ' +' + this.config.get('payment_securetrading_ws_settle_due_date') + ' days'));
				settlement_node.addChild('settleduedate', settlement_date);
				settlement_node.addChild('settlestatus', this.config.get('payment_securetrading_ws_settle_status'));

				billing_node = request_node.addChild('billing');
				billing_node.addChild('premise', order_info['payment_address_1']);
				billing_node.addChild('street', order_info['payment_address_2']);
				billing_node.addChild('town', order_info['payment_city']);
				billing_node.addChild('county', order_info['payment_zone']);
				billing_node.addChild('country', country['iso_code_2']);
				billing_node.addChild('postcode', order_info['payment_postcode']);
				billing_node.addChild('email', order_info['email']);
				name_node = billing_node.addChild('name');

				name_node.addChild('first', order_info['payment_firstname']);
				name_node.addChild('last', order_info['payment_lastname']);

				amount_node = billing_node.addChild('amount', str_replace('+', '', await this.model_extension_payment_securetrading_ws.format(order_info['total'], order_info['currency_code'], order_info['currency_value'])));
				amount_node.addAttribute('currencycode', order_info['currency_code']);

				payment_node = billing_node.addChild('payment');
				payment_node.addAttribute('type', this.request.post['type']);
				payment_node.addChild('pan', this.request.post['number']);
				payment_node.addChild('expirydate', this.request.post['expire_month'] + '/' + this.request.post['expire_year']);
				payment_node.addChild('securitycode', this.request.post['cvv2']);

				response = await this.model_extension_payment_securetrading_ws.call(requestblock_xml.asXML());

				json = this.processAuthResponse(response, order_info['order_id']);
			}
			this.response.setOutput(json);
		}
	}

	async threedreturn() {
		this.load.model('checkout/order',this);
		this.load.model('extension/payment/securetrading_ws');
		await this.load.language('extension/payment/securetrading_ws');

		// Using unmodified _POST to access values of per Secure Trading's requirements
		if ((_POST['PaRes']) && !empty(_POST['PaRes']) && (_POST['MD']) && !empty(_POST['MD'])) {
			md = _POST['MD'];
			pares = _POST['PaRes'];

			order_id = await this.model_extension_payment_securetrading_ws.getOrderId(md);

			if (order_id) {
				requestblock_xml = new SimpleXMLElement('<requestblock></requestblock>');
				requestblock_xml.addAttribute('version', '3+67');
				requestblock_xml.addChild('alias', this.config.get('payment_securetrading_ws_username'));

				request_node = requestblock_xml.addChild('request');
				request_node.addAttribute('type', 'AUTH');

				request_node.addChild('merchant').addChild('orderreference', order_id);

				operation_node = request_node.addChild('operation');
				operation_node.addChild('md', md);
				operation_node.addChild('pares', pares);

				response = await this.model_extension_payment_securetrading_ws.call(requestblock_xml.asXML());

				if (response) {
					response_xml = simplexml_load_string(response);

					error_code = response_xml.response.error.code;

					if (error_code == 0) {
						postcode_status = response_xml.response.security.postcode;
						security_code_status = response_xml.response.security.securitycode;
						address_status = response_xml.response.security.address;
						authcode = response_xml.response.authcode;
						threed_status = response_xml.response.threedsecure.status;

						status_code_mapping = array(
							0 : this.language.get('text_not_given'),
							1 : this.language.get('text_not_checked'),
							2 : this.language.get('text_match'),
							4 : this.language.get('text_not_match'),
						});

						threed_status_mapping = array(
							'Y' : this.language.get('text_authenticated'),
							'N' : this.language.get('text_not_authenticated'),
							'A' : this.language.get('text_authentication_not_completed'),
							'U' : this.language.get('text_unable_to_perform'),
						});

						message = sprintf(this.language.get('text_auth_code'), authcode) + "\n";
						message += sprintf(this.language.get('text_postcode_check'), status_code_mapping[postcode_status]) + "\n";
						message += sprintf(this.language.get('text_security_code_check'), status_code_mapping[security_code_status]) + "\n";
						message += sprintf(this.language.get('text_address_check'), status_code_mapping[address_status]) + "\n";
						message += sprintf(this.language.get('text_3d_secure_check'), threed_status_mapping[threed_status]) + "\n";

						transaction_reference = response_xml.response.transactionreference;
						await this.model_extension_payment_securetrading_ws.updateReference(order_id, transaction_reference);

						await this.model_extension_payment_securetrading_ws.confirmOrder(order_id, this.config.get('payment_securetrading_ws_order_status_id'));
						await this.model_extension_payment_securetrading_ws.updateOrder(order_id, this.config.get('payment_securetrading_ws_order_status_id'), message);

						this.response.setRedirect(await this.url.link('checkout/success', '', true));
					} else {
						await this.model_extension_payment_securetrading_ws.updateOrder(order_id, this.config.get('payment_securetrading_ws_declined_order_status_id'));

						this.session.data['error'] = this.language.get('text_transaction_declined');
						this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
					}
				} else {
					this.session.data['error'] = this.language.get('error_failure');
					this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
				}
			} else {
				this.session.data['error'] = this.language.get('error_failure');
				this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
			}
		} else {
			this.session.data['error'] = this.language.get('error_failure');
			this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
		}
	}

	async processAuthResponse(response, order_id) {
		const json = {};

		if (response !== false) {
			response_xml = simplexml_load_string(response);

			if (response_xml.response['type'] == 'AUTH') {
				error_code = response_xml.response.error.code;

				if (error_code == 0) {
					postcode_status = response_xml.response.security.postcode;
					security_code_status = response_xml.response.security.securitycode;
					address_status = response_xml.response.security.address;
					authcode = response_xml.response.authcode;

					status_code_mapping = array(
						0 : this.language.get('text_not_given'),
						1 : this.language.get('text_not_checked'),
						2 : this.language.get('text_match'),
						4 : this.language.get('text_not_match'),
					});

					message = sprintf(this.language.get('text_auth_code'), authcode) + "\n";
					message += sprintf(this.language.get('text_postcode_check'), status_code_mapping[postcode_status]) + "\n";
					message += sprintf(this.language.get('text_security_code_check'), status_code_mapping[security_code_status]) + "\n";
					message += sprintf(this.language.get('text_address_check'), status_code_mapping[address_status]) + "\n";

					transaction_reference = response_xml.response.transactionreference;
					await this.model_extension_payment_securetrading_ws.updateReference(order_id, transaction_reference);

					await this.model_extension_payment_securetrading_ws.confirmOrder(order_id, this.config.get('payment_securetrading_ws_order_status_id'));
					await this.model_extension_payment_securetrading_ws.updateOrder(order_id, this.config.get('payment_securetrading_ws_order_status_id'), message);

					json['redirect'] = await this.url.link('checkout/success');
					json['status'] = 1;
				} else {
					await this.model_extension_payment_securetrading_ws.updateOrder(order_id, this.config.get('payment_securetrading_ws_declined_order_status_id'));

					json['message'] = this.language.get('text_transaction_declined');
					json['status'] = 0;
				}
			} else {
				await this.model_extension_payment_securetrading_ws.updateOrder(order_id, this.config.get('payment_securetrading_ws_failed_order_status_id'));

				json['message'] = this.language.get('text_transaction_failed');
				json['status'] = 0;
			}
		} else {
			json['message'] = this.language.get('text_connection_error');
			json['status'] = 0;
		}

		return json;
	}
}
