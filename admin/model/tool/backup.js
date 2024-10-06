<?php
namespace Opencart\Admin\Model\Tool;
/**
 * Class Backup
 *
 * @package Opencart\Admin\Model\Tool
 */
class BackupModel  extends Model {
	/**
	 * @return array
	 */
	async getTables() {
		table_data = [];

		let query = await this.db.query("SHOW TABLES FROM `" + DB_DATABASE + "`");

		for (query.rows of result) {
			if (isset(result['Tables_in_' + DB_DATABASE]) && substr(result['Tables_in_' + DB_DATABASE], 0, strlen(DB_PREFIX)) == DB_PREFIX) {
				table_data[] = result['Tables_in_' + DB_DATABASE];
			}
		}

		return table_data;
	}

	/**
	 * @param table
	 * @param    start
	 * @param    limit
	 *
	 * @return array
	 */
	async getRecords(table, start = 0, limit = 100) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT * FROM `" + table + "` LIMIT " + start + "," + limit);

		if (query.num_rows) {
			return query.rows;
		} else {
			return [];
		}
	}

	/**
	 * @param table
	 *
	 * @return int
	 */
	async getTotalRecords(table) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + table + "`");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}
}