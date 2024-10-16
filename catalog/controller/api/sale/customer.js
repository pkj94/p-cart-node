<?php
namespace Opencart\Catalog\Controller\Api\Sale;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Api\Sale
 */
class CustomerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('api/sale/customer');

		const json = {};

		keys = [
			'customer_id',
			'customer_group_id',
			'firstname',
			'lastname',
			'email',
			'telephone',
			'account_custom_field'
		];

		for (keys as key) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		this.load.model('account/customer');

		if (this.request.post['customer_id']) {
			customer_info = await this.model_account_customer.getCustomer(this.request.post['customer_id']);

			if (!customer_info) {
				json['error']['warning'] = this.language.get('error_customer');
			}
		}

		// Customer Group
		if (this.request.post['customer_group_id']) {
			customer_group_id = this.request.post['customer_group_id'];
		} else {
			customer_group_id = this.config.get('config_customer_group_id');
		}

		this.load.model('account/customer_group');

		customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);

		if (!customer_group_info) {
			json['error']['warning'] = this.language.get('error_customer_group');
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

		if (this.config.get('config_telephone_required') && (oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
			json['error']['telephone'] = this.language.get('error_telephone');
		}

		// Custom field validation
		this.load.model('account/custom_field');

		custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

		for (custom_fields as custom_field) {
			if (custom_field['location'] == 'account') {
				if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
					json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
					json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
				}
			}
		}

		if (!Object.keys(json).length) {
			this.session.data['customer'] = [
				'customer_id'       : this.request.post['customer_id'],
				'customer_group_id' : this.request.post['customer_group_id'],
				'firstname'         : this.request.post['firstname'],
				'lastname'          : this.request.post['lastname'],
				'email'             : this.request.post['email'],
				'telephone'         : this.request.post['telephone'],
				'custom_field'      : (this.request.post['custom_field']) && is_array(this.request.post['custom_field']) ? this.request.post['custom_field'] : []
			];

			json['success'] = this.language.get('text_success');

			delete (this.session.data['reward']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
