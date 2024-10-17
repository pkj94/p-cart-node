module.exports = class LatestModel extends Model {
	/**
	 * @param int limit
	 *
	 * @return array
	 */
	async getLatest(limit) {
		let sql = "SELECT DISTINCT *, `pd`.`name`, `p`.`image`, " + this.statement['discount'] + ", " + this.statement['special'] + ", " + this.statement['reward'] + ", " + this.statement['review'] + " FROM `" + DB_PREFIX + "product_to_store` `p2s` LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `p2s`.`product_id` AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "' AND `p`.`status` = '1' AND `p`.`date_available` <= NOW()) LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`p`.`product_id` = `pd`.`product_id`) WHERE `pd`.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `p`.`date_added` DESC LIMIT 0," + limit;

		let product_data = await this.cache.get('product.' + md5(sql));

		if (!product_data) {
			const query = await this.db.query(sql);

			product_data = query.rows;

			await this.cache.set('product.' + md5(sql), product_data);
		}

		return product_data;
	}
}
