<?php
namespace Opencart\Admin\Model\Cms;
/**
 * Class Country
 *
 * @package Opencart\Admin\Model\Cms
 */
class AntispamModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addAntispam(data = {}) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "antispam` SET `keyword` = '" + this.db.escape(data['keyword']) + "'");

		return this.db.getLastId();
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async editAntispam(antispam_id, data = {}) {
		await this.db.query("UPDATE `" + DB_PREFIX + "antispam` SET `keyword` = '" + this.db.escape(data['keyword']) + "' WHERE `antispam_id` = '" + antispam_id + "'");
	}

	/**
	 * @param antispam_id
	 *
	 * @return void
	 */
	async deleteAntispam(antispam_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "antispam` WHERE `antispam_id` = '" + antispam_id + "'");
	}

	/**
	 * @param antispam_id
	 *
	 * @return array
	 */
	async getAntispam(antispam_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "antispam` WHERE `antispam_id` = '" + antispam_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getAntispams(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "antispam`";

		let implode = [];

		if ((data['filter_keyword'])) {
			implode.push("`keyword` LIKE '" + this.db.escape(data['filter_keyword']) + "'";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = ['keyword'];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `keyword`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalAntispams(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "antispam`";

		let implode = [];

		if ((data['filter_keyword'])) {
			implode.push("`keyword` LIKE '" + this.db.escape(data['filter_keyword']) + "'";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
