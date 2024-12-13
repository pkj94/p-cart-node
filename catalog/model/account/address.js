module.exports = class ModelAccountAddress extends Model {
	async addAddress(customer_id, data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "address SET customer_id = '" + customer_id + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', company = '" + this.db.escape(data['company']) + "', address_1 = '" + this.db.escape(data['address_1']) + "', address_2 = '" + this.db.escape(data['address_2']) + "', postcode = '" + this.db.escape(data['postcode']) + "', city = '" + this.db.escape(data['city']) + "', zone_id = '" + data['zone_id'] + "', country_id = '" + data['country_id'] + "', custom_field = '" + this.db.escape(data['custom_field'] && (data['custom_field']['address']) ? JSON.stringify(data['custom_field']['address']) : '') + "'");

		const address_id = this.db.getLastId();

		if ((data['default'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "customer SET address_id = '" + address_id + "' WHERE customer_id = '" + customer_id + "'");
		}

		return address_id;
	}

	async editAddress(address_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "address SET firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', company = '" + this.db.escape(data['company']) + "', address_1 = '" + this.db.escape(data['address_1']) + "', address_2 = '" + this.db.escape(data['address_2']) + "', postcode = '" + this.db.escape(data['postcode']) + "', city = '" + this.db.escape(data['city']) + "', zone_id = '" + data['zone_id'] + "', country_id = '" + data['country_id'] + "', custom_field = '" + this.db.escape(data['custom_field'] && (data['custom_field']['address']) ? JSON.stringify(data['custom_field']['address']) : '') + "' WHERE address_id  = '" + address_id + "' AND customer_id = '" + await this.customer.getId() + "'");

		if ((data['default'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "customer SET address_id = '" + address_id + "' WHERE customer_id = '" + await this.customer.getId() + "'");
		}
	}

	async deleteAddress(address_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "address WHERE address_id = '" + address_id + "' AND customer_id = '" + await this.customer.getId() + "'");
		const default_query = await this.db.query("SELECT address_id FROM " + DB_PREFIX + "customer WHERE address_id = '" + address_id + "' AND customer_id = '" + await this.customer.getId() + "'");
		if (default_query.num_rows) {
			await this.db.query("UPDATE " + DB_PREFIX + "customer SET address_id = 0 WHERE customer_id = '" + await this.customer.getId() + "'");
		}
	}

	async getAddress(address_id) {
		const address_query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "address WHERE address_id = '" + address_id + "' AND customer_id = '" + await this.customer.getId() + "'");

		if (address_query.num_rows) {
			const country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + address_query.row['country_id'] + "'");
			let country = '';
			let iso_code_2 = '';
			let iso_code_3 = '';
			let address_format = '';
			if (country_query.num_rows) {
				country = country_query.row['name'];
				iso_code_2 = country_query.row['iso_code_2'];
				iso_code_3 = country_query.row['iso_code_3'];
				address_format = country_query.row['address_format'];
			}

			const zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + address_query.row['zone_id'] + "'");
			let zone = '';
			let zone_code = '';
			if (zone_query.num_rows) {
				zone = zone_query.row['name'];
				zone_code = zone_query.row['code'];
			}

			return {
				'address_id': address_query.row['address_id'],
				'firstname': address_query.row['firstname'],
				'lastname': address_query.row['lastname'],
				'company': address_query.row['company'],
				'address_1': address_query.row['address_1'],
				'address_2': address_query.row['address_2'],
				'postcode': address_query.row['postcode'],
				'city': address_query.row['city'],
				'zone_id': address_query.row['zone_id'],
				'zone': zone,
				'zone_code': zone_code,
				'country_id': address_query.row['country_id'],
				'country': country,
				'iso_code_2': iso_code_2,
				'iso_code_3': iso_code_3,
				'address_format': address_format,
				'custom_field': JSON.parse(address_query.row['custom_field'] || '{}')
			};

		} else {
			return false;
		}
	}

	async getAddresses() {
		const address_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "address WHERE customer_id = '" + await this.customer.getId() + "'");

		for (let result of query.rows) {
			const country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + result['country_id'] + "'");
			let country = '';
			let iso_code_2 = '';
			let iso_code_3 = '';
			let address_format = '';
			if (country_query.num_rows) {
				country = country_query.row['name'];
				iso_code_2 = country_query.row['iso_code_2'];
				iso_code_3 = country_query.row['iso_code_3'];
				address_format = country_query.row['address_format'];
			}

			const zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + result['zone_id'] + "'");
			let zone = '';
			let zone_code = '';
			if (zone_query.num_rows) {
				zone = zone_query.row['name'];
				zone_code = zone_query.row['code'];
			}

			address_data[result['address_id']] = {
				'address_id': result['address_id'],
				'firstname': result['firstname'],
				'lastname': result['lastname'],
				'company': result['company'],
				'address_1': result['address_1'],
				'address_2': result['address_2'],
				'postcode': result['postcode'],
				'city': result['city'],
				'zone_id': result['zone_id'],
				'zone': zone,
				'zone_code': zone_code,
				'country_id': result['country_id'],
				'country': country,
				'iso_code_2': iso_code_2,
				'iso_code_3': iso_code_3,
				'address_format': address_format,
				'custom_field': JSON.parse(result['custom_field'] || '{}')
			};
		}

		return address_data;
	}

	async getTotalAddresses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "address WHERE customer_id = '" + await this.customer.getId() + "'");

		return query.row['total'];
	}
}
