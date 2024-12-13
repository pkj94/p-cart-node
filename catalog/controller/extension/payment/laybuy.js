module.exports = class ControllerExtensionPaymentLaybuy extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/laybuy');

		this.load.model('extension/payment/laybuy');

		this.load.model('checkout/order',this);

		if(!(this.session.data['order_id'])) {
			return false;
		}

		data['action'] = await this.url.link('extension/payment/laybuy/postToLaybuy', '', true);

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		data['order_info'] = order_info;

		data['total'] = order_info['total'];

		data['currency_symbol_left'] = this.currency.getSymbolLeft(this.session.data['currency']);

		data['currency_symbol_right'] = this.currency.getSymbolRight(this.session.data['currency']);

		data['initial_payments'] = await this.model_extension_payment_laybuy.getInitialPayments();

		data['months'] = await this.model_extension_payment_laybuy.getMonths();

		return await this.load.view('extension/payment/laybuy', data);
	}

	async postToLaybuy()	{
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Posting to Laybuy');

		if (this.request.server['method'] == 'POST') {
			this.load.model('checkout/order',this);

			order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

			if (order_info) {
				await this.model_extension_payment_laybuy.log('Order ID: ' + order_info['order_id']);

				data = array();

				data['VERSION']      = '0+2';
				data['MEMBER']       = this.config.get('payment_laybuys_membership_id');
				data['RETURNURL']    = await this.url.link('extension/payment/laybuy/callback', '', true);
				data['CANCELURL']    = await this.url.link('extension/payment/laybuy/cancel', '', true);
				data['AMOUNT']       = Math.round(floatval(order_info['total']), 2, PHP_ROUND_HALF_DOWN);
				data['CURRENCY']     = order_info['currency_code'];
				data['INIT']         = this.request.post['INIT'];
				data['MONTHS']       = this.request.post['MONTHS'];
				data['MIND']         = (this.config.get('payment_laybuy_min_deposit')) ? this.config.get('payment_laybuy_min_deposit') : 20;
				data['MAXD']         = (this.config.get('payment_laybuy_max_deposit')) ? this.config.get('payment_laybuy_max_deposit') : 50;
				data['CUSTOM']       = order_info['order_id'] + ':' + md5(this.config.get('payment_laybuy_token'));
				data['EMAIL']        = order_info['email'];

				data_string = '';

				for (data of param : value) {
					data_string += param + '=' + value + '&';
				}

				data_string = rtrim(data_string, '&');

				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				await this.model_extension_payment_laybuy.log('Gateway URL: ' + this.config.get('payment_laybuy_gateway_url'));

				ch = curl_init();
				curl_setopt(ch, CURLOPT_URL, this.config.get('payment_laybuy_gateway_url'));
				curl_setopt(ch, CURLOPT_POST, true);
				curl_setopt(ch, CURLOPT_POSTFIELDS, data_string);
				curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt(ch, CURLOPT_HEADER, false);
				curl_setopt(ch, CURLOPT_TIMEOUT, 30);
				curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
				result = curl_exec(ch);
				if (curl_errno(ch)) {
					await this.model_extension_payment_laybuy.log('cURL error: ' + curl_errno(ch));
				}
				curl_close(ch);

				result = JSON.parse(result, true);

				await this.model_extension_payment_laybuy.log('Response: ' + print_r(result, true));

			 	if ((result['ACK']) && (result['TOKEN']) && result['ACK'] == 'SUCCESS') {
					await this.model_extension_payment_laybuy.log('Success response+ Redirecting to PayPal+');

					this.response.setRedirect(this.config.get('payment_laybuy_gateway_url') + '?TOKEN=' + result['TOKEN']);
				} else {
					await this.model_extension_payment_laybuy.log('Failure response+ Redirecting to checkout/failure+');

					this.response.setRedirect(await this.url.link('checkout/failure', '', true));
				}
			} else {
				await this.model_extension_payment_laybuy.log('No matching order+ Redirecting to checkout/failure+');

				this.response.setRedirect(await this.url.link('checkout/failure', '', true));
			}
		} else {
			await this.model_extension_payment_laybuy.log('No _POST data+ Redirecting to checkout/failure+');

			this.response.setRedirect(await this.url.link('checkout/failure', '', true));
		}
	}

	async callback() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Receiving callback');

		if (this.request.server['method'] == 'POST' && (this.request.post['RESULT']) && this.request.post['RESULT'] == 'SUCCESS') {
			this.load.model('checkout/order',this);

			custom = this.request.post['CUSTOM'];

			custom = explode(':', custom);

			order_id = custom[0];

			token = custom[1];

			await this.model_extension_payment_laybuy.log('Received Token: ' + token);

			await this.model_extension_payment_laybuy.log('Actual Token: ' + md5(this.config.get('payment_laybuy_token')));

			if (hash_equals(md5(this.config.get('payment_laybuy_token')), token)) {
				await this.model_extension_payment_laybuy.log('Order ID: ' + order_id);

				order_info = await this.model_checkout_order.getOrder(order_id);

				if (order_info) {
					await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_laybuy_order_status_id_pending'));

					transaction_report = await this.model_extension_payment_laybuy.prepareTransactionReport(this.request.post);

					await this.model_extension_payment_laybuy.addTransaction(transaction_report, 1);

					await this.model_extension_payment_laybuy.log('Success+ Redirecting to checkout/success+');

					this.response.setRedirect(await this.url.link('checkout/success', '', true));
				} else {
					await this.model_extension_payment_laybuy.log('No matching order+ Redirecting to checkout/failure+');

					this.response.setRedirect(await this.url.link('checkout/failure', '', true));
				}
			} else {
				await this.model_extension_payment_laybuy.log('Token does not match+ Redirecting to checkout/failure+');

				this.response.setRedirect(await this.url.link('checkout/failure', '', true));
			}
		} else if (this.request.server['method'] == 'POST' && (this.request.post['RESULT']) && this.request.post['RESULT'] == 'FAILURE') {
			await this.model_extension_payment_laybuy.log('Failure Response: ' + this.request.post);

			await this.model_extension_payment_laybuy.log('Redirecting to checkout/failure+');

			this.response.setRedirect(await this.url.link('checkout/failure', '', true));
		} else {
			await this.model_extension_payment_laybuy.log('Either no _POST data or unknown response+ Redirecting to checkout/failure+');

			this.response.setRedirect(await this.url.link('checkout/failure', '', true));
		}
	}

	async cancel() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Transaction canceled by user+ Redirecting to checkout/checkout+');

		this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
	}

	async reviseCallback() {
		this.load.model('extension/payment/laybuy');

		await this.load.language('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Receiving callback');

		if (this.request.server['method'] == 'POST') {
			if ((this.request.post['RESULT']) && this.request.post['RESULT'] == 'SUCCESS') {
				this.load.model('checkout/order',this);

				custom = this.request.post['CUSTOM'];

				custom = explode(':', custom);

				order_id = custom[0];

				token = custom[1];

				await this.model_extension_payment_laybuy.log('Received Token: ' + token);

				await this.model_extension_payment_laybuy.log('Actual Token: ' + md5(this.config.get('payment_laybuy_token')));

				if (hash_equals(md5(this.config.get('payment_laybuy_token')), token)) {
					await this.model_extension_payment_laybuy.log('Order ID: ' + order_id);

					order_info = await this.model_checkout_order.getOrder(order_id);

					if (order_info) {
						response = this.request.post;

						await this.model_extension_payment_laybuy.log('Response: ' + print_r(response, true));

						revised_transaction_id = response['MERCHANTS_REF_NO'];

						revised_transaction = await this.model_extension_payment_laybuy.getRevisedTransaction(revised_transaction_id);

						await this.model_extension_payment_laybuy.log('Revised transaction: ' + print_r(revised_transaction, true));

						status = 1;

						current_date = date('Y-m-d h:i:s');

						if (!(response['DOWNPAYMENT']) && !revised_transaction['payment_type']) {
							await this.model_extension_payment_laybuy.log('Buy-Now');

							response['DOWNPAYMENT'] = 100;
							response['MONTHS'] = 0;
							response['DOWNPAYMENT_AMOUNT'] = response['AMOUNT'];
							response['PAYMENT_AMOUNTS'] = 0;
							response['FIRST_PAYMENT_DUE'] = current_date;
							response['LAST_PAYMENT_DUE'] = current_date;
							response['PAYPAL_PROFILE_ID'] = '';

							status = 5;

							await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_laybuy_order_status_id_processing'), this.language.get('text_comment'));
						} else {
							await this.model_extension_payment_laybuy.log('Lay-Buy');
						}

						this.session.data['order_id'] = order_id;

						transaction_report = await this.model_extension_payment_laybuy.prepareTransactionReport(response);

						transaction_report['order_id'] = order_id;

						await this.model_extension_payment_laybuy.addTransaction(transaction_report, status);

						old_transaction = await this.model_extension_payment_laybuy.getTransaction(revised_transaction['laybuy_transaction_id']);

						report_content = JSON.parse(old_transaction['report'], true);

						for (report_content of &array) {
							array['status'] = str_replace('Pending', 'Canceled', array['status']);
						}

						report_content = json_encode(report_content);

						if (old_transaction['paypal_profile_id']) {
							await this.model_extension_payment_laybuy.log('Canceling transaction');

							data_string = 'mid=' + this.config.get('payment_laybuys_membership_id') + '&' + 'paypal_profile_id=' + old_transaction['paypal_profile_id'];

							await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

							ch = curl_init();
							url = 'https://lay-buys+com/vtmob/deal5cancel.js';
							curl_setopt(ch, CURLOPT_URL, url);
							curl_setopt(ch, CURLOPT_POST, true);
							curl_setopt(ch, CURLOPT_POSTFIELDS, data_string);
							curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
							curl_setopt(ch, CURLOPT_HEADER, false);
							curl_setopt(ch, CURLOPT_TIMEOUT, 30);
							curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
							result = curl_exec(ch);
							if (curl_errno(ch)) {
								await this.model_extension_payment_laybuy.log('cURL error: ' + curl_errno(ch));
							}
							curl_close(ch);

							await this.model_extension_payment_laybuy.log('Response: ' + result);

							if (result == 'success') {
								await this.model_extension_payment_laybuy.log('Success');
							} else {
								await this.model_extension_payment_laybuy.log('Failure');
							}
						} else {
							await this.model_extension_payment_laybuy.log('Transaction has no paypal_profile_id');
						}

						await this.model_extension_payment_laybuy.updateTransaction(old_transaction['laybuy_transaction_id'], '51', report_content, old_transaction['transaction']);

						await this.model_extension_payment_laybuy.deleteRevisedTransaction(revised_transaction['laybuy_revise_request_id']);

						this.response.setRedirect(await this.url.link('checkout/success', '', true));
					} else {
						await this.model_extension_payment_laybuy.log('No matching order+ Redirecting to checkout/failure+');

						this.response.setRedirect(await this.url.link('checkout/failure', '', true));
					}
				} else {
					await this.model_extension_payment_laybuy.log('Token does not match+ Redirecting to checkout/failure+');

					this.response.setRedirect(await this.url.link('checkout/failure', '', true));
				}
			} else {
				await this.model_extension_payment_laybuy.log('No success response');

				this.response.setRedirect(await this.url.link('checkout/failure', '', true));
			}
		} else {
			await this.model_extension_payment_laybuy.log('No _POST data');

			this.response.setRedirect(await this.url.link('checkout/failure', '', true));
		}
	}

	async reviseCancel() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Revise canceled+ Redirecting to checkout/checkout+');

		this.response.setRedirect(await this.url.link('checkout/checkout', '', true));
	}

	async deleteOrder(route = '', output = '', order_id = 0, order_status_id = 0) {
		this.load.model('extension/payment/laybuy');

		if ((this.session.data['api_id'])) {
			await this.model_extension_payment_laybuy.log('Deleting order #' + order_id);

			await this.model_extension_payment_laybuy.deleteTransactionByOrderId(order_id);
		} else {
			await this.model_extension_payment_laybuy.log('No API ID in session');
		}
	}

	async cron() {
		this.load.model('extension/payment/laybuy');

		await this.load.language('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Running cron');

		if ((this.request.get['token']) && hash_equals(this.config.get('payment_laybuy_token'), this.request.get['token'])) {
			paypal_profile_id_array = await this.model_extension_payment_laybuy.getPayPalProfileIds();

			if (paypal_profile_id_array) {
				paypal_profile_ids = '';

				for (paypal_profile_id_array of profile_id) {
					paypal_profile_ids += profile_id['paypal_profile_id'] + ',';
				}

				paypal_profile_ids = rtrim(paypal_profile_ids, ',');

				data_string = 'mid=' + this.config.get('payment_laybuys_membership_id') + '&' + 'profileIds=' + paypal_profile_ids;

				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				await this.model_extension_payment_laybuy.log('API URL: ' + this.config.get('payment_laybuy_api_url'));

				ch = curl_init();
				curl_setopt(ch, CURLOPT_URL, this.config.get('payment_laybuy_api_url'));
				curl_setopt(ch, CURLOPT_POST, true);
				curl_setopt(ch, CURLOPT_POSTFIELDS, data_string);
				curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt(ch, CURLOPT_HEADER, false);
				curl_setopt(ch, CURLOPT_TIMEOUT, 30);
				curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
				result = curl_exec(ch);
				if (curl_errno(ch)) {
					await this.model_extension_payment_laybuy.log('cURL error: ' + curl_errno(ch));
				}
				curl_close(ch);

				const results = JSON.parse(result, true);

				await this.model_extension_payment_laybuy.log('Response: ' + print_r(results, true));

				if (results) {
					this.load.model('checkout/order',this);

					for (results of laybuy_ref_id : reports) {
						status = reports['status'];

						report = reports['report'];

						transaction = array();

						transaction = await this.model_extension_payment_laybuy.getTransactionByLayBuyRefId(laybuy_ref_id);

						order_id = transaction['order_id'];

						paypal_profile_id = transaction['paypal_profile_id'];

						months = transaction['months'];

						report_content = array();

						pending_flag = false;

						next_payment_status = this.language.get('text_status_1');

						for (report of month : payment) {
							payment['paymentDate'] = date('Y-m-d h:i:s', strtotime(str_replace('/', '-', payment['paymentDate'])));
							date = date(this.language.get('date_format_short'), strtotime(payment['paymentDate']));
							next_payment_date = payment['paymentDate'];

							if (payment['type'] == 'd') {
								report_content.push(array(
									'instalment'	: 0,
									'amount'		: this.currency.format(payment['amount'], transaction['currency']),
									'date'			: date,
									'pp_trans_id'	: payment['txnID'],
									'status'		: payment['paymentStatus']
								});
							} else if (payment['type'] == 'p') {
								pending_flag = true;

								report_content.push(array(
									'instalment'	: month,
									'amount'		: this.currency.format(payment['amount'], transaction['currency']),
									'date'			: date,
									'pp_trans_id'	: payment['txnID'],
									'status'		: payment['paymentStatus']
								});

								next_payment_status = payment['paymentStatus'];
							}
						}

						if (pending_flag) {
							start_index = month + 1;
						} else {
							start_index = month + 2;
						}

						if (month < months) {
							for (month = 1; month <= months; month++) {
								next_payment_date = date("Y-m-d h:i:s", strtotime(next_payment_date + " +1 month"));
								date = date(this.language.get('date_format_short'), strtotime(next_payment_date));

								report_content.push(array(
									'instalment'	: month,
									'amount'		: this.currency.format(transaction['payment_amounts'], transaction['currency']),
									'date'			: date,
									'pp_trans_id'	: '',
									'status'		: next_payment_status
								});
							}
						}

						report_content = json_encode(report_content);

						switch (status) {
							case -1: // Cancel
								await this.model_extension_payment_laybuy.log('Transaction #' + transaction['laybuy_transaction_id'] + ' canceled');
								await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_laybuy_order_status_id_canceled'), this.language.get('text_comment'), false, false);
								await this.model_extension_payment_laybuy.updateTransaction(transaction['laybuy_transaction_id'], '7', report_content, start_index);
								break;
							case 0: // Pending
								await this.model_extension_payment_laybuy.log('Transaction #' + transaction['laybuy_transaction_id'] + ' still pending');
								await this.model_extension_payment_laybuy.updateTransaction(transaction['laybuy_transaction_id'], transaction['status'], report_content, start_index);
								break;
							case 1: // Paid
								await this.model_extension_payment_laybuy.log('Transaction #' + transaction['laybuy_transaction_id'] + ' paid');
								await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_laybuy_order_status_id_processing'), this.language.get('text_comment'), false, false);
								await this.model_extension_payment_laybuy.updateTransaction(transaction['laybuy_transaction_id'], '5', report_content, start_index);
								break;
						}
					}
				}
			} else {
				await this.model_extension_payment_laybuy.log('No PayPal Profile IDs to update');
			}

			await this.model_extension_payment_laybuy.updateCronRunTime();
		} else {
			await this.model_extension_payment_laybuy.log('Token does not match+');
		}
	}
}