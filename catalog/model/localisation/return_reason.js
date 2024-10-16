<?php
namespace Opencart\Catalog\Model\Localisation;
/**
 *
 *
 * @package Opencart\Catalog\Model\Localisation
 */
class ReturnReasonController extends Model {
	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getReturnReasons(array data = []): array {
		sql = "SELECT * FROM `" . DB_PREFIX . "return_reason` WHERE `language_id` = '" . (int)this->config->get('config_language_id') . "' ORDER BY `name`";

		if ((data['return']) && (data['return'] == 'DESC')) {
			sql .= " DESC";
		} else {
			sql .= " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql .= " LIMIT " . (int)data['start'] . "," . (int)data['limit'];
		}

		return_reason_data = this->cache->get('return_reason.' . md5(sql));

		if (!return_reason_data) {
			query = this->db->query(sql);

			return_reason_data = query->rows;

			this->cache->set('return_reason.' . md5(sql), return_reason_data);
		}

		return return_reason_data;
	}
}
