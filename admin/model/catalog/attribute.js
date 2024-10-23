module.exports = class AttributeCatalogModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry)
	}
	/*
	 *	Add Attribute
	 *
	 *	Create a new attribute record in the database.
	 *
	 *	@param	array	data
	 *
	 *	@return	int		returns the primary key of the new attribute record.
	 */
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addAttribute(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute` SET `attribute_group_id` = '" + data['attribute_group_id'] + "', `sort_order` = '" + data['sort_order'] + "'");

		const attribute_id = this.db.getLastId();

		for (let [language_id,  value] of Object.entries(data['attribute_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_description` SET `attribute_id` = '" + attribute_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		return attribute_id;
	}

	/*
	 *	Edit Attribute
	 *
	 *	Edit attribute record in the database.
	 *
	 *	@param	int		attribute_id	Primary key of the attribute record to edit.
	 *	@param	array	data  			Array of data [
	 * 		'attribute_group_id'
	 * ].
	 *
	 *	@return	void
	 */
	/**
	 * @param   attribute_id
	 * @param data
	 *
	 * @return void
	 */
	async editAttribute(attribute_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "attribute` SET `attribute_group_id` = '" + data['attribute_group_id'] + "', `sort_order` = '" + data['sort_order'] + "' WHERE `attribute_id` = '" + attribute_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_description` WHERE `attribute_id` = '" + attribute_id + "'");

		for (let [language_id,  value] of Object.entries(data['attribute_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_description` SET `attribute_id` = '" + attribute_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}
	}

	/*
	 *	Delete Attribute
	 *
	 *	Delete attribute record in the database.
	 *
	 *	@param	int	attribute_id primary key of the attribute record to be deleted
	 *
	 *	@return	void
	 *
	 */
	/**
	 * @param attribute_id
	 *
	 * @return void
	 */
	async deleteAttribute(attribute_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute` WHERE `attribute_id` = '" + attribute_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_description` WHERE `attribute_id` = '" + attribute_id + "'");
	}

	/*
	 *	Get Attribute
	 *
	 *	Get the record of the attribute record in the database.
	 *
	 *	@param	int		attribute_id primary key of the attribute record to be fetched
	 *
	 *	@return	array
	 *
	 */
	/**
	 * @param attribute_id
	 *
	 * @return array
	 */
	async getAttribute(attribute_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "attribute` a LEFT JOIN `" + DB_PREFIX + "attribute_description` ad ON (a.`attribute_id` = ad.`attribute_id`) WHERE a.`attribute_id` = '" + attribute_id + "' AND ad.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/*
	 *	Get Attributes
	 *
	 *	Get the record of the attribute record in the database.
	 *
	 *	@param	array	data array of filters
	 *
	 *	@return	array
	 *
	 */
	/**
	 * @param data
	 *
	 * @return array
	 */
	async getAttributes(data = {}) {
		let sql = "SELECT *, (SELECT agd.`name` FROM `" + DB_PREFIX + "attribute_group_description` agd WHERE agd.`attribute_group_id` = a.`attribute_group_id` AND agd.`language_id` = '" + this.config.get('config_language_id') + "') AS attribute_group FROM `" + DB_PREFIX + "attribute` a LEFT JOIN `" + DB_PREFIX + "attribute_description` ad ON (a.`attribute_id` = ad.`attribute_id`) WHERE ad.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND ad.`name` LIKE " + this.db.escape(data['filter_name'] + '%');
		}

		if ((data['filter_attribute_group_id'])) {
			sql += " AND a.`attribute_group_id` = '" + data['filter_attribute_group_id'] + "'";
		}

		let sort_data = ['ad.name', 'attribute_group', 'a.sort_order'];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `attribute_group`, ad.`name`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/*
	 *	Get Descriptions
	 *
	 *	Get the record of the attribute record in the database.
	 *
	 *	@param	int		attribute_id primary key of the attribute record to be fetched.
	 *
	 *	@return	array	returns array of descriptions sorted by language_id
	 *
	 */
	/**
	 * @param attribute_id
	 *
	 * @return array
	 */
	async getDescriptions(attribute_id) {
		let attribute_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "attribute_description` WHERE `attribute_id` = '" + attribute_id + "'");

		for (let result of query.rows) {
			attribute_data[result['language_id']] = {'name' : result['name']};
		}

		return attribute_data;
	}

	/*
	 *	Get Total Attributes
	 *
	 *	Get the total number of attribute records in the database.
	 *
	 *	@return	int	Total number of attribute records.
	 */
	/**
	 * @return int
	 */
	async getTotalAttributes() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "attribute`");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/*
	 *	Get Total Attributes By Attribute Group ID
	 *
	 *	Get the total number of attribute records with group ID in the database.
	 *
	 *	@param	int	attribute_group_id foreign key of the attribute record to be fetched.
	 *
	 *	@return	int	Total number of attribute records that have attribute group ID.
	 */
	/**
	 * @param attribute_group_id
	 *
	 * @return int
	 */
	async getTotalAttributesByAttributeGroupId(attribute_group_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "attribute` WHERE `attribute_group_id` = '" + attribute_group_id + "'");

		return query.row['total'];
	}
}
