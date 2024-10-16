<?php
namespace Opencart\Catalog\Model\Setting;
/**
 *
 *
 * @package Opencart\Catalog\Model\Setting
 */
class ModuleController extends Model {
	/**
	 * @param int module_id
	 *
	 * @return array
	 */
	async getModule(module_id): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "module` WHERE `module_id` = '" . (int)module_id . "'");
		
		if (query->row) {
			return JSON.parse(query->row['setting'], true);
		} else {
			return [];
		}
	}		
}
