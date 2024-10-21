const bin2hex = require("locutus/php/strings/bin2hex");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class RegisterController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}

		await this.load.language('account/register');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_register'),
			'href': await this.url.link('account/register', 'language=' + this.config.get('config_language'))
		});

		data['text_account_already'] = sprintf(this.language.get('text_account_already'), await this.url.link('account/login', 'language=' + this.config.get('config_language')));

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), Number(this.config.get('config_file_max_size')));

		data['config_file_max_size'] = (Number(this.config.get('config_file_max_size')) * 1024 * 1024);
		data['config_telephone_display'] = Number(this.config.get('config_telephone_display'));
		data['config_telephone_required'] = Number(this.config.get('config_telephone_required'));

		this.session.data['register_token'] = bin2hex(26);

		data['register'] = await this.url.link('account/register.register', 'language=' + this.config.get('config_language') + '&register_token=' + this.session.data['register_token']);
		data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));

		data['customer_groups'] = [];

		if (Array.isArray(this.config.get('config_customer_group_display'))) {
			this.load.model('account/customer_group', this);

			const customer_groups = await this.model_account_customer_group.getCustomerGroups();

			for (let customer_group of customer_groups) {
				if (this.config.get('config_customer_group_display').includes(customer_group['customer_group_id'])) {
					data['customer_groups'].push(customer_group);
				}
			}
		}

		data['customer_group_id'] = this.config.get('config_customer_group_id');

		// Custom Fields
		data['custom_fields'] = [];

		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields();

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'account') {
				data['custom_fields'].push(custom_field);
			}
		}

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('register')) {
			data['captcha'] = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code']);
		} else {
			data['captcha'] = '';
		}

		this.load.model('catalog/information', this);

		const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

		if (information_info) {
			data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information.info', 'language=' + this.config.get('config_language') + '&information_id=' + this.config.get('config_account_id')), information_info['title']);
		} else {
			data['text_agree'] = '';
		}

		data['language'] = this.config.get('config_language');
		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/register', data));
	}

	/**
	 * @return void
	 */
	async register() {
		await this.load.language('account/register');

		const json = { error: {} };

		let keys = [
			'customer_group_id',
			'firstname',
			'lastname',
			'email',
			'telephone',
			'custom_field',
			'password',
			'confirm',
			'agree'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if (!(this.request.get['register_token']) || !(this.session.data['register_token']) || (this.session.data['register_token'] != this.request.get['register_token'])) {
			json['redirect'] = await this.url.link('account/register', 'language=' + this.config.get('config_language'), true);
		}
		let customer_group_info;
		let customer_group_id = this.config.get('config_customer_group_id');
		if (Object.keys(json).length == 1) {
			// Customer Group
			if (this.request.post['customer_group_id']) {
				customer_group_id = this.request.post['customer_group_id'];
			}

			this.load.model('account/customer_group', this);

			customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

			if (!customer_group_info || !this.config.get('config_customer_group_display').includes(customer_group_id)) {
				json['error']['warning'] = this.language.get('error_customer_group');
			}

			if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((oc_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
				json['error']['email'] = this.language.get('error_email');
			}

			this.load.model('account/customer', this);

			if (await this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
				json['error']['warning'] = this.language.get('error_exists');
			}

			if (Number(this.config.get('config_telephone_required')) && (oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
				json['error']['telephone'] = this.language.get('error_telephone');
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'account') {
					if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}

			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			// Captcha
			this.load.model('setting/extension', this);

			const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

			if (extension_info && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && in_array('register', this.config.get('config_captcha_page'))) {
				const captcha = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code'] + '.validate');

				if (captcha) {
					json['error']['captcha'] = captcha;
				}
			}

			// Agree to terms
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

			if (information_info && !this.request.post['agree']) {
				json['error']['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
			}
		}
		if (!Object.keys(json.error).length && !json.redirect) {
			const customer_id = await this.model_account_customer.addCustomer(this.request.post);

			// Login if requires approval
			if (!customer_group_info['approval']) {
				await this.customer.login(this.request.post['email'], html_entity_decode(this.request.post['password']));

				// Add customer details into session
				this.session.data['customer'] = {
					'customer_id': customer_id,
					'customer_group_id': customer_group_id,
					'firstname': this.request.post['firstname'],
					'lastname': this.request.post['lastname'],
					'email': this.request.post['email'],
					'telephone': this.request.post['telephone'],
					'custom_field': this.request.post['custom_field']
				};

				// Log the IP info
				await this.model_account_customer.addLogin(await this.customer.getId(), (this.request.server.headers['x-forwarded-for'] ||
					this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress));

				// Create customer token
				this.session.data['customer_token'] = oc_token(26);
			}

			// Clear any previous login attempts for unregistered accounts+
			await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);

			delete this.session.data['guest'];
			delete this.session.data['register_token'];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];

			json['redirect'] = await this.url.link('account/success', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''), true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}