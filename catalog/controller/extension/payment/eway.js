module.exports = class ControllerExtensionPaymentEway extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/eway');

		data['payment_type'] = this.config.get('payment_eway_payment_type');

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

		this.load.model('checkout/order',this);

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		amount = this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false);

		if (this.config.get('payment_eway_test')) {
			data['text_testing'] = this.language.get('text_testing');
			data['Endpoint'] = 'Sandbox';
		} else {
			data['text_testing'] = '';
			data['Endpoint'] = 'Production';
		}

		this.load.model('localisation/zone',this);

		payment_zone_info = await this.model_localisation_zone.getZone(order_info['payment_zone_id']);
		payment_zone_code = (payment_zone_info['code']) ? payment_zone_info['code'] : '';

		shipping_zone_info = await this.model_localisation_zone.getZone(order_info['shipping_zone_id']);
		shipping_zone_code = (shipping_zone_info['code']) ? shipping_zone_info['code'] : '';

		request = new stdClass();

		request.Customer = new stdClass();
		request.Customer.Title = 'Mr+';
		request.Customer.FirstName = substr(order_info['payment_firstname'], 0, 50);
		request.Customer.LastName = substr(order_info['payment_lastname'], 0, 50);
		request.Customer.CompanyName = substr(order_info['payment_company'], 0, 50);
		request.Customer.Street1 = substr(order_info['payment_address_1'], 0, 50);
		request.Customer.Street2 = substr(order_info['payment_address_2'], 0, 50);
		request.Customer.City = substr(order_info['payment_city'], 0, 50);
		request.Customer.State = substr(payment_zone_code, 0, 50);
		request.Customer.PostalCode = substr(order_info['payment_postcode'], 0, 30);
		request.Customer.Country = strtolower(order_info['payment_iso_code_2']);
		request.Customer.Email = order_info['email'];
		request.Customer.Phone = substr(order_info['telephone'], 0, 32);

		request.ShippingAddress = new stdClass();
		request.ShippingAddress.FirstName = substr(order_info['shipping_firstname'], 0, 50);
		request.ShippingAddress.LastName = substr(order_info['shipping_lastname'], 0, 50);
		request.ShippingAddress.Street1 = substr(order_info['shipping_address_1'], 0, 50);
		request.ShippingAddress.Street2 = substr(order_info['shipping_address_2'], 0, 50);
		request.ShippingAddress.City = substr(order_info['shipping_city'], 0, 50);
		request.ShippingAddress.State = substr(shipping_zone_code, 0, 50);
		request.ShippingAddress.PostalCode = substr(order_info['shipping_postcode'], 0, 30);
		request.ShippingAddress.Country = strtolower(order_info['shipping_iso_code_2']);
		request.ShippingAddress.Email = order_info['email'];
		request.ShippingAddress.Phone = substr(order_info['telephone'], 0, 32);
		request.ShippingAddress.ShippingMethod = "Unknown";

		invoice_desc = '';
		for (let product of await this.cart.getProducts()) {
			item_price = this.currency.format(product['price'], order_info['currency_code'], false, false);
			item_total = this.currency.format(product['total'], order_info['currency_code'], false, false);
			item = new stdClass();
			item.SKU = substr(product['product_id'], 0, 12);
			item.Description = substr(product['name'], 0, 26);
			item.Quantity = strval(product['quantity']);
			item.UnitCost = this.lowestDenomination(item_price, order_info['currency_code']);
			item.Total = this.lowestDenomination(item_total, order_info['currency_code']);

			request.Items.push(item;
			invoice_desc += product['name'] + ', ';
		}
		invoice_desc = substr(invoice_desc, 0, -2);
		if (strlen(invoice_desc) > 64) {
			invoice_desc = substr(invoice_desc, 0, 61) + '+++';
		}

		shipping = this.currency.format(order_info['total'] - this.cart.getSubTotal(), order_info['currency_code'], false, false);

		if (shipping > 0) {
			item = new stdClass();
			item.SKU = '';
			item.Description = substr(this.language.get('text_shipping'), 0, 26);
			item.Quantity = 1;
			item.UnitCost = this.lowestDenomination(shipping, order_info['currency_code']);
			item.Total = this.lowestDenomination(shipping, order_info['currency_code']);

			request.Items.push(item;
		}

		opt1 = new stdClass();
		opt1.Value = order_info['order_id'];
		request.Options = array(opt1);

		request.Payment = new stdClass();
		request.Payment.TotalAmount = this.lowestDenomination(amount, order_info['currency_code']);
		request.Payment.InvoiceNumber = this.session.data['order_id'];
		request.Payment.InvoiceDescription = invoice_desc;
		request.Payment.InvoiceReference = substr(this.config.get('config_name'), 0, 40) + ' - #' + order_info['order_id'];
		request.Payment.CurrencyCode = order_info['currency_code'];

		request.RedirectUrl = await this.url.link('extension/payment/eway/callback', '', true);
		if (this.config.get('payment_eway_transaction_method') == 'auth') {
			request.Method = 'Authorise';
		} else {
			request.Method = 'ProcessPayment';
		}
		request.TransactionType = 'Purchase';
		request.DeviceID = 'opencart-' + VERSION + ' eway-trans-2+1+2';
		request.CustomerIP = this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : '');
		request.PartnerID = '0f1bec3642814f89a2ea06e7d2800b7f';

		this.load.model('extension/payment/eway');
		template = 'eway';
		if (this.config.get('payment_eway_paymode') == 'iframe') {
			request.CancelUrl = 'http://www.example+org';
			request.CustomerReadOnly = true;
			result = await this.model_extension_payment_eway.getSharedAccessCode(request);

			template = 'eway_iframe';
		} else {
			result = await this.model_extension_payment_eway.getAccessCode(request);
		}

		// Check if any error returns
		if ((result.Errors)) {
			error_array = explode(",", result.Errors);
			lbl_error = "";
			for (error_array of error) {
				error = this.language.get('text_card_message_' + error);
				lbl_error += error + "<br />\n";
			}
			this.log.write('eWAY Payment error: ' + lbl_error);
		}

		if ((lbl_error)) {
			data['error'] = lbl_error;
		} else {
			if (this.config.get('payment_eway_paymode') == 'iframe') {
				data['callback'] = await this.url.link('extension/payment/eway/callback', 'AccessCode=' + result.AccessCode, true);
				data['SharedPaymentUrl'] = result.SharedPaymentUrl;
			}
			data['action'] = result.FormActionURL;
			data['AccessCode'] = result.AccessCode;
		}

		return await this.load.view('extension/payment/' + template, data);
	}

	async lowestDenomination(value, currency) {
		power = this.currency.getDecimalPlace(currency);

		value = value;

		return (value * pow(10, power));
	}

	async ValidateDenomination(value, currency) {
		power = this.currency.getDecimalPlace(currency);

		value = value;

		return (value * pow(10, '-' + power));
	}

	async callback() {
		await this.load.language('extension/payment/eway');

		if ((this.request.get['AccessCode']) || (this.request.get['amp;AccessCode'])) {

			this.load.model('extension/payment/eway');

			if ((this.request.get['amp;AccessCode'])) {
				access_code = this.request.get['amp;AccessCode'];
			} else {
				access_code = this.request.get['AccessCode'];
			}

			result = await this.model_extension_payment_eway.getAccessCodeResult(access_code);

			is_error = false;

			// Check if any error returns
			if ((result.Errors)) {
				error_array = explode(",", result.Errors);
				is_error = true;
				lbl_error = '';
				for (error_array of error) {
					error = this.language.get('text_card_message_' + error);
					lbl_error += error + ", ";
				}
				this.log.write('eWAY error: ' + lbl_error);
			}
			if (!is_error) {
				fraud = false;
				if (!result.TransactionStatus) {
					error_array = explode(", ", result.ResponseMessage);
					is_error = true;
					lbl_error = '';
					log_error = '';
					for (error_array of error) {
						// Don't show fraud issues to customers
						if (stripos(error, 'F') === false) {
							lbl_error += this.language.get('text_card_message_' + error);
						} else {
							fraud = true;
						}
						log_error += this.language.get('text_card_message_' + error) + ", ";
					}
					log_error = substr(log_error, 0, -2);
					this.log.write('eWAY payment failed: ' + log_error);
				}
			}

			this.load.model('checkout/order',this);

			if (is_error) {
				if (fraud) {
					this.response.setRedirect(await this.url.link('checkout/failure', '', true));
				} else {
					this.session.data['error'] = this.language.get('text_transaction_failed');
					this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
				}
			} else {
				order_id = result.Options[0].Value;

				order_info = await this.model_checkout_order.getOrder(order_id);

				this.load.model('extension/payment/eway');
				eway_order_data = array(
					'order_id' : order_id,
					'transaction_id' : result.TransactionID,
					'amount' : this.ValidateDenomination(result.TotalAmount, order_info['currency_code']),
					'currency_code' : order_info['currency_code'],
					'debug_data' : json_encode(result)
				});

				error_array = explode(", ", result.ResponseMessage);
				log_error = '';
				for (error_array of error) {
					if (stripos(error, 'F') !== false) {
						fraud = true;
						log_error += this.language.get('text_card_message_' + error) + ", ";
					}
				}
				log_error = substr(log_error, 0, -2);

				eway_order_id = await this.model_extension_payment_eway.addOrder(eway_order_data);
				await this.model_extension_payment_eway.addTransaction(eway_order_id, this.config.get('payment_eway_transaction_method'), result.TransactionID, order_info);

				if (fraud) {
					message = 'Suspected fraud order: ' + log_error + "\n";
				} else {
					message = "eWAY Payment accepted\n";
				}
				message += 'Transaction ID: ' + result.TransactionID + "\n";
				message += 'Authorisation Code: ' + result.AuthorisationCode + "\n";
				message += 'Card Response Code: ' + result.ResponseCode + "\n";

				if (fraud) {
					await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_eway_order_status_fraud_id'), message);
				} else if (this.config.get('payment_eway_transaction_method') == 'payment') {
					await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_eway_order_status_id'), message);
				} else {
					await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_eway_order_status_auth_id'), message);
				}

				if (!empty(result.Customer.TokenCustomerID) && await this.customer.isLogged() && !await this.model_checkout_order.checkToken(result.Customer.TokenCustomerID)) {
					card_data = array();
					card_data['customer_id'] = await this.customer.getId();
					card_data['Token'] = result.Customer.TokenCustomerID;
					card_data['Last4Digits'] = substr(str_replace(' ', '', result.Customer.CardDetails.Number), -4, 4);
					card_data['ExpiryDate'] = result.Customer.CardDetails.ExpiryMonth + '/' + result.Customer.CardDetails.ExpiryYear;
					card_data['CardType'] = '';
					await this.model_extension_payment_eway.addFullCard(this.session.data['order_id'], card_data);
				}

				this.response.setRedirect(await this.url.link('checkout/success', '', true));
			}
		}
	}

}