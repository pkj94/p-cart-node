<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class WishlistController extends Model {
	/**
	 * @param int product_id
	 *
	 * @return void
	 */
	async addWishlist(product_id): void {
		this->db->query("DELETE FROM `" . DB_PREFIX . "customer_wishlist` WHERE `customer_id` = '" . (int)this->customer->getId() . "' AND `product_id` = '" . (int)product_id . "'");

		this->db->query("INSERT INTO `" . DB_PREFIX . "customer_wishlist` SET `customer_id` = '" . (int)this->customer->getId() . "', `product_id` = '" . (int)product_id . "', `date_added` = NOW()");
	}

	/**
	 * @param int product_id
	 *
	 * @return void
	 */
	async deleteWishlist(product_id): void {
		this->db->query("DELETE FROM `" . DB_PREFIX . "customer_wishlist` WHERE `customer_id` = '" . (int)this->customer->getId() . "' AND `product_id` = '" . (int)product_id . "'");
	}

	/**
	 * @return array
	 */
	async getWishlist(): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "customer_wishlist` WHERE `customer_id` = '" . (int)this->customer->getId() . "'");

		return query->rows;
	}

	/**
	 * @return int
	 */
	async getTotalWishlist(): int {
		query = this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "customer_wishlist` WHERE `customer_id` = '" . (int)this->customer->getId() . "'");

		return (int)query->row['total'];
	}
}
