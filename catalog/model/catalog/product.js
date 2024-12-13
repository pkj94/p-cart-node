module.exports = class ModelCatalogProduct extends Model {
	async updateViewed(product_id) {
		await this.db.query("UPDATE " + DB_PREFIX + "product SET viewed = (viewed + 1) WHERE product_id = '" + product_id + "'");
	}

	async getProduct(product_id) {
		const query = await this.db.query("SELECT DISTINCT *, pd.name AS name, p.image, m.name AS manufacturer, (SELECT price FROM " + DB_PREFIX + "product_discount pd2 WHERE pd2.product_id = p.product_id AND pd2.customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND pd2.quantity = '1' AND ((pd2.date_start = '0000-00-00' OR pd2.date_start < NOW()) AND (pd2.date_end = '0000-00-00' OR pd2.date_end > NOW())) ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS discount, (SELECT price FROM " + DB_PREFIX + "product_special ps WHERE ps.product_id = p.product_id AND ps.customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND ((ps.date_start = '0000-00-00' OR ps.date_start < NOW()) AND (ps.date_end = '0000-00-00' OR ps.date_end > NOW())) ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS special, (SELECT points FROM " + DB_PREFIX + "product_reward pr WHERE pr.product_id = p.product_id AND pr.customer_group_id = '" + this.config.get('config_customer_group_id') + "') AS reward, (SELECT ss.name FROM " + DB_PREFIX + "stock_status ss WHERE ss.stock_status_id = p.stock_status_id AND ss.language_id = '" + this.config.get('config_language_id') + "') AS stock_status, (SELECT wcd.unit FROM " + DB_PREFIX + "weight_class_description wcd WHERE p.weight_class_id = wcd.weight_class_id AND wcd.language_id = '" + this.config.get('config_language_id') + "') AS weight_class, (SELECT lcd.unit FROM " + DB_PREFIX + "length_class_description lcd WHERE p.length_class_id = lcd.length_class_id AND lcd.language_id = '" + this.config.get('config_language_id') + "') AS length_class, (SELECT AVG(rating) AS total FROM " + DB_PREFIX + "review r1 WHERE r1.product_id = p.product_id AND r1.status = '1' GROUP BY r1.product_id) AS rating, (SELECT COUNT(*) AS total FROM " + DB_PREFIX + "review r2 WHERE r2.product_id = p.product_id AND r2.status = '1' GROUP BY r2.product_id) AS reviews, p.sort_order FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) LEFT JOIN " + DB_PREFIX + "manufacturer m ON (p.manufacturer_id = m.manufacturer_id) WHERE p.product_id = '" + product_id + "' AND pd.language_id = '" + this.config.get('config_language_id') + "' AND p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return {
				'product_id': query.row['product_id'],
				'name': query.row['name'],
				'description': query.row['description'],
				'meta_title': query.row['meta_title'],
				'meta_description': query.row['meta_description'],
				'meta_keyword': query.row['meta_keyword'],
				'tag': query.row['tag'],
				'model': query.row['model'],
				'sku': query.row['sku'],
				'upc': query.row['upc'],
				'ean': query.row['ean'],
				'jan': query.row['jan'],
				'isbn': query.row['isbn'],
				'mpn': query.row['mpn'],
				'location': query.row['location'],
				'quantity': query.row['quantity'],
				'stock_status': query.row['stock_status'],
				'image': query.row['image'],
				'manufacturer_id': query.row['manufacturer_id'],
				'manufacturer': query.row['manufacturer'],
				'price': (query.row['discount'] ? query.row['discount'] : query.row['price']),
				'special': query.row['special'],
				'reward': query.row['reward'],
				'points': query.row['points'],
				'tax_class_id': query.row['tax_class_id'],
				'date_available': query.row['date_available'],
				'weight': query.row['weight'],
				'weight_class_id': query.row['weight_class_id'],
				'length': query.row['length'],
				'width': query.row['width'],
				'height': query.row['height'],
				'length_class_id': query.row['length_class_id'],
				'subtract': query.row['subtract'],
				'rating': Math.round((query.row['rating'] === null) ? 0 : query.row['rating']),
				'reviews': query.row['reviews'] ? query.row['reviews'] : 0,
				'minimum': query.row['minimum'],
				'sort_order': query.row['sort_order'],
				'status': query.row['status'],
				'date_added': query.row['date_added'],
				'date_modified': query.row['date_modified'],
				'viewed': query.row['viewed']
			};
		} else {
			return false;
		}
	}

	async getProducts(data = {}) {
		let sql = "SELECT p.product_id, (SELECT AVG(rating) AS total FROM " + DB_PREFIX + "review r1 WHERE r1.product_id = p.product_id AND r1.status = '1' GROUP BY r1.product_id) AS rating, (SELECT price FROM " + DB_PREFIX + "product_discount pd2 WHERE pd2.product_id = p.product_id AND pd2.customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND pd2.quantity = '1' AND ((pd2.date_start = '0000-00-00' OR pd2.date_start < NOW()) AND (pd2.date_end = '0000-00-00' OR pd2.date_end > NOW())) ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS discount, (SELECT price FROM " + DB_PREFIX + "product_special ps WHERE ps.product_id = p.product_id AND ps.customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND ((ps.date_start = '0000-00-00' OR ps.date_start < NOW()) AND (ps.date_end = '0000-00-00' OR ps.date_end > NOW())) ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS special";

		if ((data['filter_category_id'])) {
			if ((data['filter_sub_category'])) {
				sql += " FROM " + DB_PREFIX + "category_path cp LEFT JOIN " + DB_PREFIX + "product_to_category p2c ON (cp.category_id = p2c.category_id)";
			} else {
				sql += " FROM " + DB_PREFIX + "product_to_category p2c";
			}

			if ((data['filter_filter'])) {
				sql += " LEFT JOIN " + DB_PREFIX + "product_filter pf ON (p2c.product_id = pf.product_id) LEFT JOIN " + DB_PREFIX + "product p ON (pf.product_id = p.product_id)";
			} else {
				sql += " LEFT JOIN " + DB_PREFIX + "product p ON (p2c.product_id = p.product_id)";
			}
		} else {
			sql += " FROM " + DB_PREFIX + "product p";
		}

		sql += " LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "' AND p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "'";

		if ((data['filter_category_id'])) {
			if ((data['filter_sub_category'])) {
				sql += " AND cp.path_id = '" + data['filter_category_id'] + "'";
			} else {
				sql += " AND p2c.category_id = '" + data['filter_category_id'] + "'";
			}

			if ((data['filter_filter'])) {
				const implode = [];

				const filters = data['filter_filter'].split(',');

				for (let filter_id of filters) {
					implode.push(filter_id);
				}

				sql += " AND pf.filter_id IN (" + implode.join(',') + ")";
			}
		}

		if ((data['filter_name']) || (data['filter_tag'])) {
			sql += " AND (";

			if ((data['filter_name'])) {
				const implode = [];

				words = explode(' ', trim(preg_replace('/\s+/', ' ', data['filter_name'])));

				for (let word of words) {
					implode.push("pd.name LIKE '%" + this.db.escape(word) + "%'");
				}

				if (implode.length) {
					sql += " " + implode.join(' AND ') + "";
				}

				if ((data['filter_description'])) {
					sql += " OR pd.description LIKE '%" + this.db.escape(data['filter_name']) + "%'";
				}
			}

			if ((data['filter_name']) && (data['filter_tag'])) {
				sql += " OR ";
			}

			if (data['filter_tag']) {
				const implode = [];

				const words = data['filter_tag'].replace(/\s+/g, ' ').trim().split(' ');

				for (let word of words) {
					implode.push("pd.tag LIKE '%" + this.db.escape(word) + "%'");
				}

				if (implode.length) {
					sql += " " + implode.join(' AND ') + "";
				}
			}

			if ((data['filter_name'])) {
				sql += " OR LCASE(p.model) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.sku) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.upc) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.ean) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.jan) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.isbn) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.mpn) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
			}

			sql += ")";
		}

		if ((data['filter_manufacturer_id'])) {
			sql += " AND p.manufacturer_id = '" + data['filter_manufacturer_id'] + "'";
		}

		sql += " GROUP BY p.product_id";

		const sort_data = [
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
				sql += " ORDER BY (CASE WHEN special IS NOT NULL THEN special WHEN discount IS NOT NULL THEN discount ELSE p.price END)";
			} else {
				sql += " ORDER BY " + data['sort'];
			}
		} else {
			sql += " ORDER BY p.sort_order";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC, LCASE(pd.name) DESC";
		} else {
			sql += " ASC, LCASE(pd.name) ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const product_data = {};

		const query = await this.db.query(sql);

		for (let result of query.rows) {
			product_data[result['product_id']] = await this.getProduct(result['product_id']);
		}

		return product_data;
	}

	async getProductSpecials(data = {}) {
		let sql = "SELECT DISTINCT ps.product_id, (SELECT AVG(rating) FROM " + DB_PREFIX + "review r1 WHERE r1.product_id = ps.product_id AND r1.status = '1' GROUP BY r1.product_id) AS rating FROM " + DB_PREFIX + "product_special ps LEFT JOIN " + DB_PREFIX + "product p ON (ps.product_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "' AND ps.customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND ((ps.date_start = '0000-00-00' OR ps.date_start < NOW()) AND (ps.date_end = '0000-00-00' OR ps.date_end > NOW())) GROUP BY ps.product_id";

		const sort_data = [
			'pd.name',
			'p.model',
			'ps.price',
			'rating',
			'p.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			if (data['sort'] == 'pd.name' || data['sort'] == 'p.model') {
				sql += " ORDER BY LCASE(" + data['sort'] + ")";
			} else {
				sql += " ORDER BY " + data['sort'];
			}
		} else {
			sql += " ORDER BY p.sort_order";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC, LCASE(pd.name) DESC";
		} else {
			sql += " ASC, LCASE(pd.name) ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const product_data = {};

		const query = await this.db.query(sql);

		for (let result of query.rows) {
			product_data[result['product_id']] = await this.getProduct(result['product_id']);
		}

		return product_data;
	}

	async getLatestProducts(limit) {
		let product_data = await this.cache.get('product.latest.' + this.config.get('config_language_id') + '.' + this.config.get('config_store_id') + '.' + this.config.get('config_customer_group_id') + '.' + limit);

		if (!product_data) {
			product_data = {};
			const query = await this.db.query("SELECT p.product_id FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "' ORDER BY p.date_added DESC LIMIT " + limit);

			for (let result of query.rows) {
				product_data[result['product_id']] = await this.getProduct(result['product_id']);
			}

			await this.cache.set('product.latest.' + this.config.get('config_language_id') + '.' + this.config.get('config_store_id') + '.' + this.config.get('config_customer_group_id') + '.' + limit, product_data);
		}

		return product_data;
	}

	async getPopularProducts(limit) {
		let product_data = await this.cache.get('product.popular.' + this.config.get('config_language_id') + '.' + this.config.get('config_store_id') + '.' + this.config.get('config_customer_group_id') + '.' + limit);

		if (!product_data) {
			product_data = {};
			const query = await this.db.query("SELECT p.product_id FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "' ORDER BY p.viewed DESC, p.date_added DESC LIMIT " + limit);

			for (let result of query.rows) {
				product_data[result['product_id']] = await this.getProduct(result['product_id']);
			}

			await this.cache.set('product.popular.' + this.config.get('config_language_id') + '.' + this.config.get('config_store_id') + '.' + this.config.get('config_customer_group_id') + '.' + limit, product_data);
		}

		return product_data;
	}

	async getBestSellerProducts(limit) {
		let product_data = await this.cache.get('product.bestseller.' + this.config.get('config_language_id') + '.' + this.config.get('config_store_id') + '.' + this.config.get('config_customer_group_id') + '.' + limit);

		if (!product_data) {
			product_data = {};

			const query = await this.db.query("SELECT op.product_id, SUM(op.quantity) AS total FROM " + DB_PREFIX + "order_product op LEFT JOIN `" + DB_PREFIX + "order` o ON (op.order_id = o.order_id) LEFT JOIN `" + DB_PREFIX + "product` p ON (op.product_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE o.order_status_id > '0' AND p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "' GROUP BY op.product_id ORDER BY total DESC LIMIT " + limit);

			for (let result of query.rows) {
				product_data[result['product_id']] = await this.getProduct(result['product_id']);
			}

			await this.cache.set('product.bestseller.' + this.config.get('config_language_id') + '.' + this.config.get('config_store_id') + '.' + this.config.get('config_customer_group_id') + '.' + limit, product_data);
		}

		return product_data;
	}

	async getProductAttributes(product_id) {
		const product_attribute_group_data = [];

		const product_attribute_group_query = await this.db.query("SELECT ag.attribute_group_id, agd.name FROM " + DB_PREFIX + "product_attribute pa LEFT JOIN " + DB_PREFIX + "attribute a ON (pa.attribute_id = a.attribute_id) LEFT JOIN " + DB_PREFIX + "attribute_group ag ON (a.attribute_group_id = ag.attribute_group_id) LEFT JOIN " + DB_PREFIX + "attribute_group_description agd ON (ag.attribute_group_id = agd.attribute_group_id) WHERE pa.product_id = '" + product_id + "' AND agd.language_id = '" + this.config.get('config_language_id') + "' GROUP BY ag.attribute_group_id ORDER BY ag.sort_order, agd.name");

		for (let product_attribute_group of product_attribute_group_query.rows) {
			const product_attribute_data = [];

			const product_attribute_query = await this.db.query("SELECT a.attribute_id, ad.name, pa.text FROM " + DB_PREFIX + "product_attribute pa LEFT JOIN " + DB_PREFIX + "attribute a ON (pa.attribute_id = a.attribute_id) LEFT JOIN " + DB_PREFIX + "attribute_description ad ON (a.attribute_id = ad.attribute_id) WHERE pa.product_id = '" + product_id + "' AND a.attribute_group_id = '" + product_attribute_group['attribute_group_id'] + "' AND ad.language_id = '" + this.config.get('config_language_id') + "' AND pa.language_id = '" + this.config.get('config_language_id') + "' ORDER BY a.sort_order, ad.name");

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

	async getProductOptions(product_id) {
		const product_option_data = [];

		const product_option_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_option po LEFT JOIN `" + DB_PREFIX + "option` o ON (po.option_id = o.option_id) LEFT JOIN " + DB_PREFIX + "option_description od ON (o.option_id = od.option_id) WHERE po.product_id = '" + product_id + "' AND od.language_id = '" + this.config.get('config_language_id') + "' ORDER BY o.sort_order");

		for (let product_option of product_option_query.rows) {
			const product_option_value_data = [];

			const product_option_value_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_option_value pov LEFT JOIN " + DB_PREFIX + "option_value ov ON (pov.option_value_id = ov.option_value_id) LEFT JOIN " + DB_PREFIX + "option_value_description ovd ON (ov.option_value_id = ovd.option_value_id) WHERE pov.product_id = '" + product_id + "' AND pov.product_option_id = '" + product_option['product_option_id'] + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "' ORDER BY ov.sort_order");

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

	async getProductDiscounts(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_discount WHERE product_id = '" + product_id + "' AND customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND quantity > 1 AND ((date_start = '0000-00-00' OR date_start < NOW()) AND (date_end = '0000-00-00' OR date_end > NOW())) ORDER BY quantity ASC, priority ASC, price ASC");

		return query.rows;
	}

	async getProductImages(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_image WHERE product_id = '" + product_id + "' ORDER BY sort_order ASC");

		return query.rows;
	}

	async getProductRelated(product_id) {
		const product_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_related pr LEFT JOIN " + DB_PREFIX + "product p ON (pr.related_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE pr.product_id = '" + product_id + "' AND p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "'");

		for (let result of query.rows) {
			product_data[result['related_id']] = await this.getProduct(result['related_id']);
		}

		return product_data;
	}

	async getProductLayoutId(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_layout WHERE product_id = '" + product_id + "' AND store_id = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}

	async getCategories(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_category WHERE product_id = '" + product_id + "'");

		return query.rows;
	}

	async getTotalProducts(data = {}) {
		let sql = "SELECT COUNT(DISTINCT p.product_id) AS total";

		if ((data['filter_category_id'])) {
			if ((data['filter_sub_category'])) {
				sql += " FROM " + DB_PREFIX + "category_path cp LEFT JOIN " + DB_PREFIX + "product_to_category p2c ON (cp.category_id = p2c.category_id)";
			} else {
				sql += " FROM " + DB_PREFIX + "product_to_category p2c";
			}

			if ((data['filter_filter'])) {
				sql += " LEFT JOIN " + DB_PREFIX + "product_filter pf ON (p2c.product_id = pf.product_id) LEFT JOIN " + DB_PREFIX + "product p ON (pf.product_id = p.product_id)";
			} else {
				sql += " LEFT JOIN " + DB_PREFIX + "product p ON (p2c.product_id = p.product_id)";
			}
		} else {
			sql += " FROM " + DB_PREFIX + "product p";
		}

		sql += " LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "' AND p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "'";

		if ((data['filter_category_id'])) {
			if ((data['filter_sub_category'])) {
				sql += " AND cp.path_id = '" + data['filter_category_id'] + "'";
			} else {
				sql += " AND p2c.category_id = '" + data['filter_category_id'] + "'";
			}

			if ((data['filter_filter'])) {
				const implode = [];

				const filters = data['filter_filter'].split(',');

				for (let filter_id of filters) {
					implode.push(filter_id);
				}

				sql += " AND pf.filter_id IN (" + implode.join(',') + ")";
			}
		}

		if ((data['filter_name']) || (data['filter_tag'])) {
			sql += " AND (";

			if ((data['filter_name'])) {
				const implode = [];

				const words = data['filter_name'].replace(/\s+/g, ' ').trim().split(' ');

				for (let word of words) {
					implode.push("pd.name LIKE '%" + this.db.escape(word) + "%'");
				}

				if (implode.length) {
					sql += " " + implode.join(' AND ') + "";
				}

				if ((data['filter_description'])) {
					sql += " OR pd.description LIKE '%" + this.db.escape(data['filter_name']) + "%'";
				}
			}

			if ((data['filter_name']) && (data['filter_tag'])) {
				sql += " OR ";
			}

			if ((data['filter_tag'])) {
				const implode = [];

				const words = data['filter_tag'].replace(/\s+/g, ' ').trim().split(' ');

				for (let word of words) {
					implode.push("pd.tag LIKE '%" + this.db.escape(word) + "%'");
				}

				if (implode.length) {
					sql += " " + implode.join(' AND ') + "";
				}
			}

			if ((data['filter_name'])) {
				sql += " OR LCASE(p.model) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.sku) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.upc) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.ean) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.jan) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.isbn) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
				sql += " OR LCASE(p.mpn) = '" + this.db.escape(utf8_strtolower(data['filter_name'])) + "'";
			}

			sql += ")";
		}

		if ((data['filter_manufacturer_id'])) {
			sql += " AND p.manufacturer_id = '" + data['filter_manufacturer_id'] + "'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getProfile(product_id, recurring_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "recurring r JOIN " + DB_PREFIX + "product_recurring pr ON (pr.recurring_id = r.recurring_id AND pr.product_id = '" + product_id + "') WHERE pr.recurring_id = '" + recurring_id + "' AND status = '1' AND pr.customer_group_id = '" + this.config.get('config_customer_group_id') + "'");

		return query.row;
	}

	async getProfiles(product_id) {
		const query = await this.db.query("SELECT rd.* FROM " + DB_PREFIX + "product_recurring pr JOIN " + DB_PREFIX + "recurring_description rd ON (rd.language_id = " + this.config.get('config_language_id') + " AND rd.recurring_id = pr.recurring_id) JOIN " + DB_PREFIX + "recurring r ON r.recurring_id = rd.recurring_id WHERE pr.product_id = " + product_id + " AND status = '1' AND pr.customer_group_id = '" + this.config.get('config_customer_group_id') + "' ORDER BY sort_order ASC");

		return query.rows;
	}

	async getTotalProductSpecials() {
		const query = await this.db.query("SELECT COUNT(DISTINCT ps.product_id) AS total FROM " + DB_PREFIX + "product_special ps LEFT JOIN " + DB_PREFIX + "product p ON (ps.product_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_to_store p2s ON (p.product_id = p2s.product_id) WHERE p.status = '1' AND p.date_available <= NOW() AND p2s.store_id = '" + this.config.get('config_store_id') + "' AND ps.customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND ((ps.date_start = '0000-00-00' OR ps.date_start < NOW()) AND (ps.date_end = '0000-00-00' OR ps.date_end > NOW()))");

		if ((query.row['total'])) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	async checkProductCategory(product_id, category_ids) {

		const implode = [];

		for (let category_id of category_ids) {
			implode.push(category_id);
		}

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_category WHERE product_id = '" + product_id + "' AND category_id IN(" + implode.join(',') + ")");
		return query.row;
	}
}
