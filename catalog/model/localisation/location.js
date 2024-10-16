<?php
namespace Opencart\Catalog\Model\Localisation;
/**
 *
 *
 * @package Opencart\Catalog\Model\Localisation
 */
class LocationController extends Model {
	/**
	 * @param int location_id
	 *
	 * @return array
	 */
	async getLocation(location_id): array {
		query = this->db->query("SELECT `location_id`, `name`, `address`, `geocode`, `telephone`, `image`, `open`, `comment` FROM `" . DB_PREFIX . "location` WHERE `location_id` = '" . (int)location_id . "'");

		return query->row;
	}
}
