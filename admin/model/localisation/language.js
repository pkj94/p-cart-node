module.exports = class ModelLocalisationLanguage extends Model {
	async addLanguage(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "language SET name = '" + this.db.escape(data['name']) + "', code = '" + this.db.escape(data['code']) + "', locale = '" + this.db.escape(data['locale']) + "', sort_order = '" + data['sort_order'] + "', status = '" + data['status'] + "'");

		await this.cache.delete('catalog.language');
		await this.cache.delete('admin.language');

		const language_id = this.db.getLastId();

		// Attribute
		let query = await this.db.query("SELECT * FROM " + DB_PREFIX + "attribute_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of attribute) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_description SET attribute_id = '" + attribute['attribute_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(attribute['name']) + "'");
		}

		// Attribute Group
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "attribute_group_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of attribute_group) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_group_description SET attribute_group_id = '" + attribute_group['attribute_group_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(attribute_group['name']) + "'");
		}

		await this.cache.delete('attribute');

		// Banner
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "banner_image WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of banner_image) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "banner_image SET banner_id = '" + banner_image['banner_id'] + "', language_id = '" + language_id + "', title = '" + this.db.escape(banner_image['title']) + "', link = '" + this.db.escape(banner_image['link']) + "', image = '" + this.db.escape(banner_image['image']) + "', sort_order = '" + banner_image['sort_order'] + "'");
		}

		await this.cache.delete('banner');

		// Category
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of category) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "category_description SET category_id = '" + category['category_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(category['name']) + "', description = '" + this.db.escape(category['description']) + "', meta_title = '" + this.db.escape(category['meta_title']) + "', meta_description = '" + this.db.escape(category['meta_description']) + "', meta_keyword = '" + this.db.escape(category['meta_keyword']) + "'");
		}

		await this.cache.delete('category');

		// Customer Group
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_group_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of customer_group) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "customer_group_description SET customer_group_id = '" + customer_group['customer_group_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(customer_group['name']) + "', description = '" + this.db.escape(customer_group['description']) + "'");
		}

		// Custom Field
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of custom_field) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_description SET custom_field_id = '" + custom_field['custom_field_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(custom_field['name']) + "'");
		}

		// Custom Field Value
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_value_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of custom_field_value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_value_description SET custom_field_value_id = '" + custom_field_value['custom_field_value_id'] + "', language_id = '" + language_id + "', custom_field_id = '" + custom_field_value['custom_field_id'] + "', name = '" + this.db.escape(custom_field_value['name']) + "'");
		}

		// Download
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "download_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of download) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "download_description SET download_id = '" + download['download_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(download['name']) + "'");
		}

		// Filter
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "filter_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of filter) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "filter_description SET filter_id = '" + filter['filter_id'] + "', language_id = '" + language_id + "', filter_group_id = '" + filter['filter_group_id'] + "', name = '" + this.db.escape(filter['name']) + "'");
		}

		// Filter Group
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "filter_group_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of filter_group) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "filter_group_description SET filter_group_id = '" + filter_group['filter_group_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(filter_group['name']) + "'");
		}

		// Information
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "information_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of information) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "information_description SET information_id = '" + information['information_id'] + "', language_id = '" + language_id + "', title = '" + this.db.escape(information['title']) + "', description = '" + this.db.escape(information['description']) + "', meta_title = '" + this.db.escape(information['meta_title']) + "', meta_description = '" + this.db.escape(information['meta_description']) + "', meta_keyword = '" + this.db.escape(information['meta_keyword']) + "'");
		}

		await this.cache.delete('information');

		// Length
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "length_class_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of length) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "length_class_description SET length_class_id = '" + length['length_class_id'] + "', language_id = '" + language_id + "', title = '" + this.db.escape(length['title']) + "', unit = '" + this.db.escape(length['unit']) + "'");
		}

		await this.cache.delete('length_class');

		// Option
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of option) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "option_description SET option_id = '" + option['option_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(option['name']) + "'");
		}

		// Option Value
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_value_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of option_value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "option_value_description SET option_value_id = '" + option_value['option_value_id'] + "', language_id = '" + language_id + "', option_id = '" + option_value['option_id'] + "', name = '" + this.db.escape(option_value['name']) + "'");
		}

		// Order Status
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_status WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of order_status) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "order_status SET order_status_id = '" + order_status['order_status_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(order_status['name']) + "'");
		}

		await this.cache.delete('order_status');

		// Product
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of product) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "product_description SET product_id = '" + product['product_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(product['name']) + "', description = '" + this.db.escape(product['description']) + "', tag = '" + this.db.escape(product['tag']) + "', meta_title = '" + this.db.escape(product['meta_title']) + "', meta_description = '" + this.db.escape(product['meta_description']) + "', meta_keyword = '" + this.db.escape(product['meta_keyword']) + "'");
		}

		await this.cache.delete('product');

		// Product Attribute
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_attribute WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of product_attribute) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "product_attribute SET product_id = '" + product_attribute['product_id'] + "', attribute_id = '" + product_attribute['attribute_id'] + "', language_id = '" + language_id + "', text = '" + this.db.escape(product_attribute['text']) + "'");
		}

		// Return Action
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_action WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of return_action) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "return_action SET return_action_id = '" + return_action['return_action_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(return_action['name']) + "'");
		}

		// Return Reason
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_reason WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of return_reason) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "return_reason SET return_reason_id = '" + return_reason['return_reason_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(return_reason['name']) + "'");
		}

		// Return Status
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_status WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of return_status) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "return_status SET return_status_id = '" + return_status['return_status_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(return_status['name']) + "'");
		}

		// Stock Status
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "stock_status WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of stock_status) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "stock_status SET stock_status_id = '" + stock_status['stock_status_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(stock_status['name']) + "'");
		}

		await this.cache.delete('stock_status');

		// Voucher Theme
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "voucher_theme_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of voucher_theme) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "voucher_theme_description SET voucher_theme_id = '" + voucher_theme['voucher_theme_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(voucher_theme['name']) + "'");
		}

		await this.cache.delete('voucher_theme');

		// Weight Class
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "weight_class_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of weight_class) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "weight_class_description SET weight_class_id = '" + weight_class['weight_class_id'] + "', language_id = '" + language_id + "', title = '" + this.db.escape(weight_class['title']) + "', unit = '" + this.db.escape(weight_class['unit']) + "'");
		}

		await this.cache.delete('weight_class');

		// Profiles
		query = await this.db.query("SELECT * FROM " + DB_PREFIX + "recurring_description WHERE language_id = '" + this.config.get('config_language_id') + "'");

		for (query.rows of recurring) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "recurring_description SET recurring_id = '" + recurring['recurring_id'] + "', language_id = '" + language_id + "', name = '" + this.db.escape(recurring['name']) + "'");
		}

		return language_id;
	}

	async editLanguage(language_id, data) {
		const language_query = await this.db.query("SELECT `code` FROM " + DB_PREFIX + "language WHERE language_id = '" + language_id + "'");

		await this.db.query("UPDATE " + DB_PREFIX + "language SET name = '" + this.db.escape(data['name']) + "', code = '" + this.db.escape(data['code']) + "', locale = '" + this.db.escape(data['locale']) + "', sort_order = '" + data['sort_order'] + "', status = '" + data['status'] + "' WHERE language_id = '" + language_id + "'");

		if (language_query.row['code'] != data['code']) {
			await this.db.query("UPDATE " + DB_PREFIX + "setting SET value = '" + this.db.escape(data['code']) + "' WHERE `key` = 'config_language' AND value = '" + this.db.escape(language_query.row['code']) + "'");
			await this.db.query("UPDATE " + DB_PREFIX + "setting SET value = '" + this.db.escape(data['code']) + "' WHERE `key` = 'config_admin_language' AND value = '" + this.db.escape(language_query.row['code']) + "'");
		}

		await this.cache.delete('catalog.language');
		await this.cache.delete('admin.language');
	}

	async deleteLanguage(language_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "language WHERE language_id = '" + language_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "seo_url WHERE language_id = '" + language_id + "'");

		await this.cache.delete('catalog.language');
		await this.cache.delete('admin.language');

	}

	async getLanguage(language_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "language WHERE language_id = '" + language_id + "'");

		return query.row;
	}

	async getLanguages(data = {}) {
		if (Object.keys(data).length) {
			let sql = "SELECT * FROM " + DB_PREFIX + "language";

			let sort_data = [
				'name',
				'code',
				'sort_order'
			];

			if ((data['sort']) && sort_data.includes(data['sort'])) {
				sql += " ORDER BY " + data['sort'];
			} else {
				sql += " ORDER BY sort_order, name";
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

			const query = await this.db.query(sql);

			return query.rows;
		} else {
			let language_data = await this.cache.get('admin.language');

			if (!language_data) {
				language_data = {};

				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "language ORDER BY sort_order, name");

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

				await this.cache.set('admin.language', language_data);
			}

			return language_data;
		}
	}

	async getLanguageByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "language` WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}

	async getTotalLanguages() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "language");

		return query.row['total'];
	}
}
