const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class ControllerCheckoutLogin extends Controller {
	async index() {
		const data = {};
		await this.load.language('checkout/checkout');

		data['checkout_guest'] = (this.config.get('config_checkout_guest') && !Number(this.config.get('config_customer_price')) && !await this.cart.hasDownload());

		if ((this.session.data['account'])) {
			data['account'] = this.session.data['account'];
		} else {
			data['account'] = 'register';
		}

		data['forgotten'] = await this.url.link('account/forgotten', '', true);

		this.response.setOutput(await this.load.view('checkout/login', data));
	}

	async save() {
		await this.load.language('checkout/checkout');

		const json = { error: {} };

		if (await this.customer.isLogged()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart');
		}

		if (!json.redirect) {
			this.load.model('account/customer', this);

			// Check how many login attempts have been made+
			const login_info = await this.model_account_customer.getLoginAttempts(this.request.post['email']);

			if (login_info && (login_info['total'] >= this.config.get('config_login_attempts')) && new Date(strtotime('-1 hour')).getTime() < new Date(login_info['date_modified']).getTime()) {
				json['error']['warning'] = this.language.get('error_attempts');
			}

			// Check if customer has been approved.
			const customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

			if (customer_info.customer_id && !customer_info['status']) {
				json['error']['warning'] = this.language.get('error_approved');
			}

			if (!Object.keys(json.error).length) {
				if (!await this.customer.login(this.request.post['email'], this.request.post['password'])) {
					json['error']['warning'] = this.language.get('error_login');

					await this.model_account_customer.addLoginAttempt(this.request.post['email']);
				} else {
					await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);
				}
			}
		}

		if (!Object.keys(json).length) {
			// Unset guest
			delete this.session.data['guest'];

			// Default Shipping Address
			this.load.model('account/address', this);

			if (this.config.get('config_tax_customer') == 'payment') {
				this.session.data['payment_address'] = await this.model_account_address.getAddress(await this.customer.getAddressId());
			}

			if (this.config.get('config_tax_customer') == 'shipping') {
				this.session.data['shipping_address'] = await this.model_account_address.getAddress(await this.customer.getAddressId());
			}

			// Wishlist
			if ((this.session.data['wishlist']) && Array.isArray(this.session.data['wishlist'])) {
				this.load.model('account/wishlist', this);

				for (let [key, product_id] of Object.entries(this.session.data['wishlist'])) {
					await this.model_account_wishlist.addWishlist(product_id);

					delete this.session.data['wishlist'][key];
				}
			}

			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
