const trim = require("locutus/php/strings/trim");

module.exports = class ControllerAccountRegister extends Controller {
	error = {};

	async index() {
		const data = {};
		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', '', true));
		}

		await this.load.language('account/register');

		this.document.setTitle(this.language.get('heading_title'));

		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
		this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

		this.load.model('account/customer', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			const customer_id = await this.model_account_customer.addCustomer(this.request.post);

			// Clear any previous login attempts for unregistered accounts+
			await this.model_account_customer.deleteLoginAttempts(this.request.post['email']);

			await this.customer.login(this.request.post['email'], this.request.post['password']);

			delete this.session.data['guest'];

			this.response.setRedirect(await this.url.link('account/success'));
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
				'text': this.language.get('text_register'),
				'href': await this.url.link('account/register', '', true)
			});
			data['text_account_already'] = sprintf(this.language.get('text_account_already'), await this.url.link('account/login', '', true));

			if ((this.error['warning'])) {
				data['error_warning'] = this.error['warning'];
			} else {
				data['error_warning'] = '';
			}

			if ((this.error['firstname'])) {
				data['error_firstname'] = this.error['firstname'];
			} else {
				data['error_firstname'] = '';
			}

			if ((this.error['lastname'])) {
				data['error_lastname'] = this.error['lastname'];
			} else {
				data['error_lastname'] = '';
			}

			if ((this.error['email'])) {
				data['error_email'] = this.error['email'];
			} else {
				data['error_email'] = '';
			}

			if ((this.error['telephone'])) {
				data['error_telephone'] = this.error['telephone'];
			} else {
				data['error_telephone'] = '';
			}

			if ((this.error['custom_field'])) {
				data['error_custom_field'] = this.error['custom_field'];
			} else {
				data['error_custom_field'] = {};
			}

			if ((this.error['password'])) {
				data['error_password'] = this.error['password'];
			} else {
				data['error_password'] = '';
			}

			if ((this.error['confirm'])) {
				data['error_confirm'] = this.error['confirm'];
			} else {
				data['error_confirm'] = '';
			}

			data['action'] = await this.url.link('account/register', '', true);

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

			if ((this.request.post['customer_group_id'])) {
				data['customer_group_id'] = this.request.post['customer_group_id'];
			} else {
				data['customer_group_id'] = this.config.get('config_customer_group_id');
			}

			if ((this.request.post['firstname'])) {
				data['firstname'] = this.request.post['firstname'];
			} else {
				data['firstname'] = '';
			}

			if ((this.request.post['lastname'])) {
				data['lastname'] = this.request.post['lastname'];
			} else {
				data['lastname'] = '';
			}

			if ((this.request.post['email'])) {
				data['email'] = this.request.post['email'];
			} else {
				data['email'] = '';
			}

			if ((this.request.post['telephone'])) {
				data['telephone'] = this.request.post['telephone'];
			} else {
				data['telephone'] = '';
			}

			// Custom Fields
			data['custom_fields'] = [];

			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields();

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'account') {
					data['custom_fields'].push(custom_field);
				}
			}

			if ((this.request.post['custom_field'] && this.request.post['custom_field']['account'])) {
				data['register_custom_field'] = this.request.post['custom_field']['account'];
			} else {
				data['register_custom_field'] = [];
			}

			if ((this.request.post['password'])) {
				data['password'] = this.request.post['password'];
			} else {
				data['password'] = '';
			}

			if ((this.request.post['confirm'])) {
				data['confirm'] = this.request.post['confirm'];
			} else {
				data['confirm'] = '';
			}

			if ((this.request.post['newsletter'])) {
				data['newsletter'] = this.request.post['newsletter'];
			} else {
				data['newsletter'] = '';
			}

			// Captcha
			if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('register')) {
				data['captcha'] = await this.load.controller('extension/captcha/' + this.config.get('config_captcha'), this.error);
			} else {
				data['captcha'] = '';
			}

			if (this.config.get('config_account_id')) {
				this.load.model('catalog/information', this);

				const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

				if (information_info.information_id) {
					data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information/agree', 'information_id=' + this.config.get('config_account_id'), true), information_info['title']);
				} else {
					data['text_agree'] = '';
				}
			} else {
				data['text_agree'] = '';
			}

			if ((this.request.post['agree'])) {
				data['agree'] = this.request.post['agree'];
			} else {
				data['agree'] = false;
			}

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('account/register', data));
		}
	}

	async validate() {
		if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((utf8_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
			this.error['email'] = this.language.get('error_email');
		}

		if (await this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
			this.error['warning'] = this.language.get('error_exists');
		}

		if ((utf8_strlen(this.request.post['telephone']) < 3) || (utf8_strlen(this.request.post['telephone']) > 32)) {
			this.error['telephone'] = this.language.get('error_telephone');
		}

		// Customer Group
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((this.request.post['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && this.config.get('config_customer_group_display').includes(this.request.post['customer_group_id'])) {
			customer_group_id = this.request.post['customer_group_id'];
		}

		// Custom field validation
		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'account') {
				if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
					this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if (custom_field.type === 'text' && custom_field.validation) {
					const regex = new RegExp(custom_field.validation);
					if (!regex.test(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
						this.error['custom_field'] = this.error['custom_field'] || {};
						this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					}
				}
			}
		}

		if ((utf8_strlen(html_entity_decode(this.request.post['password'])) < 4) || (utf8_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
			this.error['password'] = this.language.get('error_password');
		}

		if (this.request.post['confirm'] != this.request.post['password']) {
			this.error['confirm'] = this.language.get('error_confirm');
		}

		// Captcha
		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('register')) {
			const captcha = await this.load.controller('extension/captcha/' + this.config.get('config_captcha') + '/validate');

			if (captcha) {
				this.error['captcha'] = captcha;
			}
		}

		// Agree to terms
		if (this.config.get('config_account_id')) {
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_account_id'));

			if (information_info.information_id && !(this.request.post['agree'])) {
				this.error['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
			}
		}

		return !Object.keys(this.error).length;
	}

	async customfield() {
		const json = {};

		this.load.model('account/custom_field', this);

		// Customer Group
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((this.request.get['customer_group_id']) && Array.isArray(this.config.get('config_customer_group_display')) && this.config.get('config_customer_group_display').includes(this.request.get['customer_group_id'])) {
			customer_group_id = this.request.get['customer_group_id'];
		}

		const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

		for (let custom_field of custom_fields) {
			json.push({
				'custom_field_id': custom_field['custom_field_id'],
				'required': custom_field['required']
			});
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}