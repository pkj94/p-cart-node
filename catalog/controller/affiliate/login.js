const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class ControllerAffiliateLogin extends Controller {
	error = {};

	async index() {
		const data = {};
		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', '', true));
		}

		await this.load.language('affiliate/login');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('account/customer', this);

		if ((this.request.server['method'] == 'POST') && (this.request.post['email']) && (this.request.post['password']) && await this.validate()) {
			// Added strpos check to pass McAfee PCI compliance test (http://forum.opencart.com/viewtopic.js?f=10&t=12043&p=151494#p151295)
			if ((this.request.post['redirect']) && (this.request.post['redirect'].indexOf(this.config.get('config_url')) === 0 || this.request.post['redirect'].indexOf(this.config.get('config_ssl')) === 0)) {
				this.response.setRedirect(str_replace('&amp;', '&', this.request.post['redirect']));
			} else {
				this.response.setRedirect(await this.url.link('account/account', '', true));
			}
		}

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
			'href': await this.url.link('affiliate/login', '', true)
		});

		data['text_description'] = sprintf(this.language.get('text_description'), this.config.get('config_name'), this.config.get('config_name'), this.config.get('config_affiliate_commission') + '%');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['action'] = await this.url.link('affiliate/login', '', true);
		data['register'] = await this.url.link('affiliate/register', '', true);
		data['forgotten'] = await this.url.link('account/forgotten', '', true);

		if ((this.request.post['redirect'])) {
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
		this.response.setOutput(await this.load.view('affiliate/login', data));
	}

	async validate() {
		// Check how many login attempts have been made+
		const login_info = await this.model_account_customer.getLoginAttempts(this.request.post['email']);

		if (login_info && (login_info['total'] >= this.config.get('config_login_attempts')) && new Date(strtotime('-1 hour')).getTime() < new Date(login_info['date_modified']).getTime()) {
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