module.exports = class ModelLocalisationCountry extends Model {
	async getCountry(country_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE country_id = '" + country_id + "' AND status = '1'");

		return query.row;
	}

	async getCountries() {
		let country_data = await this.cache.get('country.catalog');

		if (!country_data) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE status = '1' ORDER BY name ASC");

			country_data = query.rows;

			await this.cache.set('country.catalog', country_data);
		}

		return country_data;
	}
}