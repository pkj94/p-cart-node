const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class ControllerAccountLogin extends Controller {
	error = {};

	async index() {
		const data = {};
		this.load.model('account/customer', this);

		// Login override for admin users
		if ((this.request.get['token'])) {
			await this.customer.logout();
			await this.cart.clear();

			delete this.session.data['order_id'];
			delete this.session.data['payment_address'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['shipping_address'];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['comment'];
			delete this.session.data['coupon'];
			delete this.session.data['reward'];
			delete this.session.data['voucher'];
			delete this.session.data['vouchers'];

			const customer_info = await this.model_account_customer.getCustomerByToken(this.request.get['token']);

			if (customer_info.customer_id && await this.customer.login(customer_info['email'], '', true)) {
				// Default Addresses
				this.load.model('account/address', this);

				if (this.config.get('config_tax_customer') == 'payment') {
					this.session.data['payment_address'] = await this.model_account_address.getAddress(await this.customer.getAddressId());
				}

				if (this.config.get('config_tax_customer') == 'shipping') {
					this.session.data['shipping_address'] = await this.model_account_address.getAddress(await this.customer.getAddressId());
				}
				await this.session.save(this.session.data);
				this.response.setRedirect(await this.url.link('account/account', '', true));
			}
		}

		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', '', true));
		}

		await this.load.language('account/login');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
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

			// Added strpos check to pass McAfee PCI compliance test (http://forum.opencart.com/viewtopic.js?f=10&t=12043&p=151494#p151295)
			await this.session.save(this.session.data);
			if ((this.request.post['redirect']) && this.request.post['redirect'] != await this.url.link('account/logout', '', true) && (this.request.post['redirect'].indexOf(this.config.get('config_url')) === 0 || this.request.post['redirect'].indexOf(this.config.get('config_ssl')) === 0)) {
				this.response.setRedirect(this.request.post['redirect'].replaceAll('&amp;', '&'));
			} else {
				this.response.setRedirect(await this.url.link('account/account', '', true));
			}
		} else {

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home')
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_account'),
				'href': await this.url.link('account/account', '', true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_login'),
				'href': await this.url.link('account/login', '', true)
			});

			if ((this.session.data['error'])) {
				data['error_warning'] = this.session.data['error'];

				delete this.session.data['error'];
			} else if ((this.error['warning'])) {
				data['error_warning'] = this.error['warning'];
			} else {
				data['error_warning'] = '';
			}

			data['action'] = await this.url.link('account/login', '', true);
			data['register'] = await this.url.link('account/register', '', true);
			data['forgotten'] = await this.url.link('account/forgotten', '', true);

			// Added strpos check to pass McAfee PCI compliance test (http://forum.opencart.com/viewtopic.js?f=10&t=12043&p=151494#p151295)
			if ((this.request.post['redirect']) && (this.request.post['redirect'].indexOf(this.config.get('config_url')) === 0 || this.request.post['redirect'].indexOf(this.config.get('config_ssl')) === 0)) {
				data['redirect'] = this.request.post['redirect'];
			} else if ((this.session.data['redirect'])) {
				data['redirect'] = this.session.data['redirect'];

				delete this.session.data['redirect'];
			} else {
				data['redirect'] = '';
			}

			if ((this.session.data['success'])) {
				data['success'] = this.session.data['success'];

				delete this.session.data['success'];
			} else {
				data['success'] = '';
			}

			if ((this.request.post['email'])) {
				data['email'] = this.request.post['email'];
			} else {
				data['email'] = '';
			}

			if ((this.request.post['password'])) {
				data['password'] = this.request.post['password'];
			} else {
				data['password'] = '';
			}

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			await this.session.save(this.session.data);
			this.response.setOutput(await this.load.view('account/login', data));
		}
	}

	async validate() {
		// Check how many login attempts have been made+
		const login_info = await this.model_account_customer.getLoginAttempts(this.request.post['email']);

		if (login_info && (login_info['total'] >= this.config.get('config_login_attempts')) && new Date(strtotime('-1 hour')) < new Date(login_info['date_modified']).getTime()) {
			this.error['warning'] = this.language.get('error_attempts');
		}

		// Check if customer has been approved+
		const customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

		if (customer_info && !customer_info['status']) {
			this.error['warning'] = this.language.get('error_approved');
		}

		if (!Object.keys(this.error).length) {
			if (!await this.customer.login(this.request.post['email'], this.request.post['password'])) {
				this.error['warning'] = this.language.get('error_login');

				await this.model_account_customer.addLoginAttempt(this.request.post['email']);
			} else {
				await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);
			}
		}

		return !Object.keys(this.error).length;
	}
}
