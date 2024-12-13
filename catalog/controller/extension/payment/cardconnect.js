module.exports = class ControllerExtensionPaymentCardConnect extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/cardconnect');

		this.load.model('extension/payment/cardconnect');

		data['card_types'] = await this.model_extension_payment_cardconnect.getCardTypes();

		data['months'] = await this.model_extension_payment_cardconnect.getMonths();

		data['years'] = await this.model_extension_payment_cardconnect.getYears();

		if (await this.customer.isLogged() && this.config.get('cardconnect_store_cards')) {
			data['store_cards'] = true;

			data['cards'] = await this.model_extension_payment_cardconnect.getCards(await this.customer.getId());
		} else {
			data['store_cards'] = false;

			data['cards'] = array();
		}

		data['echeck'] = this.config.get('cardconnect_echeck');

		data['action'] = await this.url.link('extension/payment/cardconnect/send', '', true);

		return await this.load.view('extension/payment/cardconnect', data);
	}

	async send()	{
		await this.load.language('extension/payment/cardconnect');

		this.load.model('extension/payment/cardconnect');

		await this.model_extension_payment_cardconnect.log('Posting order to CardConnect');

		const json = {};

		json['error'] = '';

		if (this.config.get('cardconnect_status')) {
			if (this.request.server['method'] == 'POST') {
				error = this.validate();

				if (!error) {
					this.load.model('checkout/order',this);

					order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

					if (order_info) {
						await this.model_extension_payment_cardconnect.log('Order ID: ' + order_info['order_id']);

						accttype = account = expiry = cvv2 = profile = capture = bankaba = '';

						existing_card = false;

						if (!(this.request.post['method']) || this.request.post['method'] == 'card') {
							await this.model_extension_payment_cardconnect.log('Method is card');

							if (this.request.post['card_new'] && (this.request.post['card_save']) && this.config.get('cardconnect_store_cards') && await this.customer.isLogged()) {
								profile = 'Y';
							} else if (!this.request.post['card_new'] && await this.customer.isLogged()) {
								existing_card = await this.model_extension_payment_cardconnect.getCard(this.request.post['card_choice'],await  this.customer.getId());

								profile = existing_card['profileid'];
							}

							if (existing_card) {
								accttype = existing_card['type'];

								account = existing_card['token'];

								expiry = existing_card['expiry'];

								cvv2 = '';
							} else {
								accttype = this.request.post['card_type'];

								account = this.request.post['card_number'];

								expiry = this.request.post['card_expiry_month'] + this.request.post['card_expiry_year'];

								cvv2 = this.request.post['card_cvv2'];
							}
						} else {
							await this.model_extension_payment_cardconnect.log('Method is Echeck');

							account = this.request.post['account_number'];

							bankaba = this.request.post['routing_number'];
						}

						if (this.config.get('cardconnect_transaction') == 'payment') {
							capture = 'Y';

							type = 'payment';

							status = 'New';

							order_status_id = this.config.get('cardconnect_order_status_id_processing');
						} else {
							capture = 'N';

							type = 'auth';

							status = 'New';

							order_status_id = this.config.get('cardconnect_order_status_id_pending');
						}

						data = array(
							'merchid'    : this.config.get('payment_cardconnect_merchant_id'),
							'accttype'   : accttype,
							'account'    : account,
							'expiry'     : expiry,
							'cvv2'       : cvv2,
							'amount'     : Math.round(floatval(order_info['total']), 2, PHP_ROUND_HALF_DOWN),
							'currency'   : order_info['currency_code'],
							'orderid'    : order_info['order_id'],
							'name'       : order_info['payment_firstname'] + ' ' + order_info['payment_lastname'],
							'address'    : order_info['payment_address_1'],
							'city'       : order_info['payment_city'],
							'region'     : order_info['payment_zone'],
							'country'    : order_info['payment_iso_code_2'],
							'postal'     : order_info['payment_postcode'],
							'email'      : order_info['email'],
							'phone'      : order_info['telephone'],
							'ecomind'    : 'E',
							'tokenize'   : 'Y',
							'profile'    : profile,
							'capture'    : capture,
							'bankaba'    : bankaba,
							'userfields' : array('secret_token' : this.config.get('cardconnect_token')),
							'frontendid' : '26'
						});

						data_json = json_encode(data);

						url = 'https://' + this.config.get('cardconnect_site') + '+cardconnect+com:' + ((this.config.get('cardconnect_environment') == 'live') ? 8443 : 6443) + '/cardconnect/rest/auth';

						header = array();

						header.push('Content-type: application/json';
						header.push('Content-length: ' + strlen(data_json);
						header.push('Authorization: Basic ' + base64_encode(this.config.get('cardconnect_api_username') + ':' + this.config.get('cardconnect_api_password'));

						await this.model_extension_payment_cardconnect.log('Header: ' + print_r(header, true));

						await this.model_extension_payment_cardconnect.log('Post Data: ' + print_r(data, true));

						await this.model_extension_payment_cardconnect.log('URL: ' + url);

						ch = curl_init();
						curl_setopt(ch, CURLOPT_URL, url);
						curl_setopt(ch, CURLOPT_HTTPHEADER, header);
						curl_setopt(ch, CURLOPT_CUSTOMREQUEST, 'PUT');
						curl_setopt(ch, CURLOPT_POSTFIELDS, data_json);
						curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
						curl_setopt(ch, CURLOPT_TIMEOUT, 30);
						curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
						response_data = curl_exec(ch);
						if (curl_errno(ch)) {
							await this.model_extension_payment_cardconnect.log('cURL error: ' + curl_errno(ch));
						}
						curl_close(ch);

						response_data = JSON.parse(response_data, true);

						await this.model_extension_payment_cardconnect.log('Response: ' + print_r(response_data, true));

					 	if ((response_data['respstat']) && response_data['respstat'] == 'A') {
							this.load.model('checkout/order',this);

							// if a cheque
							if (bankaba) {
								payment_method = 'echeck';

								type = 'payment';
							} else {
								payment_method = 'card';
							}

							await this.model_checkout_order.addOrderHistory(order_info['order_id'], order_status_id);

							order_info = array_merge(order_info, response_data);

							cardconnect_order_id = await this.model_extension_payment_cardconnect.addOrder(order_info, payment_method);

							await this.model_extension_payment_cardconnect.addTransaction(cardconnect_order_id, type, status, order_info);

							if ((response_data['profileid']) && this.config.get('cardconnect_store_cards') && await this.customer.isLogged()) {
								await this.model_extension_payment_cardconnect.log('Saving card');

								await this.model_extension_payment_cardconnect.addCard(cardconnect_order_id,await  this.customer.getId(), response_data['profileid'], response_data['token'], this.request.post['card_type'], response_data['account'], this.request.post['card_expiry_month'] + this.request.post['card_expiry_year']);
							}

							await this.model_extension_payment_cardconnect.log('Success');

							json['success'] = await this.url.link('checkout/success', '', true);
						} else {
							await this.model_extension_payment_cardconnect.log(response_data['resptext']);

							json['error']['warning'] = response_data['resptext'];
						}
					} else {
						await this.model_extension_payment_cardconnect.log('No matching order');

						json['error']['warning'] = this.language.get('error_no_order');
					}
				} else {
					await this.model_extension_payment_cardconnect.log('Failed validation');

					json['error'] = error;
				}
			} else {
				await this.model_extension_payment_cardconnect.log('No _POST data');

				json['error']['warning'] = this.language.get('error_no_post_data');
			}
		} else {
			await this.model_extension_payment_cardconnect.log('Module not enabled');

			json['error']['warning'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async delete() {
		await this.load.language('extension/payment/cardconnect');

		this.load.model('extension/payment/cardconnect');

		await this.model_extension_payment_cardconnect.log('Deleting card');

		const json = {};

		if (this.config.get('cardconnect_status')) {
			if (await this.customer.isLogged()) {
				if ((this.request.post['card_choice'])) {
					if (this.request.post['card_choice']) {
						card = await this.model_extension_payment_cardconnect.getCard(this.request.post['card_choice'],await  this.customer.getId());

						if (card) {
							await this.model_extension_payment_cardconnect.deleteCard(this.request.post['card_choice'],await  this.customer.getId());
						} else {
							await this.model_extension_payment_cardconnect.log('No such card');

							json['error'] = this.language.get('error_no_card');
						}
					} else {
						await this.model_extension_payment_cardconnect.log('No card selected');

						json['error'] = this.language.get('error_select_card');
					}
				} else {
					await this.model_extension_payment_cardconnect.log('Data missing');

					json['error'] = this.language.get('error_data_missing');
				}
			} else {
				await this.model_extension_payment_cardconnect.log('Not logged in');

				json['error'] = this.language.get('error_not_logged_in');
			}
		} else {
			await this.model_extension_payment_cardconnect.log('Module not enabled');

			json['error']['warning'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async cron() {
		this.load.model('extension/payment/cardconnect');

		await this.model_extension_payment_cardconnect.log('Running cron');

		if (this.config.get('cardconnect_status')) {
			if ((this.request.get['token']) && hash_equals(this.config.get('cardconnect_token'), this.request.get['token'])) {
				date = date('md', strtotime('yesterday'));

				responses = await this.model_extension_payment_cardconnect.getSettlementStatuses(this.config.get('payment_cardconnect_merchant_id'), date);

				for(responses of response) {
					for(response['txns'] of transaction) {
						await this.model_extension_payment_cardconnect.updateTransactionStatusByRetref(transaction['retref'], transaction['setlstat']);
					}
				}

				await this.model_extension_payment_cardconnect.updateCronRunTime();
			} else {
				await this.model_extension_payment_cardconnect.log('Token does not match+');
			}
		} else {
			await this.model_extension_payment_cardconnect.log('Module not enabled');
		}
	}

	async validate() {
		await this.load.language('extension/payment/cardconnect');

		this.load.model('extension/payment/cardconnect');

		error = array();

		if (!(this.request.post['method']) || this.request.post['method'] == 'card') {
			if (this.request.post['card_new']) {
				if (!(this.request.post['card_number']) || utf8_strlen(this.request.post['card_number']) < 1 || utf8_strlen(this.request.post['card_number']) > 19) {
					error['card_number'] = this.language.get('error_card_number');
				}

				if (!(this.request.post['card_cvv2']) || utf8_strlen(this.request.post['card_cvv2']) < 1 || utf8_strlen(this.request.post['card_cvv2']) > 4) {
					error['card_cvv2'] = this.language.get('error_card_cvv2');
				}
			} else {
				if ((this.request.post['card_choice']) && this.request.post['card_choice']) {
					card = await this.model_extension_payment_cardconnect.getCard(this.request.post['card_choice'],await  this.customer.getId());

					if (!card) {
						error['card_choice'] = this.language.get('error_no_card');
					}
				} else {
					error['card_choice'] = this.language.get('error_select_card');
				}
			}
		} else {
			if (this.config.get('cardconnect_echeck')) {
				if (!(this.request.post['account_number']) || utf8_strlen(this.request.post['account_number']) < 1 || utf8_strlen(this.request.post['account_number']) > 19) {
					error['account_number'] = this.language.get('error_account_number');
				}

				if (!(this.request.post['routing_number']) || utf8_strlen(this.request.post['routing_number']) < 1 || utf8_strlen(this.request.post['routing_number']) > 9) {
					error['routing_number'] = this.language.get('error_routing_number');
				}
			} else {
				error['method'] = this.language.get('error_no_echeck');
			}
		}

		return error;
	}
}