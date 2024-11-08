module.exports = class ModelCatalogInformation extends Model {
	async addInformation(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "information SET sort_order = '" + data['sort_order'] + "', bottom = '" + ((data['bottom']) ? data['bottom'] : 0) + "', status = '" + data['status'] + "'");

		information_id = this.db.getLastId();

		for (data['information_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "information_description SET information_id = '" + information_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(value['title']) + "', description = '" + this.db.escape(value['description']) + "', meta_title = '" + this.db.escape(value['meta_title']) + "', meta_description = '" + this.db.escape(value['meta_description']) + "', meta_keyword = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		if ((data['information_store'])) {
			for (data['information_store'] of store_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "information_to_store SET information_id = '" + information_id + "', store_id = '" + store_id + "'");
			}
		}

		// SEO URL
		if ((data['information_seo_url'])) {
			for (data['information_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "seo_url SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'information_id=" + information_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}
		
		if ((data['information_layout'])) {
			for (data['information_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "information_to_layout SET information_id = '" + information_id + "', store_id = '" + store_id + "', layout_id = '" + layout_id + "'");
			}
		}

		this.cache.delete('information');

		return information_id;
	}

	async editInformation(information_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "information SET sort_order = '" + data['sort_order'] + "', bottom = '" + ((data['bottom']) ? data['bottom'] : 0) + "', status = '" + data['status'] + "' WHERE information_id = '" + information_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "information_description WHERE information_id = '" + information_id + "'");

		for (data['information_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "information_description SET information_id = '" + information_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(value['title']) + "', description = '" + this.db.escape(value['description']) + "', meta_title = '" + this.db.escape(value['meta_title']) + "', meta_description = '" + this.db.escape(value['meta_description']) + "', meta_keyword = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "information_to_store WHERE information_id = '" + information_id + "'");

		if ((data['information_store'])) {
			for (data['information_store'] of store_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "information_to_store SET information_id = '" + information_id + "', store_id = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "seo_url WHERE query = 'information_id=" + information_id + "'");

		if ((data['information_seo_url'])) {
			for (data['information_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if (trim(keyword)) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'information_id=" + information_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_layout` WHERE information_id = '" + information_id + "'");

		if ((data['information_layout'])) {
			for (data['information_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "information_to_layout` SET information_id = '" + information_id + "', store_id = '" + store_id + "', layout_id = '" + layout_id + "'");
			}
		}

		this.cache.delete('information');
	}

	async deleteInformation(information_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information` WHERE information_id = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_description` WHERE information_id = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_store` WHERE information_id = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_layout` WHERE information_id = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE query = 'information_id=" + information_id + "'");

		this.cache.delete('information');
	}

	async getInformation(information_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "information WHERE information_id = '" + information_id + "'");

		return query.row;
	}

	async getInformations(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "information i LEFT JOIN " + DB_PREFIX + "information_description id ON (i.information_id = id.information_id) WHERE id.language_id = '" + this.config.get('config_language_id') + "'";

			let sort_data = [
				'id.title',
				'i.sort_order'
			);

			if ((data['sort']) && sort_data.includes(data['sort'])) {
				sql += " ORDER BY " + data['sort'];
			} else {
				sql += " ORDER BY id.title";
			}

			if ((data['order']) && (data['order'] == 'DESC')) {
				sql += " DESC";
			} else {
				sql += " ASC";
			}

			if ((data['start']) || (data['limit'])) {
				data['start'] = data['start']||0;
if (data['start'] < 0) {
					data['start'] = 0;
				}

				data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
					data['limit'] = 20;
				}

				sql += " LIMIT " + data['start'] + "," + data['limit'];
			}

			const query = await this.db.query(sql);

			return query.rows;
		} else {
			information_data = this.cache.get('information.' + this.config.get('config_language_id'));

			if (!information_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "information i LEFT JOIN " + DB_PREFIX + "information_description id ON (i.information_id = id.information_id) WHERE id.language_id = '" + this.config.get('config_language_id') + "' ORDER BY id.title");

				information_data = query.rows;

				this.cache.set('information.' + this.config.get('config_language_id'), information_data);
			}

			return information_data;
		}
	}

	async getInformationDescriptions(information_id) {
		information_description_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "information_description WHERE information_id = '" + information_id + "'");

		for (let result of query.rows ) {
			information_description_data[result['language_id']] = array(
				'title'            : result['title'],
				'description'      : result['description'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword']
			);
		}

		return information_description_data;
	}

	async getInformationStores(information_id) {
		information_store_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "information_to_store WHERE information_id = '" + information_id + "'");

		for (let result of query.rows ) {
			information_store_data[] = result['store_id'];
		}

		return information_store_data;
	}

	async getInformationSeoUrls(information_id) {
		information_seo_url_data = {};
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE query = 'information_id=" + information_id + "'");

		for (let result of query.rows ) {
			information_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return information_seo_url_data;
	}

	async getInformationLayouts(information_id) {
		information_layout_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "information_to_layout WHERE information_id = '" + information_id + "'");

		for (let result of query.rows ) {
			information_layout_data[result['store_id']] = result['layout_id'];
		}

		return information_layout_data;
	}

	async getTotalInformations() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "information");

		return query.row['total'];
	}

	async getTotalInformationsByLayoutId(layout_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "information_to_layout WHERE layout_id = '" + layout_id + "'");

		return query.row['total'];
	}
}