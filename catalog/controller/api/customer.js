const trim = require("locutus/php/strings/trim");

module.exports = class ControllerApiCustomer extends Controller {
	async index() {
		const data = {};
		await this.load.language('api/customer');

		// Delete past customer in case there is an error
		delete this.session.data['customer'];

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = json['error'] || {};
			json['error']['warning'] = this.language.get('error_permission');
		} else {
			// Add keys for missing post vars
			const keys = [
				'customer_id',
				'customer_group_id',
				'firstname',
				'lastname',
				'email',
				'telephone',
			];

			for (let key of keys) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			// Customer
			if (this.request.post['customer_id']) {
				this.load.model('account/customer', this);

				const customer_info = await this.model_account_customer.getCustomer(this.request.post['customer_id']);

				if (!customer_info.customer_id || !await this.customer.login(customer_info['email'], '', true)) {
					json['error'] = json['error'] || {};
					json['error']['warning'] = this.language.get('error_customer');
				}
			}

			if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
				json['error'] = json['error'] || {};
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
				json['error'] = json['error'] || {};
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((utf8_strlen(this.request.post['email']) > 96) || (!isEmailValid(this.request.post['email']))) {
				json['error'] = json['error'] || {};
				json['error']['email'] = this.language.get('error_email');
			}

			if ((utf8_strlen(this.request.post['telephone']) < 3) || (utf8_strlen(this.request.post['telephone']) > 32)) {
				json['error'] = json['error'] || {};
				json['error']['telephone'] = this.language.get('error_telephone');
			}

			// Customer Group
			let customer_group_id = this.config.get('config_customer_group_id');
			if (Array.isArray(this.config.get('config_customer_group_display')) && this.config.get('config_customer_group_display').includes(this.request.post['customer_group_id'])) {
				customer_group_id = this.request.post['customer_group_id'];
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'account') {
					if (custom_field['required'] && !(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error'] = json['error'] || {};
						json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if (custom_field.type === 'text' && custom_field.validation) {
						const regex = new RegExp(custom_field.validation);
						if (!regex.test(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
							json['error'] = json['error'] || {};
							json['error']['custom_field' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
						}
					}
				}
			}

			if (!Object.keys(json).length) {
				this.session.data['customer'] = {
					'customer_id': this.request.post['customer_id'],
					'customer_group_id': customer_group_id,
					'firstname': this.request.post['firstname'],
					'lastname': this.request.post['lastname'],
					'email': this.request.post['email'],
					'telephone': this.request.post['telephone'],
					'custom_field': (this.request.post['custom_field']) ? this.request.post['custom_field'] : {}
				};

				json['success'] = this.language.get('text_success');
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
