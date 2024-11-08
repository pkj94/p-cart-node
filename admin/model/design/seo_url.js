module.exports = class ModelDesignSeoUrl extends Model {
	async addSeoUrl(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET store_id = '" + data['store_id'] + "', language_id = '" + data['language_id'] + "', query = '" + this.db.escape(data['query']) + "', keyword = '" + this.db.escape(data['keyword']) + "'");
	}

	async editSeoUrl(seo_url_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "seo_url` SET store_id = '" + data['store_id'] + "', language_id = '" + data['language_id'] + "', query = '" + this.db.escape(data['query']) + "', keyword = '" + this.db.escape(data['keyword']) + "' WHERE seo_url_id = '" + seo_url_id + "'");
	}

	async deleteSeoUrl(seo_url_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE seo_url_id = '" + seo_url_id + "'");
	}
	
	async getSeoUrl(seo_url_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE seo_url_id = '" + seo_url_id + "'");

		return query.row;
	}

	async getSeoUrls(data = {}) {
		let sql = "SELECT *, (SELECT `name` FROM `" + DB_PREFIX + "store` s WHERE s.store_id = su.store_id) AS store, (SELECT `name` FROM `" + DB_PREFIX + "language` l WHERE l.language_id = su.language_id) AS language FROM `" + DB_PREFIX + "seo_url` su";

		let implode = [];

		if ((data['filter_query'])) {
			implode.push("`query` LIKE '" + this.db.escape(data['filter_query']) + "'";
		}
		
		if ((data['filter_keyword'])) {
			implode.push("`keyword` LIKE '" + this.db.escape(data['filter_keyword']) + "'";
		}
		
		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			implode.push("`store_id` = '" + data['filter_store_id'] + "'";
		}
				
		if ((data['filter_language_id']) && data['filter_language_id'] !== '') {
			implode.push("`language_id` = '" + data['filter_language_id'] + "'";
		}
		
		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}	
		
		let sort_data = [
			'query',
			'keyword',
			'language_id',
			'store_id'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY query";
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
	}

	async getTotalSeoUrls(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "seo_url`";
		
		let implode = [];

		if ((data['filter_query'])) {
			implode.push("query LIKE '" + this.db.escape(data['filter_query']) + "'";
		}
		
		if ((data['filter_keyword'])) {
			implode.push("keyword LIKE '" + this.db.escape(data['filter_keyword']) + "'";
		}
		
		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			implode.push("store_id = '" + data['filter_store_id'] + "'";
		}
				
		if ((data['filter_language_id']) && data['filter_language_id'] !== '') {
			implode.push("language_id = '" + data['filter_language_id'] + "'";
		}
		
		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}		
		
		const query = await this.db.query(sql);

		return query.row['total'];
	}
	
	async getSeoUrlsByKeyword(keyword) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE keyword = '" + this.db.escape(keyword) + "'");

		return query.rows;
	}	
	
	async getSeoUrlsByQuery(query) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE query = '" + this.db.escape(query) + "'");

		return query.rows;
	}
	
	async getSeoUrlsByQueryId(seo_url_id, query) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE query = '" + this.db.escape(query) + "' AND seo_url_id != '" + seo_url_id + "'");

		return query.rows;
	}	

	async getSeoUrlsByKeywordId(seo_url_id, keyword) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE keyword = '" + this.db.escape(keyword) + "' AND seo_url_id != '" + seo_url_id + "'");

		return query.rows;
	}	
}