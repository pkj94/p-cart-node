module.exports=class CustomFieldController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		const json = {};

		// Customer Group
		if ((this.request.get['customer_group_id']) && in_array(this.request.get['customer_group_id'], this.config.get('config_customer_group_display'))) {
			customer_group_id = this.request.get['customer_group_id'];
		} else {
			customer_group_id = this.config.get('config_customer_group_id');
		}

		this.load.model('account/custom_field');

		custom_fields = await this.model_account_custom_field.getCustomFields(customer_group_id);

		for (custom_fields as custom_field) {
			json.push({
				'custom_field_id' : custom_field['custom_field_id'],
				'required'        : custom_field['required']
			];
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
