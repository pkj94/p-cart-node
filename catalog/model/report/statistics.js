<?php
namespace Opencart\Catalog\Model\Report;
/**
 *
 *
 * @package Opencart\Catalog\Model\Report
 */
class StatisticsController extends Model {
	/**
	 * @return array
	 */
	async getStatistics(): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "statistics`");

		return query->rows;
	}

	/**
	 * @param string code
	 *
	 * @return float
	 */
	async getValue(string code): float {
		query = this->db->query("SELECT `value` FROM `" . DB_PREFIX . "statistics` WHERE `code` = '" . this->db->escape(code) . "'");

		if (query->num_rows) {
			return query->row['value'];
		} else {
			return 0;
		}
	}

	/**
	 * @param string code
	 * @param float  value
	 *
	 * @return void
	 */
	async addValue(string code, float value): void {
		this->db->query("UPDATE `" . DB_PREFIX . "statistics` SET `value` = (`value` + '" . value . "') WHERE `code` = '" . this->db->escape(code) . "'");
	}

	/**
	 * @param string code
	 * @param float  value
	 *
	 * @return void
	 */
	async removeValue(string code, float value): void {
		this->db->query("UPDATE `" . DB_PREFIX . "statistics` SET `value` = (`value` - '" . value . "') WHERE `code` = '" . this->db->escape(code) . "'");
	}

	/**
	 * @param string code
	 * @param float  value
	 *
	 * @return void
	 */
	async editValue(string code, float value): void {
		this->db->query("UPDATE `" . DB_PREFIX . "statistics` SET `value` = '" . value . "' WHERE `code` = '" . this->db->escape(code) . "'");
	}	
}
