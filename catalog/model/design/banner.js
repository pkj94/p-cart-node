module.exports =class BannerController extends Model {
	/**
	 * @param banner_id
	 *
	 * @return array
	 */
	async getBanner(banner_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "banner` b LEFT JOIN `" + DB_PREFIX + "banner_image` bi ON (b.`banner_id` = bi.`banner_id`) WHERE b.`banner_id` = '" + banner_id + "' AND b.`status` = '1' AND bi.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY bi.`sort_order` ASC");

		return query.rows;
	}
}
