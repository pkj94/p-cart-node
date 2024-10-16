<?php
namespace Opencart\Catalog\Model\Design;
/**
 *
 *
 * @package Opencart\Catalog\Model\Design
 */
class TranslationController extends Model {
	/**
	 * @param string route
	 *
	 * @return array
	 */
	async getTranslations(string route): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "translation` WHERE `store_id` = '" . (int)this->config->get('config_store_id') . "' AND `language_id` = '" . (int)this->config->get('config_language_id') . "' AND `route` = '" . this->db->escape(route) . "'");

		return query->rows;
	}
}
