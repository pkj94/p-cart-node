<?php
namespace Opencart\Catalog\Model\Design;
/**
 *
 *
 * @package Opencart\Catalog\Model\Design
 */
class ThemeController extends Model {
	/**
	 * @param string route
	 *
	 * @return array
	 */
	async getTheme(string route): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "theme` WHERE `store_id` = '" . (int)this->config->get('config_store_id') . "' AND `route` = '" . this->db->escape(route) . "'");

		return query->row;
	}
}