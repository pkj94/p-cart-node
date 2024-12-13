module.exports = class ControllerExtensionPaymentWorldpay extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/worldpay');

		data['worldpay_script'] = 'https://cdn+worldpay+com/v1/worldpay.js';

		data['worldpay_client_key'] = this.config.get('payment_worldpay_client_key');

		data['form_submit'] = await this.url.link('extension/payment/worldpay/send', '', true);

		if (this.config.get('payment_worldpay_card') == '1' && await this.customer.isLogged()) {
			data['payment_worldpay_card'] = true;
		} else {
			data['payment_worldpay_card'] = false;
		}

		data['existing_cards'] = array();

		if (await this.customer.isLogged() && data['payment_worldpay_card']) {
			this.load.model('extension/payment/worldpay');
			data['existing_cards'] = await this.model_extension_payment_worldpay.getCards(await this.customer.getId());
		}

		recurring_products = await this.cart.getRecurringProducts();

		if (!empty(recurring_products)) {
			data['recurring_products'] = true;
		}

		return await this.load.view('extension/payment/worldpay', data);
	}

	async send() {
		await this.load.language('extension/payment/worldpay');
		this.load.model('checkout/order',this);
		this.load.model('localisation/country',this);
		this.load.model('extension/payment/worldpay');

		if(!(this.session.data['order_id'])) {
			return false;
		}

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		recurring_products = await this.cart.getRecurringProducts();

		if (empty(recurring_products)) {
			order_type = 'ECOM';
		} else {
			order_type = 'RECURRING';
		}

		country_info = await this.model_localisation_country.getCountry(order_info['payment_country_id']);

		billing_address = array(
			"address1" : order_info['payment_address_1'],
			"address2" : order_info['payment_address_2'],
			"address3" : '',
			"postalCode" : order_info['payment_postcode'],
			"city" : order_info['payment_city'],
			"state" : order_info['payment_zone'],
			"countryCode" : country_info['iso_code_2'],
		});

		order = array(
			"token" : this.request.post['token'],
			"orderType" : order_type,
			"amount" : Math.round(this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false)*100),
			"currencyCode" : order_info['currency_code'],
			"name" : order_info['firstname'] + ' ' + order_info['lastname'],
			"orderDescription" : order_info['store_name'] + ' - ' + date('Y-m-d H:i:s'),
			"customerOrderCode" : order_info['order_id'],
			"billingAddress" : billing_address
		});

		await this.model_extension_payment_worldpay.logger(order);

		response_data = await this.model_extension_payment_worldpay.sendCurl('orders', order);

		await this.model_extension_payment_worldpay.logger(response_data);

		if ((response_data.paymentStatus) && response_data.paymentStatus == 'SUCCESS') {
			await this.model_checkout_order.addOrderHistory(order_info['order_id'], this.config.get('config_order_status_id'));

			worldpay_order_id = await this.model_extension_payment_worldpay.addOrder(order_info, response_data.orderCode);

			await this.model_extension_payment_worldpay.addTransaction(worldpay_order_id, 'payment', order_info);

			if ((this.request.post['save-card'])) {
				response = await this.model_extension_payment_worldpay.sendCurl('tokens/' + this.request.post['token']);

				await this.model_extension_payment_worldpay.logger(response);

				expiry_date = mktime(0, 0, 0, 0, response.paymentMethod.expiryMonth, response.paymentMethod.expiryYear);

				if ((response.paymentMethod)) {
					card_data = array();
					card_data['customer_id'] = await this.customer.getId();
					card_data['Token'] = response.token;
					card_data['Last4Digits'] = response.paymentMethod.maskedCardNumber;
					card_data['ExpiryDate'] = date("m/y", expiry_date);
					card_data['CardType'] = response.paymentMethod.cardType;
					await this.model_extension_payment_worldpay.addCard(this.session.data['order_id'], card_data);
				}
			}

			//loop through any products that are recurring items
			for (recurring_products of item) {
				await this.model_extension_payment_worldpay.recurringPayment(item, this.session.data['order_id'] + rand(), this.request.post['token']);
			}

			this.response.setRedirect(await this.url.link('checkout/success', '', true));
		} else {

			this.session.data['error'] = this.language.get('error_process_order');
			this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
		}
	}

	async deleteCard() {
		await this.load.language('extension/payment/worldpay');
		this.load.model('extension/payment/worldpay');

		if ((this.request.post['token'])) {
			if (await this.model_extension_payment_worldpay.deleteCard(this.request.post['token'])) {
				json['success'] = this.language.get('text_card_success');
			} else {
				json['error'] = this.language.get('text_card_error');
			}

			if (count(await this.model_extension_payment_worldpay.getCards(await this.customer.getId()))) {
				json['existing_cards'] = true;
			}
		} else {
			json['error'] = this.language.get('text_error');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async webhook() {
		if ((this.request.get['token']) && hash_equals(this.config.get('payment_worldpay_secret_token'), this.request.get['token'])) {
			this.load.model('extension/payment/worldpay');
			message = JSON.parse(file_get_contents('php://input'), true);

			if ((message['orderCode'])) {
				order = await this.model_extension_payment_worldpay.getWorldpayOrder(message['orderCode']);
				await this.model_extension_payment_worldpay.logger(order);
				switch (message['paymentStatus']) {
					case 'SUCCESS':
						order_status_id = this.config.get('payment_worldpay_success_status_id');
						break;
					case 'FAILED':
						order_status_id = this.config.get('payment_worldpay_failed_status_id');
						break;
					case 'SETTLED':
						order_status_id = this.config.get('payment_worldpay_settled_status_id');
						break;
					case 'REFUNDED':
						order_status_id = this.config.get('payment_worldpay_refunded_status_id');
						break;
					case 'PARTIALLY_REFUNDED':
						order_status_id = this.config.get('payment_worldpay_partially_refunded_status_id');
						break;
					case 'CHARGED_BACK':
						order_status_id = this.config.get('payment_worldpay_charged_back_status_id');
						break;
					case 'INFORMATION_REQUESTED':
						order_status_id = this.config.get('payment_worldpay_information_requested_status_id');
						break;
					case 'INFORMATION_SUPPLIED':
						order_status_id = this.config.get('payment_worldpay_information_supplied_status_id');
						break;
					case 'CHARGEBACK_REVERSED':
						order_status_id = this.config.get('payment_worldpay_chargeback_reversed_status_id');
						break;
				}

				await this.model_extension_payment_worldpay.logger(order_status_id);
				if ((order['order_id'])) {
					this.load.model('checkout/order',this);
					await this.model_checkout_order.addOrderHistory(order['order_id'], order_status_id);
				}
			}
		}

		this.response.addHeader('HTTP/1+1 200 OK');
		this.response.addHeader('Content-Type: application/json');
	}

	async cron() {
		if (this.request.get['token'] == this.config.get('payment_worldpay_secret_token')) {
			this.load.model('extension/payment/worldpay');

			orders = await this.model_extension_payment_worldpay.cronPayment();

			await this.model_extension_payment_worldpay.updateCronJobRunTime();

			await this.model_extension_payment_worldpay.logger(orders);
		}
	}

}
