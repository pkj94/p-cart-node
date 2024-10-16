<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class TransactionController extends Model {
	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getTransactions(array data = []): array {
		sql = "SELECT * FROM `" . DB_PREFIX . "customer_transaction` WHERE `customer_id` = '" . (int)this->customer->getId() . "'";

		sort_data = [
			'amount',
			'description',
			'date_added'
		];

		if ((data['sort']) && in_array(data['sort'], sort_data)) {
			sql .= " ORDER BY `" . data['sort'] . "`";
		} else {
			sql .= " ORDER BY `date_added`";
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
	async getTotalTransactions(): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "customer_transaction` WHERE `customer_id` = '" . (int)this->customer->getId() . "'");

		return (int)query->row['total'];
	}

	/**
	 * @return int
	 */
	async getTotalAmount(): int {
		query = this->db->query("SELECT SUM(`amount`) AS `total` FROM `" . DB_PREFIX . "customer_transaction` WHERE `customer_id` = '" . (int)this->customer->getId() . "' GROUP BY `customer_id`");

		if (query->num_rows) {
			return (int)query->row['total'];
		} else {
			return 0;
		}
	}
}
