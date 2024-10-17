module.exports = class ProductController extends Model {
	constructor(registry) {
		super(registry);
		this.statement = {};
		this.statement['discount'] = "(SELECT `pd2`.`price` FROM `" + DB_PREFIX + "product_discount` `pd2` WHERE `pd2`.`product_id` = `p`.`product_id` AND `pd2`.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "'AND `pd2`.`quantity` = '1' AND ((`pd2`.`date_start` = '0000-00-00' OR `pd2`.`date_start` < NOW()) AND (`pd2`.`date_end` = '0000-00-00' OR `pd2`.`date_end` > NOW())) ORDER BY `pd2`.`priority` ASC, `pd2`.`price` ASC LIMIT 1) AS `discount`";
		this.statement['special'] = "(SELECT `ps`.`price` FROM `" + DB_PREFIX + "product_special` `ps` WHERE `ps`.`product_id` = `p`.`product_id` AND `ps`.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND ((`ps`.`date_start` = '0000-00-00' OR `ps`.`date_start` < NOW()) AND (`ps`.`date_end` = '0000-00-00' OR `ps`.`date_end` > NOW())) ORDER BY `ps`.`priority` ASC, `ps`.`price` ASC LIMIT 1) AS `special`";
		this.statement['reward'] = "(SELECT `pr`.`points` FROM `" + DB_PREFIX + "product_reward` `pr` WHERE `pr`.`product_id` = `p`.`product_id` AND `pr`.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "') AS `reward`";
		this.statement['review'] = "(SELECT COUNT(*) FROM `" + DB_PREFIX + "review` `r` WHERE `r`.`product_id` = `p`.`product_id` AND `r`.`status` = '1' GROUP BY `r`.`product_id`) AS `reviews`";
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getProduct(product_id) {
		const query = await this.db.query("SELECT DISTINCT *, pd.`name`, `p`.`image`, " + this.statement['discount'] + ", " + this.statement['special'] + ", " + this.statement['reward'] + ", " + this.statement['review'] + " FROM `" + DB_PREFIX + "product_to_store` `p2s` LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `p2s`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW()) LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`p`.`product_id` = `pd`.`product_id`) WHERE `p2s`.`store_id` = '" + this.config.get('config_store_id') + "' AND `p2s`.`product_id` = '" + product_id + "' AND `pd`.`language_id` = '" + this.config.get('config_language_id') + "'");

		if (query.num_rows) {
			let product_data = query.row;
			product_data['variant'] = query.row['variant'] ? JSON.parse(query.row['variant']) : {};
			product_data['override'] = query.row['override'] ? JSON.parse(query.row['override']) : {};
			product_data['price'] = (query.row['discount'] ? query.row['discount'] : query.row['price']);
			product_data['rating'] = query.row['rating'];
			product_data['reviews'] = query.row['reviews'] ? query.row['reviews'] : 0;

			return product_data;
		} else {
			return [];
		}
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getProducts(data = {}) {
		let sql = "SELECT DISTINCT *, pd.`name`, `p`.`image`, " + this.statement['discount'] + ", " + this.statement['special'] + ", " + this.statement['reward'] + ", " + this.statement['review'];

		if ((data['filter_category_id'])) {
			sql += " FROM `" + DB_PREFIX + "category_to_store` `c2s`";

			if ((data['filter_sub_category'])) {
				sql += " LEFT JOIN `" + DB_PREFIX + "category_path` `cp` ON (`cp`.`category_id` = `c2s`.`category_id` AND `c2s`.`store_id` = '" + this.config.get('config_store_id') + "') LEFT JOIN `" + DB_PREFIX + "product_to_category` `p2c` ON (`p2c`.`category_id` = `cp`.`category_id`)";
			} else {
				sql += " LEFT JOIN `" + DB_PREFIX + "product_to_category` `p2c` ON (`p2c`.`category_id` = `c2s`.`category_id` AND `c2s`.`store_id` = '" + this.config.get('config_store_id') + "')";
			}

			sql += " LEFT JOIN `" + DB_PREFIX + "product_to_store` `p2s` ON (`p2s`.`product_id` = `p2c`.`product_id` AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "')";

			if ((data['filter_filter'])) {
				sql += " LEFT JOIN `" + DB_PREFIX + "product_filter` `pf` ON (`pf`.`product_id` = `p2s`.`product_id`) LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `pf`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW())";
			} else {
				sql += " LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `p2s`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW())";
			}
		} else {
			sql += " FROM `" + DB_PREFIX + "product_to_store` `p2s` LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `p2s`.`product_id` AND `p`.`status` = '1' AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "' AND `p`.`date_available` <= NOW())";
		}

		sql += " LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`p`.`product_id` = `pd`.`product_id`) WHERE `pd`.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_category_id'])) {
			if ((data['filter_sub_category'])) {
				sql += " AND `cp`.`path_id` = '" + data['filter_category_id'] + "'";
			} else {
				sql += " AND `p2c`.`category_id` = '" + data['filter_category_id'] + "'";
			}

			if ((data['filter_filter'])) {
				let implode = [];

				let filters = data['filter_filter'].split(',');

				for (let filter_id of filters) {
					implode.push(filter_id);
				}

				sql += " AND `pf`.`filter_id` IN (" + implode.join(',') + ")";
			}
		}

		if ((data['filter_search']) || (data['filter_tag'])) {
			sql += " AND (";

			if ((data['filter_search'])) {
				let implode = [];

				let words = data['filter_search'].trim().replace(/\s+/g, ' ').split(' ');

				for (let word of words) {
					implode.push("`pd`.`name` LIKE " + this.db.escape('%' + word + '%'));
				}

				if (implode) {
					sql += " (" + implode.join(" OR ") + ")";
				}

				if ((data['filter_description'])) {
					sql += " OR `pd`.`description` LIKE " + this.db.escape('%' + data['filter_search'] + '%');
				}
			}

			if ((data['filter_search']) && (data['filter_tag'])) {
				sql += " OR ";
			}

			if ((data['filter_tag'])) {
				let implode = [];

				let words = data['filter_tag'].trim().replace(/\s+/g, ' ').split(' ');

				for (let word of words) {
					implode.push("`pd`.`tag` LIKE " + this.db.escape('%' + word + '%'));
				}

				if (implode) {
					sql += " (" + implode.join(" OR ") + ")";
				}
			}

			if ((data['filter_search'])) {
				sql += " OR LCASE(`p`.`model`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`sku`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`upc`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`ean`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`jan`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`isbn`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`mpn`) = " + this.db.escape(oc_strtolower(data['filter_search']));
			}

			sql += ")";
		}

		if ((data['filter_manufacturer_id'])) {
			sql += " AND `p`.`manufacturer_id` = '" + data['filter_manufacturer_id'] + "'";
		}

		let sort_data = [
			'pd.name',
			'p.model',
			'p.quantity',
			'p.price',
			'rating',
			'p.sort_order',
			'p.date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			if (data['sort'] == 'pd.name' || data['sort'] == 'p.model') {
				sql += " ORDER BY LCASE(" + data['sort'] + ")";
			} else if (data['sort'] == 'p.price') {
				sql += " ORDER BY (CASE WHEN `special` IS NOT NULL THEN `special` WHEN `discount` IS NOT NULL THEN `discount` ELSE p.`price` END)";
			} else {
				sql += " ORDER BY " + data['sort'];
			}
		} else {
			sql += " ORDER BY p.`sort_order`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC, LCASE(`pd`.`name`) DESC";
		} else {
			sql += " ASC, LCASE(`pd`.`name`) ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}
			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let product_data = await this.cache.get('product.' + md5(sql));

		if (!product_data) {
			const query = await this.db.query(sql);

			product_data = query.rows;

			await this.cache.set('product.' + md5(sql), product_data);
		}

		return product_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getCategories(product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + product_id + "'");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getAttributes(product_id) {
		let product_attribute_group_data = [];

		const product_attribute_group_query = await this.db.query("SELECT ag.`attribute_group_id`, agd.`name` FROM `" + DB_PREFIX + "product_attribute` pa LEFT JOIN `" + DB_PREFIX + "attribute` a ON (pa.`attribute_id` = a.`attribute_id`) LEFT JOIN `" + DB_PREFIX + "attribute_group` ag ON (a.`attribute_group_id` = ag.`attribute_group_id`) LEFT JOIN `" + DB_PREFIX + "attribute_group_description` agd ON (ag.`attribute_group_id` = agd.`attribute_group_id`) WHERE pa.`product_id` = '" + product_id + "' AND agd.`language_id` = '" + this.config.get('config_language_id') + "' GROUP BY ag.`attribute_group_id` ORDER BY ag.`sort_order`, agd.`name`");

		for (let product_attribute_group of product_attribute_group_query.rows) {
			let product_attribute_data = [];

			const product_attribute_query = await this.db.query("SELECT a.`attribute_id`, ad.`name`, pa.`text` FROM `" + DB_PREFIX + "product_attribute` pa LEFT JOIN `" + DB_PREFIX + "attribute` a ON (pa.`attribute_id` = a.`attribute_id`) LEFT JOIN `" + DB_PREFIX + "attribute_description` ad ON (a.`attribute_id` = ad.`attribute_id`) WHERE pa.`product_id` = '" + product_id + "' AND a.`attribute_group_id` = '" + product_attribute_group['attribute_group_id'] + "' AND ad.`language_id` = '" + this.config.get('config_language_id') + "' AND pa.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY a.`sort_order`, ad.`name`");

			for (let product_attribute of product_attribute_query.rows) {
				product_attribute_data.push({
					'attribute_id': product_attribute['attribute_id'],
					'name': product_attribute['name'],
					'text': product_attribute['text']
				});
			}

			product_attribute_group_data.push({
				'attribute_group_id': product_attribute_group['attribute_group_id'],
				'name': product_attribute_group['name'],
				'attribute': product_attribute_data
			});
		}

		return product_attribute_group_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getOptions(product_id) {
		let product_option_data = [];

		const product_option_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_option` `po` LEFT JOIN `" + DB_PREFIX + "option` o ON (po.`option_id` = o.`option_id`) LEFT JOIN `" + DB_PREFIX + "option_description` od ON (o.`option_id` = od.`option_id`) WHERE po.`product_id` = '" + product_id + "' AND od.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY o.`sort_order`");

		for (let product_option of product_option_query.rows) {
			let product_option_value_data = [];

			const product_option_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_option_value` pov LEFT JOIN `" + DB_PREFIX + "option_value` ov ON (pov.`option_value_id` = ov.`option_value_id`) LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (ov.`option_value_id` = ovd.`option_value_id`) WHERE pov.`product_id` = '" + product_id + "' AND pov.`product_option_id` = '" + product_option['product_option_id'] + "' AND ovd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY ov.`sort_order`");

			for (let product_option_value of product_option_value_query.rows) {
				product_option_value_data.push({
					'product_option_value_id': product_option_value['product_option_value_id'],
					'option_value_id': product_option_value['option_value_id'],
					'name': product_option_value['name'],
					'image': product_option_value['image'],
					'quantity': product_option_value['quantity'],
					'subtract': product_option_value['subtract'],
					'price': product_option_value['price'],
					'price_prefix': product_option_value['price_prefix'],
					'weight': product_option_value['weight'],
					'weight_prefix': product_option_value['weight_prefix']
				});
			}

			product_option_data.push({
				'product_option_id': product_option['product_option_id'],
				'product_option_value': product_option_value_data,
				'option_id': product_option['option_id'],
				'name': product_option['name'],
				'type': product_option['type'],
				'value': product_option['value'],
				'required': product_option['required']
			});
		}

		return product_option_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getDiscounts(product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_discount` WHERE `product_id` = '" + product_id + "' AND `customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND `quantity` > 1 AND ((`date_start` = '0000-00-00' OR `date_start` < NOW()) AND (`date_end` = '0000-00-00' OR `date_end` > NOW())) ORDER BY `quantity` ASC, `priority` ASC, `price` ASC");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getImages(product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_image` WHERE `product_id` = '" + product_id + "' ORDER BY `sort_order` ASC");

		return query.rows;
	}

	/**
	 * @param product_id
	 * @param subscription_plan_id
	 *
	 * @return array
	 */
	async getSubscription(product_id, subscription_plan_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_subscription` ps LEFT JOIN `" + DB_PREFIX + "subscription_plan` sp ON (ps.`subscription_plan_id` = sp.`subscription_plan_id`) WHERE ps.`product_id` = '" + product_id + "' AND ps.`subscription_plan_id` = '" + subscription_plan_id + "' AND ps.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND sp.`status` = '1'");

		return query.row;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getSubscriptions(product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_subscription` ps LEFT JOIN `" + DB_PREFIX + "subscription_plan` sp ON (ps.`subscription_plan_id` = sp.`subscription_plan_id`) LEFT JOIN `" + DB_PREFIX + "subscription_plan_description` spd ON (sp.`subscription_plan_id` = spd.`subscription_plan_id`) WHERE ps.`product_id` = '" + product_id + "' AND ps.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND spd.`language_id` = '" + this.config.get('config_language_id') + "' AND sp.`status` = '1' ORDER BY sp.`sort_order` ASC");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return int
	 */
	async getLayoutId(product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_layout` WHERE `product_id` = '" + product_id + "' AND `store_id` = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getRelated(product_id) {
		const sql = "SELECT DISTINCT *, `pd`.`name` AS name, `p`.`image`, " + this.statement['discount'] + ", " + this.statement['special'] + ", " + this.statement['reward'] + ", " + this.statement['review'] + " FROM `" + DB_PREFIX + "product_related` `pr` LEFT JOIN `" + DB_PREFIX + "product_to_store` `p2s` ON (`p2s`.`product_id` = `pr`.`product_id` AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "') LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `pr`.`related_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW()) LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`p`.`product_id` = `pd`.`product_id`) WHERE `pr`.`product_id` = '" + product_id + "' AND `pd`.`language_id` = '" + this.config.get('config_language_id') + "'";

		let product_data = await this.cache.get('product.' + md5(sql));

		if (!product_data) {
			const query = await this.db.query(sql);

			product_data = query.rows;

			await this.cache.set('product.' + md5(sql), product_data);
		}


		return product_data;
	}

	/**
	 * @param array data
	 *
	 * @return int
	 */
	async getTotalProducts(data = {}) {
		let sql = "SELECT COUNT(DISTINCT `p`.`product_id`) AS total";

		if ((data['filter_category_id'])) {
			sql += " FROM `" + DB_PREFIX + "category_to_store` `c2s`";

			if ((data['filter_sub_category'])) {
				sql += " LEFT JOIN `" + DB_PREFIX + "category_path` `cp` ON (`cp`.`category_id` = `c2s`.`category_id` AND `c2s`.`store_id` = '" + this.config.get('config_store_id') + "') LEFT JOIN `" + DB_PREFIX + "product_to_category` `p2c` ON (`p2c`.`category_id` = `cp`.`category_id`)";
			} else {
				sql += " LEFT JOIN `" + DB_PREFIX + "product_to_category` `p2c` ON (`p2c`.`category_id` = `c2s`.`category_id`)";
			}

			sql += " LEFT JOIN `" + DB_PREFIX + "product_to_store` `p2s` ON (`p2s`.`product_id` = `p2c`.`product_id`)";

			if ((data['filter_filter'])) {
				sql += " LEFT JOIN `" + DB_PREFIX + "product_filter` `pf` ON (`pf`.`product_id` = `p2s`.`product_id`) LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `pf`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW())";
			} else {
				sql += " LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `p2s`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW() AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "')";
			}
		} else {
			sql += " FROM `" + DB_PREFIX + "product` `p`";
		}

		sql += " LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`p`.`product_id` = `pd`.`product_id`) WHERE `pd`.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_category_id'])) {
			if ((data['filter_sub_category'])) {
				sql += " AND `cp`.`path_id` = '" + data['filter_category_id'] + "'";
			} else {
				sql += " AND `p2c`.`category_id` = '" + data['filter_category_id'] + "'";
			}

			if ((data['filter_filter'])) {
				let implode = [];

				filters = explode(',', data['filter_filter']);

				for (let filter_id of filters) {
					implode.push(filter_id);
				}

				sql += " AND `pf`.`filter_id` IN (" + implode.join(',') + ")";
			}
		}

		if ((data['filter_search']) || (data['filter_tag'])) {
			sql += " AND (";

			if ((data['filter_search'])) {
				let implode = [];

				let words = data['filter_search'].trim().replace(/\s+/g, ' ').split(' ');

				for (let word of words) {
					implode.push("`pd`.`name` LIKE " + this.db.escape('%' + word + '%'));
				}

				if (implode) {
					sql += " (" + implode.join(" OR ") + ")";
				}

				if ((data['filter_description'])) {
					sql += " OR `pd`.`description` LIKE " + this.db.escape('%' + data['filter_search'] + '%');
				}
			}

			if ((data['filter_search']) && (data['filter_tag'])) {
				sql += " OR ";
			}

			if ((data['filter_tag'])) {
				let implode = [];

				let words = data['filter_tag'].trim().replace(/\s+/g, ' ').split(' ');

				for (let word of words) {
					implode.push("`pd`.`tag` LIKE " + this.db.escape('%' + word + '%'));
				}

				if (implode) {
					sql += " (" + implode.join(" OR ") + ")";
				}
			}

			if ((data['filter_search'])) {
				sql += " OR LCASE(`p`.`model`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`sku`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`upc`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`ean`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`jan`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`isbn`) = " + this.db.escape(oc_strtolower(data['filter_search']));
				sql += " OR LCASE(`p`.`mpn`) = " + this.db.escape(oc_strtolower(data['filter_search']));
			}

			sql += ")";
		}

		if ((data['filter_manufacturer_id'])) {
			sql += " AND `p`.`manufacturer_id` = '" + data['filter_manufacturer_id'] + "'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getSpecials(data = {}) {
		const sql = "SELECT DISTINCT *, `pd`.`name`, `p`.`image`, `p`.`price`, " + this.statement['discount'] + ", " + this.statement['special'] + ", " + this.statement['reward'] + ", " + this.statement['review'] + " FROM `" + DB_PREFIX + "product_special` `ps2` LEFT JOIN `" + DB_PREFIX + "product_to_store` `p2s` ON (`ps2`.`product_id` = `p2s`.`product_id` AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "' AND `ps2`.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND ((`ps2`.`date_start` = '0000-00-00' OR `ps2`.`date_start` < NOW()) AND (`ps2`.`date_end` = '0000-00-00' OR `ps2`.`date_end` > NOW()))) LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p`.`product_id` = `p2s`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW()) LEFT JOIN `" + DB_PREFIX + "product_description` `pd` ON (`pd`.`product_id` = `p`.`product_id`) WHERE `pd`.`language_id` = '" + this.config.get('config_language_id') + "' GROUP BY `ps2`.`product_id`";

		let sort_data = [
			'pd.name',
			'p.model',
			'p.price',
			'rating',
			'p.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			if (data['sort'] == 'pd.name' || data['sort'] == 'p.model') {
				sql += " ORDER BY LCASE(" + data['sort'] + ")";
			} else if (data['sort'] == 'p.price') {
				sql += " ORDER BY (CASE WHEN `special` IS NOT NULL THEN `special` WHEN `discount` IS NOT NULL THEN `discount` ELSE p.`price` END)";
			} else {
				sql += " ORDER BY " + data['sort'];
			}
		} else {
			sql += " ORDER BY p.`sort_order`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC, LCASE(`pd`.`name`) DESC";
		} else {
			sql += " ASC, LCASE(`pd`.`name`) ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}
			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let product_data = await this.cache.get('product.' + md5(sql));

		if (!product_data) {
			const query = await this.db.query(sql);

			product_data = query.rows;

			await this.cache.set('product.' + md5(sql), product_data);
		}

		return product_data;
	}

	/**
	 * @return int
	 */
	async getTotalSpecials() {
		const query = await this.db.query("SELECT COUNT(DISTINCT `ps`.`product_id`) AS `total` FROM `" + DB_PREFIX + "product_special` `ps` LEFT JOIN `" + DB_PREFIX + "product_to_store` `p2s` ON (`p2s`.`product_id` = `ps`.`product_id` AND `p2s`.`store_id` = '" + this.config.get('config_store_id') + "' AND `ps`.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND ((`ps`.`date_start` = '0000-00-00' OR `ps`.`date_start` < NOW()) AND (`ps`.`date_end` = '0000-00-00' OR `ps`.`date_end` > NOW()))) LEFT JOIN `" + DB_PREFIX + "product` `p` ON (`p2s`.`product_id` = `p`.`product_id` AND `p`.`status` = '1' AND `p`.`date_available` <= NOW())");

		if ((query.row['total'])) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param    product_id
	 * @param string ip
	 * @param string country
	 *
	 * @return void
	 */
	async addReport(product_id, ip, country = '') {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "product_report` SET `product_id` = '" + product_id + "', `store_id` = '" + this.config.get('config_store_id') + "', `ip` = '" + this.db.escape(ip) + "', `country` = '" + this.db.escape(country) + "', `date_added` = NOW()");
	}
}
