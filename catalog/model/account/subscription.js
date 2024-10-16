<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class SubscriptionController extends Model {
	/**
	 * @param int subscription_id
	 *
	 * @return array
	 */
	async getSubscription(subscription_id): array {
		subscription_data = [];

		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "subscription` `s` WHERE `subscription_id` = '" . (int)subscription_id . "' AND `customer_id` = '" . (int)this->customer->getId() . "'");

		if (query->num_rows) {
			subscription_data = query->row;

			subscription_data['payment_method'] = (query->row['payment_method'] ? JSON.parse(query->row['payment_method'], true) : '');
			subscription_data['shipping_method'] = (query->row['shipping_method'] ? JSON.parse(query->row['shipping_method'], true) : '');
		}

		return subscription_data;
	}

	/**
	 * @param int order_id
	 * @param int order_product_id
	 *
	 * @return array
	 */
	async getSubscriptionByOrderProductId(order_id, int order_product_id): array {
		subscription_data = [];

		query = this->db->query("SELECT * FROM  `" . DB_PREFIX . "subscription` WHERE `order_id` = '" . (int)order_id . "' AND `order_product_id` = '" . (int)order_product_id . "' AND `customer_id` = '" . (int)this->customer->getId() . "'");

		if (query->num_rows) {
			subscription_data = query->row;

			subscription_data['payment_method'] = (query->row['payment_method'] ? JSON.parse(query->row['payment_method'], true) : '');
			subscription_data['shipping_method'] = (query->row['shipping_method'] ? JSON.parse(query->row['shipping_method'], true) : '');
		}

		return subscription_data;
	}

	/**
	 * @param int start
	 * @param int limit
	 *
	 * @return array
	 */
	async getSubscriptions(start = 0, int limit = 20): array {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 1;
		}

		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "subscription` WHERE `customer_id` = '" . (int)this->customer->getId() . "' AND `subscription_status_id` > '0' AND `store_id` = '" . (int)this->config->get('config_store_id') . "' ORDER BY `subscription_id` DESC LIMIT " . (int)start . "," . (int)limit);

		return query->rows;
    }

	/**
	 * @return int
	 */
	async getTotalSubscriptions(): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "subscription` WHERE `customer_id` = '" . (int)this->customer->getId() . "' AND `subscription_status_id` > '0' AND `store_id` = '" . (int)this->config->get('config_store_id') . "'");

		if (query->num_rows) {
			return (int)query->row['total'];
		} else {
			return 0;
		}
    }

	/**
	 * @param int address_id
	 *
	 * @return int
	 */
	async getTotalSubscriptionByShippingAddressId(address_id): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "subscription` WHERE `customer_id` = '" . (int)this->customer->getId() . "' AND `shipping_address_id` = '" . (int)address_id . "'");

		return (int)query->row['total'];
	}

	/**
	 * @param int address_id
	 *
	 * @return int
	 */
	async getTotalSubscriptionByPaymentAddressId(address_id): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "subscription` WHERE `customer_id` = '" . (int)this->customer->getId() . "' AND `payment_address_id` = '" . (int)address_id . "'");

		return (int)query->row['total'];
	}

	/**
	 * @param int subscription_id
	 * @param int start
	 * @param int limit
	 *
	 * @return array
	 */
	async getHistories(subscription_id, int start = 0, int limit = 10): array {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		query = this->db->query("SELECT sh.`date_added`, ss.`name` AS status, sh.`comment`, sh.`notify` FROM `" . DB_PREFIX . "subscription_history` `sh` LEFT JOIN `" . DB_PREFIX . "subscription_status` `ss` ON `sh`.`subscription_status_id` = ss.`subscription_status_id` WHERE sh.`subscription_id` = '" . (int)subscription_id . "' AND ss.`language_id` = '" . (int)this->config->get('config_language_id') . "' ORDER BY sh.`date_added` DESC LIMIT " . (int)start . "," . (int)limit);

		return query->rows;
	}

	/**
	 * @param int subscription_id
	 *
	 * @return int
	 */
	async getTotalHistories(subscription_id): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "subscription_history` WHERE `subscription_id` = '" . (int)subscription_id . "'");

		return (int)query->row['total'];
	}
}
