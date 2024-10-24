global['Opencart\Admin\Model\Extension\Opencart\Report\Returns'] = class Returns extends global['\Opencart\System\Engine\Model']  {
	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getReturns(data = {}) {
		let sql = "SELECT MIN(r.`date_added`) AS date_start, MAX(r.`date_added`) AS date_end, COUNT(r.`return_id`) AS returns FROM `" + DB_PREFIX + "return` r";

		if (data['filter_return_status_id']) {
			sql += " WHERE r.`return_status_id` = '" + data['filter_return_status_id'] + "'";
		} else {
			sql += " WHERE r.`return_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(r.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(r.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}
		let group = 'week';
		if ((data['filter_group'])) {
			group = data['filter_group'];
		}

		switch (group) {
			case 'day':
				sql += " GROUP BY YEAR(r.`date_added`), MONTH(r.`date_added`), DAY(r.`date_added`)";
				break;
			default:
			case 'week':
				sql += " GROUP BY YEAR(r.`date_added`), WEEK(r.`date_added`)";
				break;
			case 'month':
				sql += " GROUP BY YEAR(r.`date_added`), MONTH(r.`date_added`)";
				break;
			case 'year':
				sql += " GROUP BY YEAR(r.`date_added`)";
				break;
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param array data
	 *
	 * @return int
	 */
	async getTotalReturns(data = {}) {
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}
		let sql = '';
		switch (group) {
			case 'day':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`), MONTH(`date_added`), DAY(`date_added`)) AS `total` FROM `" + DB_PREFIX + "return`";
				break;
			default:
			case 'week':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`), WEEK(`date_added`)) AS `total` FROM `" + DB_PREFIX + "return`";
				break;
			case 'month':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`), MONTH(`date_added`)) AS `total` FROM `" + DB_PREFIX + "return`";
				break;
			case 'year':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`)) AS `total` FROM `" + DB_PREFIX + "return`";
				break;
		}

		if (data['filter_return_status_id']) {
			sql += " WHERE `return_status_id` = '" + data['filter_return_status_id'] + "'";
		} else {
			sql += " WHERE `return_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
