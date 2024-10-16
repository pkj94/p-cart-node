<?php
namespace Opencart\Catalog\Controller\Localisation;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Localisation
 */
class CountryController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		const json = {};

		if ((this.request.get['country_id'])) {
			country_id = this.request.get['country_id'];
		} else {
			country_id = 0;
		}

		this.load.model('localisation/country');

		country_info = await this.model_localisation_country.getCountry(country_id);

		if (country_info) {
			this.load.model('localisation/zone');

			const json = [
				'country_id'        : country_info['country_id'],
				'name'              : country_info['name'],
				'iso_code_2'        : country_info['iso_code_2'],
				'iso_code_3'        : country_info['iso_code_3'],
				'address_format'    : country_info['address_format'],
				'postcode_required' : country_info['postcode_required'],
				'zone'              : this.model_localisation_zone.getZonesByCountryId(country_id),
				'status'            : country_info['status']
			];
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}