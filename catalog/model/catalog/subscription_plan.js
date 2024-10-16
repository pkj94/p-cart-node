<?php
namespace Opencart\Catalog\Model\Catalog;
/**
 *
 *
 * @package Opencart\Catalog\Model\Catalog
 */
class SubscriptionPlanController extends Model {
	/**
	 * @param int subscription_plan_id
	 *
	 * @return array
	 */
	async getSubscriptionPlan(subscription_plan_id): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "subscription_plan` `sp` LEFT JOIN `" . DB_PREFIX . "subscription_plan_description` `spd` ON (`sp`.`subscription_plan_id` = `spd`.`subscription_plan_id`) WHERE `sp`.`subscription_plan_id` = '" . (int)subscription_plan_id . "' AND `spd`.`language_id` = '" . (int)this->config->get('config_language_id') . "'");

		return query->row;
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getSubscriptionPlans(array data = []): array {
		sql = "SELECT * FROM `" . DB_PREFIX . "subscription_plan` `sp` LEFT JOIN `" . DB_PREFIX . "subscription_plan_description` `spd` ON (`sp`.`subscription_plan_id` = `spd`.`subscription_plan_id`) WHERE `spd`.`language_id` = '" . (int)this->config->get('config_language_id') . "'";

		if (!empty(data['filter_name'])) {
			sql .= " AND spd.`name` LIKE '" . this->db->escape((string)data['filter_name'] . '%') . "'";
		}

		sort_data = [
			'spd.name',
			'sp.sort_order'
		];

		if ((data['sort']) && in_array(data['sort'], sort_data)) {
			sql .= " ORDER BY " . data['sort'];
		} else {
			sql .= " ORDER BY `spd`.`name`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
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

		query = this->db->query(sql);

		return query->rows;
	}

	/**
	 * @return int
	 */
	async getTotalSubscriptionPlans(): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "subscription_plan`");

		return (int)query->row['total'];
	}
}
