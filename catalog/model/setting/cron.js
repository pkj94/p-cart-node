<?php
namespace Opencart\Catalog\Model\Setting;
/**
 *
 *
 * @package Opencart\Catalog\Model\Setting
 */
class CronController extends Model {
	/**
	 * @param int cron_id
	 *
	 * @return void
	 */
	async editCron(cron_id): void {
		this->db->query("UPDATE `" . DB_PREFIX . "cron` SET `date_modified` = NOW() WHERE `cron_id` = '" . (int)cron_id . "'");
	}

	/**
	 * @param int  cron_id
	 * @param bool status
	 *
	 * @return void
	 */
	async editStatus(cron_id, bool status): void {
		this->db->query("UPDATE `" . DB_PREFIX . "cron` SET `status` = '" . status . "' WHERE `cron_id` = '" . (int)cron_id . "'");
	}

	/**
	 * @param int cron_id
	 *
	 * @return array
	 */
	async getCron(cron_id): array {
		query = this->db->query("SELECT DISTINCT * FROM `" . DB_PREFIX . "cron` WHERE `cron_id` = '" . (int)cron_id . "'");

		return query->row;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getCronByCode(string code): array {
		query = this->db->query("SELECT DISTINCT * FROM `" . DB_PREFIX . "cron` WHERE `code` = '" . this->db->escape(code) . "' LIMIT 1");

		return query->row;
	}

	/**
	 * @return array
	 */
	async getCrons(): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "cron` ORDER BY `date_modified` DESC");

		return query->rows;
	}

	/**
	 * @return int
	 */
	async getTotalCrons(): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "cron`");

		return (int)query->row['total'];
	}
}