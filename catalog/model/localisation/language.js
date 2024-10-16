module.exports = class LanguageController extends Model {
	constructor(registry) {
		super(registry);
		this.data = {};
	}
	async getLanguage(language_id) {
		if ((this.data[language_id])) {
			return this.data[language_id];
		}

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "language` WHERE `language_id` = '" + language_id + "'");

		let language = query.row;

		if (language.language_id) {
			language['image'] = HTTP_SERVER;

			if (!language['extension']) {
				language['image'] += 'catalog/';
			} else {
				language['image'] += 'extension/' + language['extension'] + '/catalog/';
			}

			language['image'] += 'language/' + language['code'] + '/' + language['code'] + '.png';
		}

		this.data[language_id] = language;

		return language;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getLanguageByCode(code) {
		if ((this.data[code])) {
			return this.data[code];
		}

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "language` WHERE `code` = " + this.db.escape(code));

		let language = query.row;

		if (language.language_id) {
			language['image'] = HTTP_SERVER;

			if (!language['extension']) {
				language['image'] += 'catalog/';
			} else {
				language['image'] += 'extension/' + language['extension'] + '/catalog/';
			}

			language['image'] += 'language/' + language['code'] + '/' + language['code'] + '.png';
		}

		this.data[code] = language;

		return language;
	}

	/**
	 * @return array
	 */
	async getLanguages() {
		const sql = "SELECT * FROM `" + DB_PREFIX + "language` WHERE `status` = '1' ORDER BY `sort_order`, `name`";

		let results = await this.cache.get('language.' + md5(sql));
		if (!results) {
			const query = await this.db.query(sql);

			results = query.rows;

			await this.cache.set('language.' + md5(sql), results);
		}

		let language_data = {};
		for (let result of results) {
			let image = HTTP_SERVER;

			if (!result['extension']) {
				image += 'catalog/';
			} else {
				image += 'extension/' + result['extension'] + '/catalog/';
			}

			language_data[result['code']] = {
				'language_id': result['language_id'],
				'name': result['name'],
				'code': result['code'],
				'image': image + 'language/' + result['code'] + '/' + result['code'] + '.png',
				'locale': result['locale'],
				'extension': result['extension'],
				'sort_order': result['sort_order'],
				'status': result['status']
			};
		}

		return language_data;
	}
}
