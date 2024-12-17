module.exports = class ModelExtensionPaymentGlobalpayRemote extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/globalpay_remote');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_globalpay_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_globalpay_remote_total') > 0 && this.config.get('payment_globalpay_remote_total') > total) {
			status = false;
		} else if (!this.config.get('payment_globalpay_remote_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code'        'globalpay_remote',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_globalpay_remote_sort_order')
			});
		}

		return method_data;
	}

	async checkEnrollment(account, amount, currency, order_ref) {
		timestamp = date("YmdHis");
		merchant_id = this.config.get('payment_globalpay_remote_merchant_id');
		secret = this.config.get('payment_globalpay_remote_secret');

		tmp = timestamp + '.' + merchant_id + '.' + order_ref + '.' + amount + '.' + currency + '.' + this.request.post['cc_number'];
		hash = sha1(tmp);
		tmp = hash + '.' + secret;
		hash = sha1(tmp);

		xml = '';
		xml += '<request type="3ds-verifyenrolled" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + account + '</account>';
			xml += '<orderid>' + order_ref + '</orderid>';
			xml += '<amount currency="' + currency + '">' + amount + '</amount>';
			xml += '<card>';
				xml += '<number>' + this.request.post['cc_number'] + '</number>';
				xml += '<expdate>' + this.request.post['cc_expire_date_month'] + this.request.post['cc_expire_date_year'] + '</expdate>';
				xml += '<type>' + this.request.post['cc_type'] + '</type>';
				xml += '<chname>' + this.request.post['cc_name'] + '</chname>';
			xml += '</card>';
			xml += '<sha1hash>' + hash + '</sha1hash>';
		xml += '</request>';

		this.logger('checkEnrollment call');
		this.logger(simplexml_load_string(xml));
		this.logger(xml);

		ch = curl_init();
		curl_setopt(ch, CURLOPT_URL, "https://remote.globaliris.com/realmpi");
		curl_setopt(ch, CURLOPT_POST, 1);
		curl_setopt(ch, CURLOPT_USERAGENT, "OpenCart " + VERSION);
		curl_setopt(ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(ch, CURLOPT_POSTFIELDS, xml);
		curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
		response = curl_exec (ch);
		curl_close (ch);

		this.logger('checkEnrollment xml response');
		this.logger(response);

		return simplexml_load_string(response);
	}

	async enrollmentSignature(account, amount, currency, order_ref, card_number, card_expire, card_type, card_name, pares) {
		this.load.model('checkout/order',this);

		timestamp = date("YmdHis");
		merchant_id = this.config.get('payment_globalpay_remote_merchant_id');
		secret = this.config.get('payment_globalpay_remote_secret');

		tmp = timestamp + '.' + merchant_id + '.' + order_ref + '.' + amount + '.' + currency + '.' + card_number;
		hash = sha1(tmp);
		tmp = hash + '.' + secret;
		hash = sha1(tmp);

		xml = '';
		xml += '<request type="3ds-verifysig" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + account + '</account>';
			xml += '<orderid>' + order_ref + '</orderid>';
			xml += '<amount currency="' + currency + '">' + amount + '</amount>';
			xml += '<card>';
				xml += '<number>' + card_number + '</number>';
				xml += '<expdate>' + card_expire + '</expdate>';
				xml += '<type>' + card_type + '</type>';
				xml += '<chname>' + card_name + '</chname>';
			xml += '</card>';
			xml += '<pares>' + pares + '</pares>';
			xml += '<sha1hash>' + hash + '</sha1hash>';
		xml += '</request>';

		this.logger('enrollmentSignature call');
		this.logger(simplexml_load_string(xml));
		this.logger(xml);

		ch = curl_init();
		curl_setopt(ch, CURLOPT_URL, "https://remote.globaliris.com/realmpi");
		curl_setopt(ch, CURLOPT_POST, 1);
		curl_setopt(ch, CURLOPT_USERAGENT, "OpenCart " + VERSION);
		curl_setopt(ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(ch, CURLOPT_POSTFIELDS, xml);
		curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
		response = curl_exec (ch);
		curl_close (ch);

		this.logger('enrollmentSignature xml response');
		this.logger(response);

		return simplexml_load_string(response);
	}

	async capturePayment(account, amount, currency, order_id, order_ref, card_number, expire, name, type, cvv, issue, eci_ref, eci = '', cavv = '', xid = '') {
		this.load.model('checkout/order',this);

		timestamp = date("YmdHis");
		merchant_id = this.config.get('payment_globalpay_remote_merchant_id');
		secret = this.config.get('payment_globalpay_remote_secret');

		tmp = timestamp + '.' + merchant_id + '.' + order_ref + '.' + amount + '.' + currency + '.' + card_number;
		hash = sha1(tmp);
		tmp = hash + '.' + secret;
		hash = sha1(tmp);

		order_info = await this.model_checkout_order.getOrder(order_id);

		xml = '';
		xml += '<request type="auth" timestamp="' + timestamp + '">';
			xml += '<merchantid>' + merchant_id + '</merchantid>';
			xml += '<account>' + account + '</account>';
			xml += '<orderid>' + order_ref + '</orderid>';
			xml += '<amount currency="' + currency + '">' + amount + '</amount>';
			xml += '<comments>';
				xml += '<comment id="1">OpenCart</comment>';
			xml += '</comments>';
			xml += '<card>';
				xml += '<number>' + card_number + '</number>';
				xml += '<expdate>' + expire + '</expdate>';
				xml += '<type>' + type + '</type>';
				xml += '<chname>' + name + '</chname>';
				xml += '<cvn>';
					xml += '<number>' + cvv + '</number>';
					xml += '<presind>2</presind>';
				xml += '</cvn>';
				if ((issue)) {
					xml += '<issueno>' + issue + '</issueno>';
				}
			xml += '</card>';

			if (this.config.get('payment_globalpay_remote_auto_settle') == 0) {
				xml += '<autosettle flag="0" />';
			} else if (this.config.get('payment_globalpay_remote_auto_settle') == 1) {
				xml += '<autosettle flag="1" />';
			} else if (this.config.get('payment_globalpay_remote_auto_settle') == 2) {
				xml += '<autosettle flag="MULTI" />';
			}

			if (eci != '' || cavv != '' || xid != '') {
				xml += '<mpi>';
					if (eci != '') {
						xml += '<eci>' + eci + '</eci>';
					}
					if (cavv != '') {
						xml += '<cavv>' + cavv + '</cavv>';
					}
					if (xid != '') {
						xml += '<xid>' + xid + '</xid>';
					}
				xml += '</mpi>';
			}

			xml += '<sha1hash>' + hash + '</sha1hash>';

			if (this.config.get('payment_globalpay_remote_tss_check') == 1) {
				xml += '<tssinfo>';
					xml += '<custipaddress>' + order_info['ip'] + '</custipaddress>';

					if (await this.customer.getId() > 0) {
						xml += '<custnum>' + await this.customer.getId() + '</custnum>';
					}

					if (((order_info['payment_iso_code_2']) && (order_info['payment_iso_code_2'])) || ((order_info['payment_postcode']) && (order_info['payment_postcode']))) {
						xml += '<address type="billing">';
						if (((order_info['payment_postcode']) && (order_info['payment_postcode']))) {
							xml += '<code>' + filter_var(order_info['payment_postcode'], FILTER_SANITIZE_NUMBER_INT) + '|' + filter_var(order_info['payment_address_1'], FILTER_SANITIZE_NUMBER_INT) + '</code>';
						}
						if (((order_info['payment_iso_code_2']) && (order_info['payment_iso_code_2']))) {
							xml += '<country>' + order_info['payment_iso_code_2'] + '</country>';
						}
						xml += '</address>';
					}
					if (((order_info['shipping_iso_code_2']) && (order_info['shipping_iso_code_2'])) || ((order_info['shipping_postcode']) && (order_info['shipping_postcode']))) {
						xml += '<address type="shipping">';
						if (((order_info['shipping_postcode']) && (order_info['shipping_postcode']))) {
							xml += '<code>' + filter_var(order_info['shipping_postcode'], FILTER_SANITIZE_NUMBER_INT) + '|' + filter_var(order_info['shipping_address_1'], FILTER_SANITIZE_NUMBER_INT) + '</code>';
						}
						if (((order_info['shipping_iso_code_2']) && (order_info['shipping_iso_code_2']))) {
							xml += '<country>' + order_info['shipping_iso_code_2'] + '</country>';
						}
						xml += '</address>';
					}
				xml += '</tssinfo>';
			}

		xml += '</request>';

		this.logger('capturePayment call');
		this.logger(simplexml_load_string(xml));
		this.logger(xml);

		ch = curl_init();
		curl_setopt(ch, CURLOPT_URL, "https://remote.globaliris.com/realauth");
		curl_setopt(ch, CURLOPT_POST, 1);
		curl_setopt(ch, CURLOPT_USERAGENT, "OpenCart " + VERSION);
		curl_setopt(ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(ch, CURLOPT_POSTFIELDS, xml);
		curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
		response = curl_exec (ch);
		curl_close (ch);

		this.logger('capturePayment xml response');
		this.logger(response);

		response = simplexml_load_string(response);

		await this.load.language('extension/payment/globalpay_remote');

		message = '<strong>' + this.language.get('text_result') + ':</strong> ' + response.result;
		message += '<br /><strong>' + this.language.get('text_message') + ':</strong> ' + response.message;
		message += '<br /><strong>' + this.language.get('text_order_ref') + ':</strong> ' + order_ref;

		if ((response.cvnresult) && (response.cvnresult)) {
			message += '<br /><strong>' + this.language.get('text_cvn_result') + ':</strong> ' + response.cvnresult;
		}

		if ((response.avspostcoderesponse) && (response.avspostcoderesponse)) {
			message += '<br /><strong>' + this.language.get('text_avs_postcode') + ':</strong> ' + response.avspostcoderesponse;
		}

		if ((response.avsaddressresponse) && (response.avsaddressresponse)) {
			message += '<br /><strong>' + this.language.get('text_avs_address') + ':</strong> ' + response.avsaddressresponse;
		}

		if ((response.authcode) && (response.authcode)) {
			message += '<br /><strong>' + this.language.get('text_auth_code') + ':</strong> ' + response.authcode;
		}

		if ((eci_ref)) {
			message += '<br /><strong>' + this.language.get('text_eci') + ':</strong> (' + eci + ') ' + this.language.get('text_3d_s' + eci_ref);
		}

		if ((response.tss.result) && (response.tss.result)) {
			message += '<br /><strong>' + this.language.get('text_tss') + ':</strong> ' + response.tss.result;
		}

		message += '<br /><strong>' + this.language.get('text_timestamp') + ':</strong> ' + timestamp;

		if (this.config.get('payment_globalpay_remote_card_data_status') == 1) {
			message += '<br /><strong>' + this.language.get('entry_cc_type') + ':</strong> ' + type;
			message += '<br /><strong>' + this.language.get('text_last_digits') + ':</strong> ' + substr(card_number, -4);
			message += '<br /><strong>' + this.language.get('entry_cc_expire_date') + ':</strong> ' + expire;
			message += '<br /><strong>' + this.language.get('entry_cc_name') + ':</strong> ' + name;

			if ((response.cardissuer.bank) && (response.cardissuer.bank)) {
				message += '<br /><strong>' + this.language.get('text_card_bank') + ':</strong> ' + response.cardissuer.bank;
			}

			if ((response.cardissuer.country) && (response.cardissuer.country)) {
				message += '<br /><strong>' + this.language.get('text_card_country') + ':</strong> ' + response.cardissuer.country;
			}

			if ((response.cardissuer.region) && (response.cardissuer.region)) {
				message += '<br /><strong>' + this.language.get('text_card_region') + ':</strong> ' + response.cardissuer.region;
			}
		}

		if (response.result == '00') {
			await this.model_checkout_order.addOrderHistory(order_id, this.config.get('config_order_status_id'));

			globalpay_order_id = this.addOrder(order_info, response, account, order_ref);

			if (this.config.get('payment_globalpay_remote_auto_settle') == 1) {
				this.addTransaction(globalpay_order_id, 'payment', order_info);
				await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_globalpay_remote_order_status_success_settled_id'), message);
			} else {
				this.addTransaction(globalpay_order_id, 'auth', 0);
				await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_globalpay_remote_order_status_success_unsettled_id'), message);
			}
		} else if (response.result == "101") {
			// Decline
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_id'), message);
		} else if (response.result == "102") {
			// Referal B
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_pending_id'), message);
		} else if (response.result == "103") {
			// Referal A
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_stolen_id'), message);
		} else if (response.result == "200") {
			// Error Connecting to Bank
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_bank_id'), message);
		} else if (response.result == "204") {
			// Error Connecting to Bank
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_bank_id'), message);
		} else if (response.result == "205") {
			// Comms Error
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_bank_id'), message);
		} else {
			// Other
			this.addHistory(order_id, this.config.get('payment_globalpay_remote_order_status_decline_id'), message);
		}

		return response;
	}

	async addOrder(order_info, response, account, order_ref) {
		if (this.config.get('payment_globalpay_remote_auto_settle') == 1) {
			settle_status = 1;
		} else {
			settle_status = 0;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "globalpay_remote_order` SET `order_id` = '" + order_info['order_id'] + "', `settle_type` = '" + this.config.get('payment_globalpay_remote_auto_settle') + "', `order_ref` = '" + this.db.escape(order_ref) + "', `order_ref_previous` = '" + this.db.escape(order_ref) + "', `date_added` = now(), `date_modified` = now(), `capture_status` = '" + settle_status + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `pasref` = '" + this.db.escape(response.pasref) + "', `pasref_previous` = '" + this.db.escape(response.pasref) + "', `authcode` = '" + this.db.escape(response.authcode) + "', `account` = '" + this.db.escape(account) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false) + "'");

		return this.db.getLastId();
	}

	async addTransaction(globalpay_remote_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "globalpay_remote_order_transaction` SET `globalpay_remote_order_id` = '" + globalpay_remote_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false) + "'");
	}

	async logger(message) {
		if (this.config.get('payment_globalpay_remote_debug') == 1) {
			log = new Log('globalpay_remote.log');
			log.write(message);
		}
	}

	async addHistory(order_id, order_status_id, comment) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "order_history SET order_id = '" + order_id + "', order_status_id = '" + order_status_id + "', notify = '0', comment = '" + this.db.escape(comment) + "', date_added = NOW()");
	}
}