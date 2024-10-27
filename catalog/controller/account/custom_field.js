module.exports = class CustomField extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const json = {};

		// Customer Group
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((this.request.get['customer_group_id']) && this.config.get('config_customer_group_display').includes(this.request.get['customer_group_id'])) {
			customer_group_id = this.request.get['customer_group_id'];
		} else {
			customer_group_id = this.config.get('config_customer_group_id');
		}

		this.load.model('account/custom_field', this);

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
