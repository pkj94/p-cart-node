module.exports = class ModelExtensionPaymentCardConnect extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/cardconnect');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + this.config.get('cardconnect_geo_zone') + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");

		if (this.config.get('cardconnect_total') > 0 && this.config.get('cardconnect_total') > total) {
			status = false;
		} else if (!this.config.get('cardconnect_geo_zone')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'			 'cardconnect',
				'title'			 this.language.get('text_title'),
				'terms'			 '',
				'sort_order'	 this.config.get('cardconnect_sort_order')
			});
		}

		return method_data;
	}

	async getCardTypes() {
		cards = array();

		cards.push(array(
			'text'   'Visa',
			'value'  'VISA'
		});

		cards.push(array(
			'text'   'MasterCard',
			'value'  'MASTERCARD'
		});

		cards.push(array(
			'text'   'Discover Card',
			'value'  'DISCOVER'
		});

		cards.push(array(
			'text'   'American Express',
			'value'  'AMEX'
		});

		return cards;
	}

	async getMonths() {
		months = array();

		for (i = 1; i <= 12; i++) {
			months.push(array(
				'text'   sprintf('%02d', i),
				'value'  sprintf('%02d', i)
			});
		}

		return months;
	}

	async getYears() {
		years = array();

		today = getdate();

		for (i = today['year']; i < today['year'] + 11; i++) {
			years.push(array(
				'text'   sprintf('%02d', i % 100),
				'value'  sprintf('%02d', i % 100)
			});
		}

		return years;
	}

	async getCard(token, customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardconnect_card` WHERE `token` = '" + this.db.escape(token) + "' AND `customer_id` = '" + customer_id + "'");

		if (query.num_rows) {
			return query.row;
		} else {
			return false;
		}
	}

	async getCards(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardconnect_card` WHERE `customer_id` = '" + customer_id + "'");

		return query.rows;
	}

	async addCard(cardconnect_order_id, customer_id, profileid, token, type, account, expiry) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_card` SET `cardconnect_order_id` = '" + cardconnect_order_id + "', `customer_id` = '" + customer_id + "', `profileid` = '" + this.db.escape(profileid) + "', `token` = '" + this.db.escape(token) + "', `type` = '" + this.db.escape(type) + "', `account` = '" + this.db.escape(account) + "', `expiry` = '" + this.db.escape(expiry) + "', `date_added` = NOW()");
	}

	async deleteCard(token, customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "cardconnect_card` WHERE `token` = '" + this.db.escape(token) + "' AND `customer_id` = '" + customer_id + "'");
	}

	async addOrder(order_info, payment_method) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_order` SET `order_id` = '" + order_info['order_id'] + "', `customer_id` = '" + await this.customer.getId() + "', `payment_method` = '" + this.db.escape(payment_method) + "', `retref` = '" + this.db.escape(order_info['retref']) + "', `authcode` = '" + this.db.escape(order_info['authcode']) + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	async addTransaction(cardconnect_order_id, type, status, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_order_transaction` SET `cardconnect_order_id` = '" + cardconnect_order_id + "', `type` = '" + this.db.escape(type) + "', `retref` = '" + this.db.escape(order_info['retref']) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "', `status` = '" + this.db.escape(status) + "', `date_modified` = NOW(), `date_added` = NOW()");
	}

	async getSettlementStatuses(merchant_id, date) {
		this.log('Getting settlement statuses from CardConnect');

		url = 'https://' + this.config.get('cardconnect_site') + '.cardconnect.com:' + ((this.config.get('cardconnect_environment') == 'live') ? 8443 : 6443) + '/cardconnect/rest/settlestat?merchid=' + merchant_id + '&date=' + date;

		header = array();

		header.push('Content-type: application/json';
		header.push('Authorization: Basic ' + base64_encode(this.config.get('cardconnect_api_username') + ':' + this.config.get('cardconnect_api_password'));

		await this.model_extension_payment_cardconnect.log('Header: ' + print_r(header, true));

		await this.model_extension_payment_cardconnect.log('URL: ' + url);

		ch = curl_init();
		curl_setopt(ch, CURLOPT_URL, url);
		curl_setopt(ch, CURLOPT_HTTPHEADER, header);
		curl_setopt(ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt(ch, CURLOPT_TIMEOUT, 30);
		curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
		response_data = curl_exec(ch);
		if (curl_errno(ch)) {
			await this.model_extension_payment_cardconnect.log('cURL error: ' + curl_errno(ch));
		}
		curl_close(ch);

		response_data = JSON.parse(response_data, true);

		this.log('Response: ' + print_r(response_data, true));

		return response_data;
	}

	async updateTransactionStatusByRetref(retref, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "cardconnect_order_transaction` SET `status` = '" + this.db.escape(status) + "', `date_modified` = NOW() WHERE `retref` = '" + this.db.escape(retref) + "'");
	}

	async updateCronRunTime() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `key` = 'cardconnect_cron_time'");

		await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `store_id` = '0', `code` = 'cardconnect', `key` = 'cardconnect_cron_time', `value` = NOW(), `serialized` = '0'");
	}

	async log(data) {
		if (this.config.get('cardconnect_logging')) {
			log = new Log('cardconnect.log');

			log.write(data);
		}
	}
}