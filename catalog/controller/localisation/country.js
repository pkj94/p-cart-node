module.exports = class Country extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		let json = {};
		let country_id = 0;
		if ((this.request.get['country_id'])) {
			country_id = this.request.get['country_id'];
		}

		this.load.model('localisation/country', this);

		const country_info = await this.model_localisation_country.getCountry(country_id);

		if (country_info) {
			this.load.model('localisation/zone', this);

			json = {
				'country_id': country_info['country_id'],
				'name': country_info['name'],
				'iso_code_2': country_info['iso_code_2'],
				'iso_code_3': country_info['iso_code_3'],
				'address_format': country_info['address_format'],
				'postcode_required': country_info['postcode_required'],
				'zone': await this.model_localisation_zone.getZonesByCountryId(country_id),
				'status': country_info['status']
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}