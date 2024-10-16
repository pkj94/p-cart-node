<?php
namespace Opencart\Catalog\Model\Localisation;
/**
 *
 *
 * @package Opencart\Catalog\Model\Localisation
 */
class ZoneController extends Model {
	/**
	 * @param int zone_id
	 *
	 * @return array
	 */
	async getZone(zone_id): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "zone` WHERE `zone_id` = '" . (int)zone_id . "' AND `status` = '1'");

		return query->row;
	}

	/**
	 * @param int country_id
	 *
	 * @return array
	 */
	async getZonesByCountryId(country_id): array {
		sql = "SELECT * FROM `" . DB_PREFIX . "zone` WHERE `country_id` = '" . (int)country_id . "' AND `status` = '1' ORDER BY `name`";

		zone_data = this->cache->get('zone.' . md5(sql));

		if (!zone_data) {
			query = this->db->query(sql);

			zone_data = query->rows;

			this->cache->set('zone.' . md5(sql), zone_data);
		}

		return zone_data;
	}
}
