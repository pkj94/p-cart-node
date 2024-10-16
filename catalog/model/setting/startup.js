<?php
namespace Opencart\Catalog\Model\Setting;
/**
 *
 *
 * @package Opencart\Catalog\Model\Setting
 */
class StartupController extends Model {
	/**
	 * @return mixed
	 */
	function getStartups() {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "startup` WHERE `status` = '1' ORDER BY `sort_order` ASC");

		return query->rows;
	}
}