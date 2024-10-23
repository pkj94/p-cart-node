global['\Opencart\Catalog\Model\Extension\Opencart\Module\Bestseller'] = class Bestseller extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param int limit
	 *
	 * @return array
	 */
	async getBestSellers(limit) {
		// Storing some sub queries so that we are not typing them out multiple times.
		let sql = "SELECT *, `pd`.`name`, `p`.`image`, `pb`.`total`, " + this.statement['discount'] + ", " + this.statement['special'] + ", " + this.statement['reward'] + ", " + this.statement['review'] + " FROM `" + DB_PREFIX + "product_bestseller` `pb` LEFT JOIN `" + DB_PREFIX + "product_to_store` `p2s` ON (`p2s`.`product_id` = `pb`.`product_id` AND p2s.`store_id` = '" + this.config.get('config_store_id') + "') LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `pb`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW()) LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`pd`.`product_id` = `p`.`product_id`) WHERE `pd`.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `pb`.`total` DESC LIMIT 0," + limit;

		let product_data = await this.cache.get('product.' + md5(sql));

		if (!product_data) {
			const query = await this.db.query(sql);

			product_data = query.rows;

			await this.cache.set('product.' + md5(sql), product_data);
		}

		return product_data;
	}
}
