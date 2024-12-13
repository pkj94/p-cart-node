module.exports = class ControllerExtensionPaymentAuthorizeNetSim extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/authorizenet_sim');

		data['button_confirm'] = this.language.get('button_confirm');

		this.load.model('checkout/order',this);

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		data['x_login'] = this.config.get('payment_authorizenet_sim_merchant');
		data['x_fp_sequence'] = this.session.data['order_id'];
		data['x_fp_timestamp'] = new Date();
		data['x_amount'] = this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false);
		data['x_fp_hash'] = null; // calculated later, once all fields are populated
		data['x_show_form'] = 'PAYMENT_FORM';
		data['x_test_request'] = this.config.get('payment_authorizenet_sim_mode');
		data['x_type'] = 'AUTH_CAPTURE';
		data['x_currency_code'] = this.session.data['currency'];
		data['x_invoice_num'] = this.session.data['order_id'];
		data['x_description'] = html_entity_decode(this.config.get('config_name'));
		data['x_first_name'] = order_info['payment_firstname'];
		data['x_last_name'] = order_info['payment_lastname'];
		data['x_company'] = order_info['payment_company'];
		data['x_address'] = order_info['payment_address_1'] + ' ' + order_info['payment_address_2'];
		data['x_city'] = order_info['payment_city'];
		data['x_state'] = order_info['payment_zone'];
		data['x_zip'] = order_info['payment_postcode'];
		data['x_country'] = order_info['payment_country'];
		data['x_phone'] = order_info['telephone'];
		data['x_ship_to_first_name'] = order_info['shipping_firstname'];
		data['x_ship_to_last_name'] = order_info['shipping_lastname'];
		data['x_ship_to_company'] = order_info['shipping_company'];
		data['x_ship_to_address'] = order_info['shipping_address_1'] + ' ' + order_info['shipping_address_2'];
		data['x_ship_to_city'] = order_info['shipping_city'];
		data['x_ship_to_state'] = order_info['shipping_zone'];
		data['x_ship_to_zip'] = order_info['shipping_postcode'];
		data['x_ship_to_country'] = order_info['shipping_country'];
		data['x_customer_ip'] = this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : '');
		data['x_email'] = order_info['email'];
		data['x_relay_response'] = 'true';

		to_hash = data['x_login'] + '^' + data['x_fp_sequence'] + '^' + data['x_fp_timestamp'] + '^' + data['x_amount'] + '^' + data['x_currency_code'];
		data['x_fp_hash'] = this.generateHash(to_hash, this.config.get('payment_authorizenet_sim_key'));

		return await this.load.view('extension/payment/authorizenet_sim', data);
	}

	async callback() {
		if ((this.request.post['x_SHA2_Hash']) && (this.request.post['x_SHA2_Hash'] == this.generateResponseHash(this.request.post, this.config.get('payment_authorizenet_sim_hash')))) {
			this.load.model('checkout/order',this);

			order_info = await this.model_checkout_order.getOrder(this.request.post['x_invoice_num']);

			if (order_info && this.request.post['x_response_code'] == '1') {
				message = '';

				if ((this.request.post['x_response_reason_text'])) {
					message += 'Response Text: ' + this.request.post['x_response_reason_text'] + "\n";
				}

				if ((this.request.post['exact_issname'])) {
					message += 'Issuer: ' + this.request.post['exact_issname'] + "\n";
				}

				if ((this.request.post['exact_issconf'])) {
					message += 'Confirmation Number: ' + this.request.post['exact_issconf'];
				}

				if ((this.request.post['exact_ctr'])) {
					message += 'Receipt: ' + this.request.post['exact_ctr'];
				}

				await this.model_checkout_order.addOrderHistory(this.request.post['x_invoice_num'], this.config.get('payment_authorizenet_sim_order_status_id'), message, true);

				this.response.setRedirect(await this.url.link('checkout/success'));
			} else {
				this.response.setRedirect(await this.url.link('checkout/failure'));
			}
		} else {
			this.response.setRedirect(await this.url.link('checkout/failure'));
		}
	}

	async generateHash(to_hash, key) {
		if (to_hash != null && key != null) {
			sig = hash_hmac('sha512', to_hash, hex2bin(key));

			return strtoupper(sig);
		} else {
			return false;
		}
	}

	async generateResponseHash(post_fields, signature_key) {
		/**
		 * The following array must not be reordered or elements removed, the hash requires ALL, even if empty/not set
		 */
		verify_hash_fields = [
			'x_trans_id',
			'x_test_request',
			'x_response_code',
			'x_auth_code',
			'x_cvv2_resp_code',
			'x_cavv_response',
			'x_avs_code',
			'x_method',
			'x_account_number',
			'x_amount',
			'x_company',
			'x_first_name',
			'x_last_name',
			'x_address',
			'x_city',
			'x_state',
			'x_zip',
			'x_country',
			'x_phone',
			'x_fax',
			'x_email',
			'x_ship_to_company',
			'x_ship_to_first_name',
			'x_ship_to_last_name',
			'x_ship_to_address',
			'x_ship_to_city',
			'x_ship_to_state',
			'x_ship_to_zip',
			'x_ship_to_country',
			'x_invoice_num',
		];

		to_hash = '^';

		for (verify_hash_fields of hash_field) {
			to_hash += ((post_fields[hash_field]) ? post_fields[hash_field] : '') + '^';
		}

		return this.generateHash(to_hash, signature_key);
	}
}