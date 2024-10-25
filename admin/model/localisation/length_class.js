module.exports = class LengthClassLocalisationModel extends global['\Opencart\System\Engine\Model']{
	constructor(registry) {
	super(registry);
}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addLengthClass(data) {
	await this.db.query("INSERT INTO `" + DB_PREFIX + "length_class` SET `value` = '" + data['value'] + "'");

	const length_class_id = this.db.getLastId();

	for (let [language_id, value] of Object.entries(data['length_class_description'])) {
		language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
		await this.db.query("INSERT INTO `" + DB_PREFIX + "length_class_description` SET `length_class_id` = '" + length_class_id + "', `language_id` = '" + language_id + "', `title` = " + this.db.escape(value['title']) + ", `unit` = " + this.db.escape(value['unit']) + "");
	}

	await this.cache.delete('length_class');

	return length_class_id;
}

	/**
	 * @param   length_class_id
	 * @param data
	 *
	 * @return void
	 */
	async editLengthClass(length_class_id, data) {
	await this.db.query("UPDATE `" + DB_PREFIX + "length_class` SET `value` = '" + data['value'] + "' WHERE `length_class_id` = '" + length_class_id + "'");

	await this.db.query("DELETE FROM `" + DB_PREFIX + "length_class_description` WHERE `length_class_id` = '" + length_class_id + "'");

	for (let [language_id, value] of Object.entries(data['length_class_description'])) {
		language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
		await this.db.query("INSERT INTO `" + DB_PREFIX + "length_class_description` SET `length_class_id` = '" + length_class_id + "', `language_id` = '" + language_id + "', `title` = " + this.db.escape(value['title']) + ", `unit` = " + this.db.escape(value['unit']) + "");
	}

	await this.cache.delete('length_class');
}

	/**
	 * @param length_class_id
	 *
	 * @return void
	 */
	async deleteLengthClass(length_class_id) {
	await this.db.query("DELETE FROM `" + DB_PREFIX + "length_class` WHERE `length_class_id` = '" + length_class_id + "'");
	await this.db.query("DELETE FROM `" + DB_PREFIX + "length_class_description` WHERE `length_class_id` = '" + length_class_id + "'");

	await this.cache.delete('length_class');
}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getLengthClasses(data = {}) {
	let sql = "SELECT * FROM `" + DB_PREFIX + "length_class` lc LEFT JOIN `" + DB_PREFIX + "length_class_description` lcd ON (lc.`length_class_id` = lcd.`length_class_id`) WHERE lcd.`language_id` = '" + this.config.get('config_language_id') + "'";

	let sort_data = [
		'title',
		'unit',
		'value'
	];

	if ((data['sort']) && sort_data.includes(data['sort'],)) {
		sql += " ORDER BY " + data['sort'];
	} else {
		sql += " ORDER BY `title`";
	}

	if ((data['order']) && (data['order'] == 'DESC')) {
		sql += " DESC";
	} else {
		sql += " ASC";
	}

	if ((data['start']) || (data['limit'])) {
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

	let length_class_data = await this.cache.get('length_class.' + md5(sql));

	if (!length_class_data) {
		const query = await this.db.query(sql);

		length_class_data = query.rows;

		await this.cache.set('length_class.' + md5(sql), length_class_data);
	}

	return length_class_data;
}

	/**
	 * @param length_class_id
	 *
	 * @return array
	 */
	async getLengthClass(length_class_id) {
	const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "length_class` lc LEFT JOIN `" + DB_PREFIX + "length_class_description` lcd ON (lc.`length_class_id` = lcd.`length_class_id`) WHERE lc.`length_class_id` = '" + length_class_id + "' AND lcd.`language_id` = '" + this.config.get('config_language_id') + "'");

	return query.row;
}

	/**
	 * @param string unit
	 *
	 * @return array
	 */
	async getDescriptionByUnit(unit) {
	const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "length_class_description` WHERE `unit` = " + this.db.escape(unit) + " AND `language_id` = '" + this.config.get('config_language_id') + "'");

	return query.row;
}

	/**
	 * @param length_class_id
	 *
	 * @return array
	 */
	async getDescriptions(length_class_id) {
	let length_class_data = {};

	const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "length_class_description` WHERE `length_class_id` = '" + length_class_id + "'");

	for (let result of query.rows) {
		length_class_data[result['language_id']] = {
			'title': result['title'],
			'unit': result['unit']
		};
	}

	return length_class_data;
}

	/**
	 * @return int
	 */
	async getTotalLengthClasses() {
	const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "length_class`");

	return query.row['total'];
}
}
