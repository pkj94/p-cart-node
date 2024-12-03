const mt_rand = require("locutus/php/math/mt_rand");
const is_string = require("locutus/php/var/is_string");

module.exports = class PayPal {
	server = {
		'sandbox': 'https://api.sandbox.paypal.com',
		'production': 'https://api.paypal.com'
	};
	environment = 'sandbox';
	partner_id = '';
	client_id = '';
	secret = '';
	partner_attribution_id = '';
	access_token = '';
	errors = [];
	last_response = {};

	//IN:  paypal info
	constructor(paypal_info) {
		if ((paypal_info['partner_id'])) {
			this.partner_id = paypal_info['partner_id'];
		}

		if ((paypal_info['client_id'])) {
			this.client_id = paypal_info['client_id'];
		}

		if ((paypal_info['secret'])) {
			this.secret = paypal_info['secret'];
		}

		if ((paypal_info['environment']) && ((paypal_info['environment'] == 'production') || (paypal_info['environment'] == 'sandbox'))) {
			this.environment = paypal_info['environment'];
		}

		if ((paypal_info['partner_attribution_id'])) {
			this.partner_attribution_id = paypal_info['partner_attribution_id'];
		}
	}

	//IN:  token info
	//OUT: access token, if no return - check errors
	async setAccessToken(token_info) {
		let command = '/v1/oauth2/token';

		let params = token_info;

		let result = await this.execute('POST', command, params);

		if ((result['access_token'])) {
			this.access_token = result['access_token'];

			return result;
		} else {
			return false;
		}
	}

	//OUT: access token
	async getAccessToken() {
		return this.access_token;
	}

	//OUT: access token, if no return - check errors
	async getClientToken() {
		let command = '/v1/identity/generate-token';

		let result = await this.execute('POST', command);

		if ((result['client_token'])) {
			return result['client_token'];
		} else {
			return false;
		}
	}

	//OUT: merchant info, if no return - check errors
	async getUserInfo() {
		let command = '/v1/identity/oauth2/userinfo';

		let params = {
			'schema': 'paypalv1.1'
		};

		let result = await this.execute('GET', command, params);

		if ((result['user_id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  partner id
	//OUT: merchant info, if no return - check errors
	async getSellerCredentials(partner_id) {
		let command = '/v1/customer/partners/' + partner_id + '/merchant-integrations/credentials';

		let result = await this.execute('GET', command);

		if ((result['client_id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  partner id, merchant id
	//OUT: merchant info, if no return - check errors
	async getSellerStatus(partner_id, merchant_id) {
		let command = '/v1/customer/partners/' + partner_id + '/merchant-integrations/' + merchant_id;

		let result = await this.execute('GET', command);

		if ((result['merchant_id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  webhook info
	async createWebhook(webhook_info) {
		let command = '/v1/notifications/webhooks';

		let params = webhook_info;

		let result = await this.execute('POST', command, params, true);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  webhook id
	//OUT: webhook info, if no return - check errors
	async updateWebhook(webhook_id, webhook_info) {
		let command = '/v1/notifications/webhooks/' + webhook_id;

		let params = webhook_info;

		let result = await this.execute('PATCH', command, params, true);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  webhook id
	async deleteWebhook(webhook_id) {
		let command = '/v1/notifications/webhooks/' + webhook_id;

		let result = await this.execute('DELETE', command);

		return true;
	}

	//IN:  webhook id
	//OUT: webhook info, if no return - check errors
	async getWebhook(webhook_id) {
		let command = '/v1/notifications/webhooks/' + webhook_id;

		let result = await this.execute('GET', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//OUT: webhooks info, if no return - check errors
	async getWebhooks() {
		let command = '/v1/notifications/webhooks';

		let result = await this.execute('GET', command);

		if ((result['webhooks'])) {
			return result['webhooks'];
		} else {
			return false;
		}
	}

	//IN:  webhook event id
	//OUT: webhook event info, if no return - check errors
	async getWebhookEvent(webhook_event_id) {
		let command = '/v1/notifications/webhooks-events/' + webhook_event_id;

		let result = await this.execute('GET', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//OUT: webhook events info, if no return - check errors
	async getWebhookEvents() {
		let command = '/v1/notifications/webhooks-events';

		let result = await this.execute('GET', command);

		if ((result['events'])) {
			return result['events'];
		} else {
			return false;
		}
	}

	//IN:  payment token info
	async createPaymentToken(payment_token_info) {
		let command = '/v3/vault/payment-tokens';

		let params = payment_token_info;

		let result = await this.execute('POST', command, params, true);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  payment token id
	async deletePaymentToken(payment_token_id) {
		let command = '/v3/vault/payment-tokens/' + payment_token_id;

		let result = await this.execute('DELETE', command);

		return true;
	}

	//IN:  payment token id
	//OUT: payment token info, if no return - check errors
	async getPaymentToken(payment_token_id) {
		let command = '/v3/vault/payment-tokens/' + payment_token_id;

		let result = await this.execute('GET', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  customer id
	//OUT: payment tokens info, if no return - check errors
	async getPaymentTokens(customer_id) {
		let command = '/v3/vault/payment-tokens';

		let params = { customer_id: customer_id };

		let result = await this.execute('GET', command, params);

		if ((result['payment_tokens'])) {
			return result['payment_tokens'];
		} else {
			return false;
		}
	}

	//IN:  setup token info
	async createSetupToken(setup_token_info) {
		let command = '/v3/vault/setup-tokens';

		let params = setup_token_info;

		let result = await this.execute('POST', command, params, true);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  setup token id
	//OUT: setup token info, if no return - check errors
	async getSetupToken(setup_token_id) {
		let command = '/v3/vault/setup-tokens/' + setup_token_id;

		let result = await this.execute('GET', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  order info
	async createOrder(order_info) {
		let command = '/v2/checkout/orders';

		let params = order_info;

		let result = await this.execute('POST', command, params, true);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  order id
	//OUT: order info, if no return - check errors
	async updateOrder(order_id, order_info) {
		let command = '/v2/checkout/orders/' + order_id;

		let params = order_info;

		let result = await this.execute('PATCH', command, params, true);

		return true;
	}

	//IN:  order id
	//OUT: order info, if no return - check errors
	async getOrder(order_id) {
		let command = '/v2/checkout/orders/' + order_id;

		let result = await this.execute('GET', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  order id
	async setOrderAuthorize(order_id) {
		let command = '/v2/checkout/orders/' + order_id + '/authorize';

		let result = await this.execute('POST', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  order id
	async setOrderCapture(order_id) {
		let command = '/v2/checkout/orders/' + order_id + '/capture';

		let result = await this.execute('POST', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  transaction id
	async setPaymentCapture(transaction_id) {
		let command = '/v2/payments/authorizations/' + transaction_id + '/capture';

		let result = await this.execute('POST', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  transaction id
	async setPaymentReauthorize(transaction_id) {
		let command = '/v2/payments/authorizations/' + transaction_id + '/reauthorize';

		let result = await this.execute('POST', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  transaction id
	async setPaymentVoid(transaction_id) {
		let command = '/v2/payments/authorizations/' + transaction_id + '/void';

		let result = await this.execute('POST', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//IN:  transaction id
	async setPaymentRefund(transaction_id) {
		let command = '/v2/payments/captures/' + transaction_id + '/refund';

		let result = await this.execute('POST', command);

		if ((result['id'])) {
			return result;
		} else {
			return false;
		}
	}

	//OUT: number of errors
	async hasErrors() {
		return this.errors.length;
	}

	//OUT: array of errors
	async getErrors() {
		return this.errors;
	}

	//OUT: last response
	async getResponse() {
		return this.last_response;
	}

	async execute(method, command, params = {}, json = false) {
		this.errors = [];
		if (method && command) {
			const url = `${this.server[this.environment]}${command}`;
			const headers = {
				'Accept-Charset': 'utf-8',
				'Accept': 'application/json',
				'Accept-Language': 'en_US',
				'Content-Type': 'application/json',
				'PayPal-Request-Id': this.token(50),
				'PayPal-Partner-Attribution-Id': this.partnerAttributionId,
			};
			if (this.accessToken) {
				headers['Authorization'] = `Bearer ${this.accessToken}`;
			} else if (this.clientId && this.secret) {
				headers['Authorization'] = `Basic ${Buffer.from(`${this.clientId}:${this.secret}`).toString('base64')}`;
			} else if (this.clientId) {
				headers['Authorization'] = `Basic ${Buffer.from(this.clientId).toString('base64')}`;
			}
			let data = null;
			if (['post', 'patch', 'delete', 'put'].includes(method.toLowerCase())) {
				data = this.buildQuery(params, json);
			} else if (method.toLowerCase() === 'get') {
				command += `?${this.buildQuery(params, json)}`;
			} const options = {
				url, method,
				headers, data,
				timeout: 10000,
				validateStatus: function (status) {
					return status >= 200 && status < 300; // default 
				},
			};
			try {
				const response = await require('axios')(options);
				await this.debugLog(`RESPONSE: ${JSON.stringify(response.data)}`);
				if (response.data.error) {
					throw new Error(response.data.message);
				}
				return response.data.result;
			} catch (error) {
				await this.debugLog(`AXIOS ERROR! ERROR INFO: ${error}`);
				if (error.response) {
					if ([400, 401, 403].includes(error.response.status)) {
						if (error.response.status !== 401 && error.response.data.error) {
							throw new Error(error.response.data.message);
						} else {
							throw new Error("Access unavailable. Please re-connect.");
						}
					} else if (error.response.status === 402) {
						if (error.response.data.error) {
							throw new Error(error.response.data.message);
						} else {
							throw new Error("Access unavailable. Please re-connect.");
						}
					}
				}
				throw new Error("A temporary error was encountered. Please try again later.");
			}
		}
	}

	buildQuery(params, json) {
		if (is_string(params)) {
			return params;
		}

		if (json) {
			return JSON.stringify(params);
		} else {
			return http_build_query(params);
		}
	}

	token(length = 32) {
		// Create random token
		let string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		let max = string.length - 1;

		let token = '';

		for (i = 0; i < length; i++) {
			token += string[mt_rand(0, max)];
		}

		return token;
	}
}