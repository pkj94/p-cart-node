module.exports = class Coupon extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getCoupon(code) {
		let status = true;
		const coupon_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon` WHERE `code` = " + this.db.escape(code) + " AND ((`date_start` = '0000-00-00' OR `date_start` < NOW()) AND (`date_end` = '0000-00-00' OR `date_end` > NOW())) AND `status` = '1'");
		let product_data = [];
		if (coupon_query.num_rows) {
			if (coupon_query.row['total'] > await this.cart.getSubTotal()) {
				status = false;
			}
			const coupon_total = await this.getTotalHistoriesByCoupon(code);

			if (coupon_query.row['uses_total'] > 0 && (coupon_total >= coupon_query.row['uses_total'])) {
				status = false;
			}

			if (coupon_query.row['logged'] && !await this.customer.getId()) {
				status = false;
			}

			if (await this.customer.getId()) {
				const customer_total = this.getTotalHistoriesByCustomerId(code, await this.customer.getId());

				if (coupon_query.row['uses_customer'] > 0 && (customer_total >= coupon_query.row['uses_customer'])) {
					status = false;
				}
			}

			// Products
			let coupon_product_data = [];

			const coupon_product_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon_product` WHERE `coupon_id` = '" + coupon_query.row['coupon_id'] + "'");

			for (let product of coupon_product_query.rows) {
				coupon_product_data.push(product['product_id']);
			}

			// Categories
			let coupon_category_data = [];

			const coupon_category_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon_category` cc LEFT JOIN `" + DB_PREFIX + "category_path` cp ON (cc.`category_id` = cp.`path_id`) WHERE cc.`coupon_id` = '" + coupon_query.row['coupon_id'] + "'");

			for (let category of coupon_category_query.rows) {
				coupon_category_data.push(category['category_id']);
			}



			if (coupon_product_data.length || coupon_category_data.length) {
				for (let product of await this.cart.getProducts()) {
					if (coupon_product_data.includes(product['product_id'])) {
						product_data.push(product['product_id']);

						continue;
					}

					for (let category_id of coupon_category_data) {
						const coupon_category_query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + product['product_id'] + "' AND `category_id` = '" + category_id + "'");

						if (coupon_category_query.row['total']) {
							product_data.push(product['product_id']);

							continue;
						}
					}
				}

				if (!product_data) {
					status = false;
				}
			}
		} else {
			status = false;
		}

		if (status) {
			return {
				'coupon_id': coupon_query.row['coupon_id'],
				'code': coupon_query.row['code'],
				'name': coupon_query.row['name'],
				'type': coupon_query.row['type'],
				'discount': coupon_query.row['discount'],
				'shipping': coupon_query.row['shipping'],
				'total': coupon_query.row['total'],
				'product': product_data,
				'date_start': coupon_query.row['date_start'],
				'date_end': coupon_query.row['date_end'],
				'uses_total': coupon_query.row['uses_total'],
				'uses_customer': coupon_query.row['uses_customer'],
				'status': coupon_query.row['status'],
				'date_added': coupon_query.row['date_added']
			};
		} else {
			return {};
		}
	}

	/**
	 * @param string coupon
	 *
	 * @return int
	 */
	async getTotalHistoriesByCoupon(coupon) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "coupon` c ON (ch.`coupon_id` = c.`coupon_id`) WHERE c.`code` = " + this.db.escape(coupon));

		return query.row['total'];
	}

	/**
	 * @param string coupon
	 * @param    customer_id
	 *
	 * @return int
	 */
	async getTotalHistoriesByCustomerId(coupon, customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "coupon` c ON (ch.`coupon_id` = c.`coupon_id`) WHERE c.`code` = " + this.db.escape(coupon) + " AND ch.`customer_id` = '" + customer_id + "'");

		return query.row['total'];
	}
}
