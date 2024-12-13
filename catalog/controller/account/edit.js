const trim = require("locutus/php/strings/trim");

module.exports = class ControllerAccountEdit extends Controller {
	error = {};

	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/edit', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/edit');

		this.document.setTitle(this.language.get('heading_title'));

		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
		this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

		this.load.model('account/customer', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_account_customer.editCustomer(await this.customer.getId(), this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('account/account', '', true));
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
			'text': this.language.get('text_edit'),
			'href': await this.url.link('account/edit', '', true)
		});

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
			data['error_custom_field'] = [];
		}

		data['action'] = await this.url.link('account/edit', '', true);
		let customer_info;
		if (this.request.server['method'] != 'POST') {
			customer_info = await this.model_account_customer.getCustomer(await this.customer.getId());
		}

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((customer_info)) {
			data['firstname'] = customer_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((customer_info)) {
			data['lastname'] = customer_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else if ((customer_info)) {
			data['email'] = customer_info['email'];
		} else {
			data['email'] = '';
		}

		if ((this.request.post['telephone'])) {
			data['telephone'] = this.request.post['telephone'];
		} else if ((customer_info)) {
			data['telephone'] = customer_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((this.request.post['custom_field'] && this.request.post['custom_field']['account'])) {
			data['account_custom_field'] = this.request.post['custom_field']['account'];
		} else if ((customer_info)) {
			data['account_custom_field'] = JSON.parse(customer_info['custom_field'] || '{}');
		} else {
			data['account_custom_field'] = [];
		}

		// Custom Fields
		data['custom_fields'] = [];

		this.load.model('tool/upload', this);
		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'account') {
				if (custom_field['type'] == 'file' && (data['account_custom_field'][custom_field['custom_field_id']])) {
					const code = data['account_custom_field'][custom_field['custom_field_id']];

					data['account_custom_field'][custom_field['custom_field_id']] = {};

					const upload_result = await this.model_tool_upload.getUploadByCode(code);

					if (upload_result.code) {
						data['account_custom_field'][custom_field['custom_field_id']]['name'] = upload_result['name'];
						data['account_custom_field'][custom_field['custom_field_id']]['code'] = upload_result['code'];
					} else {
						data['account_custom_field'][custom_field['custom_field_id']]['name'] = "";
						data['account_custom_field'][custom_field['custom_field_id']]['code'] = code;
					}
					data['custom_fields'].push(custom_field);
				} else {
					data['custom_fields'].push(custom_field);
				}
			}
		}

		data['back'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/edit', data));
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

		if ((await this.customer.getEmail() != this.request.post['email']) && await this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
			this.error['warning'] = this.language.get('error_exists');
		}

		if ((utf8_strlen(this.request.post['telephone']) < 3) || (utf8_strlen(this.request.post['telephone']) > 32)) {
			this.error['telephone'] = this.language.get('error_telephone');
		}

		// Custom field validation
		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'account') {
				if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
					this.error['custom_field'] = this.error['custom_field'] || {};
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

		return !Object.keys(this.error).length;
	}
}