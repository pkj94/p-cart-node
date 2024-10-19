module.exports =class CustomFieldModel extends Model {
	/**
	 * @param custom_field_id
	 *
	 * @return array
	 */
	async getCustomField(custom_field_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field` cf LEFT JOIN `" + DB_PREFIX + "custom_field_description` cfd ON (cf.`custom_field_id` = cfd.`custom_field_id`) WHERE cf.`status` = '1' AND cf.`custom_field_id` = '" + custom_field_id + "' AND cfd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param customer_group_id
	 *
	 * @return array
	 */
	async getCustomFields(customer_group_id = 0) {
		custom_field_data = [];

		if (!customer_group_id) {
			custom_field_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field` cf LEFT JOIN `" + DB_PREFIX + "custom_field_description` cfd ON (cf.`custom_field_id` = cfd.`custom_field_id`) WHERE cf.`status` = '1' AND cfd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY cf.`sort_order` ASC");
		} else {
			custom_field_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_customer_group` cfcg LEFT JOIN `" + DB_PREFIX + "custom_field` cf ON (cfcg.`custom_field_id` = cf.`custom_field_id`) LEFT JOIN `" + DB_PREFIX + "custom_field_description` cfd ON (cf.`custom_field_id` = cfd.`custom_field_id`) WHERE cf.`status` = '1' AND cfd.`language_id` = '" + this.config.get('config_language_id') + "' AND cfcg.`customer_group_id` = '" + customer_group_id + "' ORDER BY cf.`sort_order` ASC");
		}

		for (custom_field_query.rows as custom_field) {
			custom_field_value_data = [];

			if (custom_field['type'] == 'select' || custom_field['type'] == 'radio' || custom_field['type'] == 'checkbox') {
				custom_field_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_value` cfv LEFT JOIN `" + DB_PREFIX + "custom_field_value_description` cfvd ON (cfv.`custom_field_value_id` = cfvd.`custom_field_value_id`) WHERE cfv.`custom_field_id` = '" + custom_field['custom_field_id'] + "' AND cfvd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY cfv.`sort_order` ASC");

				for (custom_field_value_query.rows as custom_field_value) {
					custom_field_value_data.push({
						'custom_field_value_id' : custom_field_value['custom_field_value_id'],
						'name'                  : custom_field_value['name']
					];
				}
			}

			custom_field_data.push({
				'custom_field_id'    : custom_field['custom_field_id'],
				'custom_field_value' : custom_field_value_data,
				'name'               : custom_field['name'],
				'type'               : custom_field['type'],
				'value'              : custom_field['value'],
				'validation'         : custom_field['validation'],
				'location'           : custom_field['location'],
				'required'           : empty(custom_field['required']) || custom_field['required'] == 0 ? false : true,
				'sort_order'         : custom_field['sort_order']
			];
		}

		return custom_field_data;
	}
}
