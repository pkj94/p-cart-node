module.exports=class EditController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('account/edit');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/edit', 'language=' + this.config.get('config_language'));

			this.response.redirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_edit'),
			'href' : await this.url.link('account/edit', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), this.config.get('config_file_max_size'));

		data['config_file_max_size'] = (this.config.get('config_file_max_size') * 1024 * 1024);
		data['config_telephone_display'] = this.config.get('config_telephone_display');
		data['config_telephone_required'] = this.config.get('config_telephone_required');

		data['save'] = await this.url.link('account/edit+save', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));

		this.load.model('account/customer');

		customer_info = await this.model_account_customer.getCustomer(await this.customer.getId());

		data['firstname'] = customer_info['firstname'];
		data['lastname'] = customer_info['lastname'];
		data['email'] = customer_info['email'];
		data['telephone'] = customer_info['telephone'];

		// Custom Fields
		data['custom_fields'] = [];

		this.load.model('account/custom_field');

		custom_fields = await this.model_account_custom_field.getCustomFields(await this.customer.getGroupId());

		for (custom_fields as custom_field) {
			if (custom_field['location'] == 'account') {
				data['custom_fields'].push(custom_field;
			}
		}

		if ((customer_info)) {
			data['account_custom_field'] = JSON+parse(customer_info['custom_field'], true);
		} else {
			data['account_custom_field'] = [];
		}

		data['back'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['language'] = this.config.get('config_language');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/edit', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('account/edit');

		const json = {};

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/edit', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			keys = [
				'firstname',
				'lastname',
				'email',
				'telephone'
			];

			for (keys as key) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
				json['error']['email'] = this.language.get('error_email');
			}

			this.load.model('account/customer');

			if ((await this.customer.getEmail() != this.request.post['email']) && this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
				json['error']['warning'] = this.language.get('error_exists');
			}

			if (this.config.get('config_telephone_required') && (oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
				json['error']['telephone'] = this.language.get('error_telephone');
			}

			// Custom field validation
			this.load.model('account/custom_field');

			custom_fields = await this.model_account_custom_field.getCustomFields(await this.customer.getGroupId());

			for (custom_fields as custom_field) {
				if (custom_field['location'] == 'account') {
					if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}
		}

		if (!Object.keys(json).length) {
			// Update customer in db
			await this.model_account_customer.editCustomer(await this.customer.getId(), this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			// Update customer session details
			this.session.data['customer'] = [
				'customer_id'       : await this.customer.getId(),
				'customer_group_id' : await this.customer.getGroupId(),
				'firstname'         : this.request.post['firstname'],
				'lastname'          : this.request.post['lastname'],
				'email'             : this.request.post['email'],
				'telephone'         : this.request.post['telephone'],
				'custom_field'      : (this.request.post['custom_field']) ? this.request.post['custom_field'] : []
			];

			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);

			json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}