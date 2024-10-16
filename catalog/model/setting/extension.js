<?php
namespace Opencart\Catalog\Model\Setting;
/**
 *
 *
 * @package Opencart\Catalog\Model\Setting
 */
class ExtensionController extends Model {
	/**
	 * @return array
	 */
	async getExtensions(): array {
		query = this->db->query("SELECT DISTINCT `extension` FROM `" . DB_PREFIX . "extension`");

		return query->rows;
	}

	/**
	 * @param string type
	 *
	 * @return array
	 */
	async getExtensionsByType(string type): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "extension` WHERE `type` = '" . this->db->escape(type) . "'");

		return query->rows;
	}

	/**
	 * @param string type
	 * @param string code
	 *
	 * @return array
	 */
	async getExtensionByCode(string type, string code): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "extension` WHERE `type` = '" . this->db->escape(type) . "' AND `code` = '" . this->db->escape(code) . "'");

		return query->row;
	}
}