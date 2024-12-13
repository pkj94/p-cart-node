module.exports = class ModelLocalisationLanguage extends Model {
	async getLanguage(language_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "language WHERE language_id = '" + language_id + "'");

		return query.row;
	}

	async getLanguages() {
		let language_data = await this.cache.get('catalog.language');

		if (!language_data) {
			language_data = {};

			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "language WHERE status = '1' ORDER BY sort_order, name");

			for (let result of query.rows) {
				language_data[result['code']] = {
					'language_id': result['language_id'],
					'name': result['name'],
					'code': result['code'],
					'locale': result['locale'],
					'image': result['image'],
					'directory': result['directory'],
					'sort_order': result['sort_order'],
					'status': result['status']
				};
			}

			await this.cache.set('catalog.language', language_data);
		}

		return language_data;
	}
}