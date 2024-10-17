<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class AddressController extends Model {
	/**
	 * @param   customer_id
	 * @param array data
	 *
	 * @return int
	 */
	async addAddress(customer_id, array data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "address` SET `customer_id` = '" + customer_id + "', `firstname` = '" + this.db.escape(data['firstname']) + "', `lastname` = '" + this.db.escape(data['lastname']) + "', `company` = '" + this.db.escape(data['company']) + "', `address_1` = '" + this.db.escape(data['address_1']) + "', `address_2` = '" + this.db.escape(data['address_2']) + "', `postcode` = '" + this.db.escape(data['postcode']) + "', `city` = '" + this.db.escape(data['city']) + "', `zone_id` = '" + data['zone_id'] + "', `country_id` = '" + data['country_id'] + "', `custom_field` = '" + this.db.escape((data['custom_field']) ? json_encode(data['custom_field']) : '') + "', `default` = '" + ((data['default']) ? data['default'] : 0) + "'");

		address_id = this.db.getLastId();

		if ((data['default'])) {
			await this.db.query("UPDATE `" + DB_PREFIX + "address` SET `default` = '0' WHERE `address_id` != '" + address_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");
		}

		return address_id;
	}

	/**
	 * @param   address_id
	 * @param array data
	 *
	 * @return void
	 */
	async editAddress(address_id, array data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "address` SET `firstname` = '" + this.db.escape(data['firstname']) + "', `lastname` = '" + this.db.escape(data['lastname']) + "', `company` = '" + this.db.escape(data['company']) + "', `address_1` = '" + this.db.escape(data['address_1']) + "', `address_2` = '" + this.db.escape(data['address_2']) + "', `postcode` = '" + this.db.escape(data['postcode']) + "', `city` = '" + this.db.escape(data['city']) + "', `zone_id` = '" + data['zone_id'] + "', `country_id` = '" + data['country_id'] + "', `custom_field` = '" + this.db.escape((data['custom_field']) ? json_encode(data['custom_field']) : '') + "', `default` = '" + ((data['default']) ? data['default'] : 0) + "' WHERE `address_id` = '" + address_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");

		if ((data['default'])) {
			await this.db.query("UPDATE `" + DB_PREFIX + "address` SET `default` = '0' WHERE `address_id` != '" + address_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");
		}
	}

	/**
	 * @param address_id
	 *
	 * @return void
	 */
	async deleteAddress(address_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "address` WHERE `address_id` = '" + address_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");
	}

	/**
	 * @param customer_id
	 * @param address_id
	 *
	 * @return array
	 */
	async getAddress(customer_id, address_id) {
		address_query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "address` WHERE `address_id` = '" + address_id + "' AND `customer_id` = '" + customer_id + "'");

		if (address_query.num_rows) {
			this.load.model('localisation/country');

			country_info = await this.model_localisation_country.getCountry(address_query.row['country_id']);

			if (country_info) {
				country = country_info['name'];
				iso_code_2 = country_info['iso_code_2'];
				iso_code_3 = country_info['iso_code_3'];
				address_format = country_info['address_format'];
			} else {
				country = '';
				iso_code_2 = '';
				iso_code_3 = '';
				address_format = '';
			}

			this.load.model('localisation/zone');

			zone_info = await this.model_localisation_zone.getZone(address_query.row['zone_id']);

			if (zone_info) {
				zone = zone_info['name'];
				zone_code = zone_info['code'];
			} else {
				zone = '';
				zone_code = '';
			}

			return [
				'address_id'     : address_query.row['address_id'],
				'firstname'      : address_query.row['firstname'],
				'lastname'       : address_query.row['lastname'],
				'company'        : address_query.row['company'],
				'address_1'      : address_query.row['address_1'],
				'address_2'      : address_query.row['address_2'],
				'city'           : address_query.row['city'],
				'postcode'       : address_query.row['postcode'],
				'zone_id'        : address_query.row['zone_id'],
				'zone'           : zone,
				'zone_code'      : zone_code,
				'country_id'     : address_query.row['country_id'],
				'country'        : country,
				'iso_code_2'     : iso_code_2,
				'iso_code_3'     : iso_code_3,
				'address_format' : address_format,
				'custom_field'   : JSON.parse(address_query.row['custom_field'], true),
				'default'        : address_query.row['default']
			];
		} else {
			return [];
		}
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getAddresses(customer_id) {
		address_data = [];

		const query = await this.db.query("SELECT `address_id` FROM `" + DB_PREFIX + "address` WHERE `customer_id` = '" + customer_id + "'");

		for (let result of query.rows) {
			address_info = this.getAddress(customer_id, result['address_id']);

			if (address_info) {
				address_data[result['address_id']] = address_info;
			}
		}

		return address_data;
	}

	/**
	 * @param customer_id
	 *
	 * @return int
	 */
	async getTotalAddresses(customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "address` WHERE `customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}
}
