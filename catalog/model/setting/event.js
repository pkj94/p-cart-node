<?php
namespace Opencart\Catalog\Model\Setting;
/**
 *
 *
 * @package Opencart\Catalog\Model\Setting
 */
class EventController extends Model {
	/**
	 * @return array
	 */
	async getEvents(): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "event` WHERE `status` = '1' ORDER BY `sort_order` ASC");

		return query->rows;
	}
}
