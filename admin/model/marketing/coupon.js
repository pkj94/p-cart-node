<?php
namespace Opencart\Admin\Model\Marketing;
/**
 * Class Coupon
 *
 * @package Opencart\Admin\Model\Marketing
 */
class CouponModel  extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCoupon(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon` SET `name` = '" + this.db.escape(data['name']) + "', `code` = '" + this.db.escape(data['code']) + "', `discount` = '" + data['discount'] + "', `type` = '" + this.db.escape(data['type']) + "', `total` = '" + data['total'] + "', `logged` = '" + (isset(data['logged']) ? data['logged'] : 0) + "', `shipping` = '" + (isset(data['shipping']) ? data['shipping'] : 0) + "', `date_start` = '" + this.db.escape(data['date_start']) + "', `date_end` = '" + this.db.escape(data['date_end']) + "', `uses_total` = '" + data['uses_total'] + "', `uses_customer` = '" + data['uses_customer'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_added` = NOW()");

		coupon_id = this.db.getLastId();

		if (isset(data['coupon_product'])) {
			for (data['coupon_product'] of product_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon_product` SET `coupon_id` = '" + coupon_id + "', `product_id` = '" + product_id + "'");
			}
		}

		if (isset(data['coupon_category'])) {
			for (data['coupon_category'] of category_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon_category` SET `coupon_id` = '" + coupon_id + "', `category_id` = '" + category_id + "'");
			}
		}

		return coupon_id;
	}

	/**
	 * @param   coupon_id
	 * @param data
	 *
	 * @return void
	 */
	async editCoupon(coupon_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "coupon` SET `name` = '" + this.db.escape(data['name']) + "', `code` = '" + this.db.escape(data['code']) + "', `discount` = '" + data['discount'] + "', `type` = '" + this.db.escape(data['type']) + "', `total` = '" + data['total'] + "', `logged` = '" + (isset(data['logged']) ? data['logged'] : 0) + "', `shipping` = '" + (isset(data['shipping']) ? data['shipping'] : 0) + "', `date_start` = '" + this.db.escape(data['date_start']) + "', `date_end` = '" + this.db.escape(data['date_end']) + "', `uses_total` = '" + data['uses_total'] + "', `uses_customer` = '" + data['uses_customer'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `coupon_id` = '" + coupon_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_product` WHERE `coupon_id` = '" + coupon_id + "'");

		if (isset(data['coupon_product'])) {
			for (data['coupon_product'] of product_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon_product` SET `coupon_id` = '" + coupon_id + "', `product_id` = '" + product_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_category` WHERE `coupon_id` = '" + coupon_id + "'");

		if (isset(data['coupon_category'])) {
			for (data['coupon_category'] of category_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon_category` SET `coupon_id` = '" + coupon_id + "', `category_id` = '" + category_id + "'");
			}
		}
	}

	/**
	 * @param coupon_id
	 *
	 * @return void
	 */
	async deleteCoupon(coupon_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon` WHERE `coupon_id` = '" + coupon_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_product` WHERE `coupon_id` = '" + coupon_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_category` WHERE `coupon_id` = '" + coupon_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_history` WHERE `coupon_id` = '" + coupon_id + "'");
	}

	/**
	 * @param coupon_id
	 *
	 * @return array
	 */
	async getCoupon(coupon_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "coupon` WHERE `coupon_id` = '" + coupon_id + "'");

		return query.row;
	}

	/**
	 * @param code
	 *
	 * @return array
	 */
	async getCouponByCode(code) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "coupon` WHERE `code` = '" + this.db.escape(code) + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCoupons(data = {}) {
		let sql = "SELECT `coupon_id`, `name`, `code`, `discount`, `date_start`, `date_end`, `status` FROM `" + DB_PREFIX + "coupon`";

		sort_data = [
			'name',
			'code',
			'discount',
			'date_start',
			'date_end',
			'status'
		];

		if (data['sort'] && in_array(data['sort'], sort_data)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `name`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param coupon_id
	 *
	 * @return array
	 */
	async getProducts(coupon_id) {
		coupon_product_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon_product` WHERE `coupon_id` = '" + coupon_id + "'");

		for (query.rows of result) {
			coupon_product_data[] = result['product_id'];
		}

		return coupon_product_data;
	}

	/**
	 * @param coupon_id
	 *
	 * @return array
	 */
	async getCategories(coupon_id) {
		coupon_category_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon_category` WHERE `coupon_id` = '" + coupon_id + "'");

		for (query.rows of result) {
			coupon_category_data[] = result['category_id'];
		}

		return coupon_category_data;
	}

	/**
	 * @return int
	 */
	async getTotalCoupons() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "coupon`");

		return query.row['total'];
	}

	/**
	 * @param coupon_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getHistories(coupon_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT ch.`order_id`, CONCAT(c.`firstname`, ' ', c.`lastname`) AS customer, ch.`amount`, ch.`date_added` FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "customer` c ON (ch.`customer_id` = c.`customer_id`) WHERE ch.`coupon_id` = '" + coupon_id + "' ORDER BY ch.`date_added` ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param coupon_id
	 *
	 * @return int
	 */
	async getTotalHistories(coupon_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "coupon_history` WHERE `coupon_id` = '" + coupon_id + "'");

		return query.row['total'];
	}
}
