module.exports = class ControllerExtensionPaymentSkrill extends Controller {
	async index() {
const data = {};
		this.load.model('checkout/order',this);

		await this.load.language('extension/payment/skrill');

		if(!(this.session.data['order_id'])) {
			return false;
		}

		data['button_confirm'] = this.language.get('button_confirm');

		data['action'] = 'https://www.moneybookers+com/app/payment+pl?p=OpenCart';

		data['pay_to_email'] = this.config.get('payment_skrill_email');
		data['platform'] = '31974336';
		data['description'] = this.config.get('config_name');
		data['transaction_id'] = this.session.data['order_id'];
		data['return_url'] = await this.url.link('checkout/success');
		data['cancel_url'] = await this.url.link('checkout/checkout', '', true);
		data['status_url'] = await this.url.link('extension/payment/skrill/callback');
		data['language'] = this.session.data['language'];
		data['logo'] = this.config.get('config_url') + 'image/' + this.config.get('config_logo');

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		data['pay_from_email'] = order_info['email'];
		data['firstname'] = order_info['payment_firstname'];
		data['lastname'] = order_info['payment_lastname'];
		data['address'] = order_info['payment_address_1'];
		data['address2'] = order_info['payment_address_2'];
		data['phone_number'] = order_info['telephone'];
		data['postal_code'] = order_info['payment_postcode'];
		data['city'] = order_info['payment_city'];
		data['state'] = order_info['payment_zone'];
		data['country'] = order_info['payment_iso_code_3'];
		data['amount'] = this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false);
		data['currency'] = order_info['currency_code'];

		products = '';

		for (let product of await this.cart.getProducts()) {
			products += product['quantity'] + ' x ' + product['name'] + ', ';
		}

		data['detail1_text'] = products;

		data['order_id'] = this.session.data['order_id'];

		return await this.load.view('extension/payment/skrill', data);
	}

	async callback() {
		if ((this.request.post['order_id'])) {
			order_id = this.request.post['order_id'];
		} else {
			order_id = 0;
		}

		this.load.model('checkout/order',this);

		order_info = await this.model_checkout_order.getOrder(order_id);

		if (order_info) {
			await this.model_checkout_order.addOrderHistory(order_id, this.config.get('config_order_status_id'));

			verified = true;

			// md5sig validation
			if (this.config.get('payment_skrill_secret')) {
				hash  = this.request.post['merchant_id'];
				hash += this.request.post['transaction_id'];
				hash += strtoupper(md5(this.config.get('payment_skrill_secret')));
				hash += this.request.post['mb_amount'];
				hash += this.request.post['mb_currency'];
				hash += this.request.post['status'];

				md5hash = strtoupper(md5(hash));
				md5sig = this.request.post['md5sig'];

				if ((md5hash != md5sig) || (strtolower(this.request.post['pay_to_email']) != strtolower(this.config.get('config_moneybookers_email'))) || (this.request.post['amount'] != this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false))) {
					verified = false;
				}
			}

			if (verified) {
				switch(this.request.post['status']) {
					case '2':
						await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_skrill_order_status_id'), '', true);
						break;
					case '0':
						await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_skrill_pending_status_id'), '', true);
						break;
					case '-1':
						await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_skrill_canceled_status_id'), '', true);
						break;
					case '-2':
						await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_skrill_failed_status_id'), '', true);
						break;
					case '-3':
						await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_skrill_chargeback_status_id'), '', true);
						break;
				}
			} else {
				this.log.write('md5sig returned (' + md5sig + ') does not match generated (' + md5hash + ')+ Verify Manually+ Current order state: ' + this.config.get('config_order_status_id'));
			}
		}
	}
}