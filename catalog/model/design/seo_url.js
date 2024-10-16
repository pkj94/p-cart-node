<?php
namespace Opencart\Catalog\Model\Design;
/**
 *
 *
 * @package Opencart\Catalog\Model\Design
 */
class SeoUrlController extends Model {
	/**
	 * @param string keyword
	 *
	 * @return array
	 */
	async getSeoUrlByKeyword(string keyword): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "seo_url` WHERE (`keyword` = '" . this->db->escape(keyword) . "' OR `keyword` LIKE '" . this->db->escape('%/' . keyword) . "') AND `store_id` = '" . (int)this->config->get('config_store_id') . "' LIMIT 1");

		return query->row;
	}

	/**
	 * @param string key
	 * @param string value
	 *
	 * @return array
	 */
	async getSeoUrlByKeyValue(string key, string value): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "seo_url` WHERE `key` = '" . this->db->escape(key) . "' AND `value` = '" . this->db->escape(value) . "' AND `store_id` = '" . (int)this->config->get('config_store_id') . "' AND `language_id` = '" . (int)this->config->get('config_language_id') . "'");

		return query->row;
	}
}
