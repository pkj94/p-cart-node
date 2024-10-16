<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class GdprController extends Model {
	/**
	 * @param string $code
	 * @param string $email
	 * @param string $action
	 *
	 * @return void
	 */
	async addGdpr(string $code, string $email, string $action): void {
		$this->db->query("INSERT INTO `" . DB_PREFIX . "gdpr` SET `store_id` = '" . $this->db->escape($this->config->get('config_store_id')) . "', `language_id` = '" . $this->db->escape($this->config->get('config_language_id')) . "', `code` = '" . $this->db->escape($code) . "', `email` = '" . $this->db->escape($email) . "', `action` = '" . $this->db->escape($action) . "', `date_added` = NOW()");
	}

	/**
	 * @param int $gdpr_id
	 * @param int $status
	 *
	 * @return void
	 */
	async editStatus($gdpr_id, int $status): void {
		$this->db->query("UPDATE `" . DB_PREFIX . "gdpr` SET `status` = '" . (int)$status . "' WHERE `gdpr_id` = '" . (int)$gdpr_id . "'");
	}

	/**
	 * @param int $gdpr_id
	 *
	 * @return array
	 */
	async getGdpr($gdpr_id): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "gdpr` WHERE `gdpr_id` = '" . (int)$gdpr_id . "'");

		return $query->row;
	}

	/**
	 * @param string $code
	 *
	 * @return array
	 */
	async getGdprByCode(string $code): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "gdpr` WHERE `code` = '" . $this->db->escape($code) . "'");

		return $query->row;
	}

	/**
	 * @param string $email
	 *
	 * @return array
	 */
	async getGdprsByEmail(string $email): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "gdpr` WHERE `email` = '" . $this->db->escape($email) . "'");

		return $query->rows;
	}

	/**
	 * @return array
	 */
	async getExpires(): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "gdpr` WHERE `status` = '2' AND DATE(`date_added`) <= DATE('" . $this->db->escape(date('Y-m-d', strtotime('+' . (int)$this->config->get('config_gdpr_limit') . ' days'))) . "') ORDER BY `date_added` DESC");

		return $query->rows;
	}
}
