module.exports=class LoginController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		// If already logged in and has matching token then redirect to account page
		if (await this.customer.isLogged() && (this.request.get['customer_token']) && (this.session.data['customer_token']) && (this.request.get['customer_token'] == this.session.data['customer_token'])) {
			this.response.redirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}

		await this.load.language('account/login');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_login'),
			'href' : await this.url.link('account/login', 'language=' + this.config.get('config_language'))
		];

		// Check to see if user is using incorrect token
		if ((this.session.data['customer_token'])) {
			data['error_warning'] = this.language.get('error_token');

			await this.customer.logout();

			delete (this.session.data['customer']);
			delete (this.session.data['shipping_address']);
			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_address']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);
			delete (this.session.data['comment']);
			delete (this.session.data['order_id']);
			delete (this.session.data['coupon']);
			delete (this.session.data['reward']);
			delete (this.session.data['voucher']);
			delete (this.session.data['vouchers']);
			delete (this.session.data['customer_token']);
		} else if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete (this.session.data['error']);
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete (this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.session.data['redirect'])) {
			data['redirect'] = this.session.data['redirect'];

			delete (this.session.data['redirect']);
		} else if ((this.request.get['redirect'])) {
			data['redirect'] = decodeURIComponent(this.request.get['redirect']);
		} else {
			data['redirect'] = '';
		}

		this.session.data['login_token'] = substr(bin2hex(openssl_random_pseudo_bytes(26)), 0, 26);

		data['login'] = await this.url.link('account/login+login', 'language=' + this.config.get('config_language') + '&login_token=' + this.session.data['login_token']);
		data['register'] = await this.url.link('account/register', 'language=' + this.config.get('config_language'));
		data['forgotten'] = await this.url.link('account/forgotten', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/login', data));
	}

	/**
	 * @return void
	 */
	async login() {
		await this.load.language('account/login');

		const json = {};

		await this.customer.logout();

		if (!(this.request.get['login_token']) || !(this.session.data['login_token']) || (this.request.get['login_token'] != this.session.data['login_token'])) {
			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			keys = [
				'email',
				'password',
				'redirect'
			];

			for (keys as key) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			// Check how many login attempts have been made+
			this.load.model('account/customer');

			login_info = await this.model_account_customer.getLoginAttempts(this.request.post['email']);

			if (login_info && (login_info['total'] >= this.config.get('config_login_attempts')) && new Date('-1 hour') < new Date(login_info['date_modified'])) {
				json['error']['warning'] = this.language.get('error_attempts');
			}

			// Check if customer has been approved+
			customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

			if (customer_info && !customer_info['status']) {
				json['error']['warning'] = this.language.get('error_approved');
			} else if (!await this.customer.login(this.request.post['email'], html_entity_decode(this.request.post['password']))) {
				json['error']['warning'] = this.language.get('error_login');

				await this.model_account_customer.addLoginAttempt(this.request.post['email']);
			}
		}

		if (!Object.keys(json).length) {
			// Add customer details into session
			this.session.data['customer'] = [
				'customer_id'       : customer_info['customer_id'],
				'customer_group_id' : customer_info['customer_group_id'],
				'firstname'         : customer_info['firstname'],
				'lastname'          : customer_info['lastname'],
				'email'             : customer_info['email'],
				'telephone'         : customer_info['telephone'],
				'custom_field'      : customer_info['custom_field']
			];

			delete (this.session.data['order_id']);
			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);

			// Wishlist
			if ((this.session.data['wishlist']) && is_array(this.session.data['wishlist'])) {
				this.load.model('account/wishlist',this);

				for (this.session.data['wishlist'] as key : product_id) {
					await this.model_account_wishlist.addWishlist(product_id);

					delete (this.session.data['wishlist'][key]);
				}
			}

			// Log the IP info
			await this.model_account_customer.addLogin(await this.customer.getId(), this.request.server['REMOTE_ADDR']);

			// Create customer token
			this.session.data['customer_token'] = oc_token(26);

			await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);

			// Added strpos check to pass McAfee PCI compliance test (http://forum+opencart+com/viewtopic+php?f=10&t=12043&p=151494#p151295)
			if ((this.request.post['redirect']) && (strpos(this.request.post['redirect'], this.config.get('config_url')) !== false)) {
				json['redirect'] = str_replace('&amp;', '&', this.request.post['redirect']) + '&customer_token=' + this.session.data['customer_token'];
			} else {
				json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async token() {
		await this.load.language('account/login');

		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		} else {
			email = '';
		}

		if ((this.request.get['login_token'])) {
			token = this.request.get['login_token'];
		} else {
			token = '';
		}

		// Login override for admin users
		await this.customer.logout();
		this.cart.clear();

		delete (this.session.data['order_id']);
		delete (this.session.data['payment_address']);
		delete (this.session.data['payment_method']);
		delete (this.session.data['payment_methods']);
		delete (this.session.data['shipping_address']);
		delete (this.session.data['shipping_method']);
		delete (this.session.data['shipping_methods']);
		delete (this.session.data['comment']);
		delete (this.session.data['coupon']);
		delete (this.session.data['reward']);
		delete (this.session.data['voucher']);
		delete (this.session.data['vouchers']);
		delete (this.session.data['customer_token']);

		this.load.model('account/customer');

		customer_info = await this.model_account_customer.getCustomerByEmail(email);

		if (customer_info && customer_info['token'] && customer_info['token'] == token && await this.customer.login(customer_info['email'], '', true)) {
			// Add customer details into session
			this.session.data['customer'] = [
				'customer_id'       : customer_info['customer_id'],
				'customer_group_id' : customer_info['customer_group_id'],
				'firstname'         : customer_info['firstname'],
				'lastname'          : customer_info['lastname'],
				'email'             : customer_info['email'],
				'telephone'         : customer_info['telephone'],
				'custom_field'      : customer_info['custom_field']
			];
			
			// Default Addresses
			this.load.model('account/address');
			
			address_info = await this.model_account_address.getAddress(await this.customer.getId(), await this.customer.getAddressId());
			
			if (address_info) {
				this.session.data['shipping_address'] = address_info;
			}

			if (this.config.get('config_tax_customer') && address_info) {
				this.session.data[this.config.get('config_tax_customer') + '_address'] = address_info;
			}

			await this.model_account_customer.editToken(email, '');

			// Create customer token
			this.session.data['customer_token'] = oc_token(26);

			this.response.redirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		} else {
			this.session.data['error'] = this.language.get('error_login');

			await this.model_account_customer.editToken(email, '');

			this.response.redirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}
	}
}
