module.exports = class ModelCatalogProduct extends Model {
	async addProduct(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "product SET model = '" + this.db.escape(data['model']) + "', sku = '" + this.db.escape(data['sku']) + "', upc = '" + this.db.escape(data['upc']) + "', ean = '" + this.db.escape(data['ean']) + "', jan = '" + this.db.escape(data['jan']) + "', isbn = '" + this.db.escape(data['isbn']) + "', mpn = '" + this.db.escape(data['mpn']) + "', location = '" + this.db.escape(data['location']) + "', quantity = '" + data['quantity'] + "', minimum = '" + data['minimum'] + "', subtract = '" + data['subtract'] + "', stock_status_id = '" + data['stock_status_id'] + "', date_available = '" + this.db.escape(data['date_available']) + "', manufacturer_id = '" + data['manufacturer_id'] + "', shipping = '" + data['shipping'] + "', price = '" + data['price'] + "', points = '" + data['points'] + "', weight = '" + data['weight'] + "', weight_class_id = '" + data['weight_class_id'] + "', length = '" + data['length'] + "', width = '" + data['width'] + "', height = '" + data['height'] + "', length_class_id = '" + data['length_class_id'] + "', status = '" + data['status'] + "', tax_class_id = '" + data['tax_class_id'] + "', sort_order = '" + data['sort_order'] + "', date_added = NOW(), date_modified = NOW()");

		product_id = this.db.getLastId();

		if ((data['image'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "product SET image = '" + this.db.escape(data['image']) + "' WHERE product_id = '" + product_id + "'");
		}

		for (data['product_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "product_description SET product_id = '" + product_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "', description = '" + this.db.escape(value['description']) + "', tag = '" + this.db.escape(value['tag']) + "', meta_title = '" + this.db.escape(value['meta_title']) + "', meta_description = '" + this.db.escape(value['meta_description']) + "', meta_keyword = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		if ((data['product_store'])) {
			for (data['product_store'] of store_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_store SET product_id = '" + product_id + "', store_id = '" + store_id + "'");
			}
		}

		if ((data['product_attribute'])) {
			for (data['product_attribute'] of product_attribute) {
				if (product_attribute['attribute_id']) {
					// Removes duplicates
					await this.db.query("DELETE FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "' AND attribute_id = '" + product_attribute['attribute_id'] + "'");

					for (product_attribute['product_attribute_description'] of language_id : product_attribute_description) {
						await this.db.query("DELETE FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "' AND attribute_id = '" + product_attribute['attribute_id'] + "' AND language_id = '" + language_id + "'");

						await this.db.query("INSERT INTO " + DB_PREFIX + "product_attribute SET product_id = '" + product_id + "', attribute_id = '" + product_attribute['attribute_id'] + "', language_id = '" + language_id + "', text = '" +  this.db.escape(product_attribute_description['text']) + "'");
					}
				}
			}
		}

		if ((data['product_option'])) {
			for (data['product_option'] of product_option) {
				if (product_option['type'] == 'select' || product_option['type'] == 'radio' || product_option['type'] == 'checkbox' || product_option['type'] == 'image') {
					if ((product_option['product_option_value'])) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "product_option SET product_id = '" + product_id + "', option_id = '" + product_option['option_id'] + "', required = '" + product_option['required'] + "'");

						product_option_id = this.db.getLastId();

						for (product_option['product_option_value'] of product_option_value) {
							await this.db.query("INSERT INTO " + DB_PREFIX + "product_option_value SET product_option_id = '" + product_option_id + "', product_id = '" + product_id + "', option_id = '" + product_option['option_id'] + "', option_value_id = '" + product_option_value['option_value_id'] + "', quantity = '" + product_option_value['quantity'] + "', subtract = '" + product_option_value['subtract'] + "', price = '" + product_option_value['price'] + "', price_prefix = '" + this.db.escape(product_option_value['price_prefix']) + "', points = '" + product_option_value['points'] + "', points_prefix = '" + this.db.escape(product_option_value['points_prefix']) + "', weight = '" + product_option_value['weight'] + "', weight_prefix = '" + this.db.escape(product_option_value['weight_prefix']) + "'");
						}
					}
				} else {
					await this.db.query("INSERT INTO " + DB_PREFIX + "product_option SET product_id = '" + product_id + "', option_id = '" + product_option['option_id'] + "', value = '" + this.db.escape(product_option['value']) + "', required = '" + product_option['required'] + "'");
				}
			}
		}

		if ((data['product_recurring'])) {
			for (data['product_recurring'] of recurring) {

				const query = await this.db.query("SELECT `product_id` FROM `" + DB_PREFIX + "product_recurring` WHERE `product_id` = '" + product_id + "' AND `customer_group_id = '" + recurring['customer_group_id'] + "' AND `recurring_id` = '" + recurring['recurring_id'] + "'");

				if (!query.num_rows) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_recurring` SET `product_id` = '" + product_id + "', customer_group_id = '" + recurring['customer_group_id'] + "', `recurring_id` = '" + recurring['recurring_id'] + "'");
				}
			}
		}
		
		if ((data['product_discount'])) {
			for (data['product_discount'] of product_discount) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_discount SET product_id = '" + product_id + "', customer_group_id = '" + product_discount['customer_group_id'] + "', quantity = '" + product_discount['quantity'] + "', priority = '" + product_discount['priority'] + "', price = '" + product_discount['price'] + "', date_start = '" + this.db.escape(product_discount['date_start']) + "', date_end = '" + this.db.escape(product_discount['date_end']) + "'");
			}
		}

		if ((data['product_special'])) {
			for (data['product_special'] of product_special) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_special SET product_id = '" + product_id + "', customer_group_id = '" + product_special['customer_group_id'] + "', priority = '" + product_special['priority'] + "', price = '" + product_special['price'] + "', date_start = '" + this.db.escape(product_special['date_start']) + "', date_end = '" + this.db.escape(product_special['date_end']) + "'");
			}
		}

		if ((data['product_image'])) {
			for (data['product_image'] of product_image) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_image SET product_id = '" + product_id + "', image = '" + this.db.escape(product_image['image']) + "', sort_order = '" + product_image['sort_order'] + "'");
			}
		}

		if ((data['product_download'])) {
			for (data['product_download'] of download_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_download SET product_id = '" + product_id + "', download_id = '" + download_id + "'");
			}
		}

		if ((data['product_category'])) {
			for (data['product_category'] of category_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_category SET product_id = '" + product_id + "', category_id = '" + category_id + "'");
			}
		}

		if ((data['product_filter'])) {
			for (data['product_filter'] of filter_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_filter SET product_id = '" + product_id + "', filter_id = '" + filter_id + "'");
			}
		}

		if ((data['product_related'])) {
			for (data['product_related'] of related_id) {
				await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE product_id = '" + product_id + "' AND related_id = '" + related_id + "'");
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_related SET product_id = '" + product_id + "', related_id = '" + related_id + "'");
				await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE product_id = '" + related_id + "' AND related_id = '" + product_id + "'");
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_related SET product_id = '" + related_id + "', related_id = '" + product_id + "'");
			}
		}

		if ((data['product_reward'])) {
			for (data['product_reward'] of customer_group_id : product_reward) {
				if (product_reward['points'] > 0) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "product_reward SET product_id = '" + product_id + "', customer_group_id = '" + customer_group_id + "', points = '" + product_reward['points'] + "'");
				}
			}
		}
		
		// SEO URL
		if ((data['product_seo_url'])) {
			for (data['product_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "seo_url SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'product_id=" + product_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}
		
		if ((data['product_layout'])) {
			for (data['product_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_layout SET product_id = '" + product_id + "', store_id = '" + store_id + "', layout_id = '" + layout_id + "'");
			}
		}


		this.cache.delete('product');

		return product_id;
	}

	async editProduct(product_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "product SET model = '" + this.db.escape(data['model']) + "', sku = '" + this.db.escape(data['sku']) + "', upc = '" + this.db.escape(data['upc']) + "', ean = '" + this.db.escape(data['ean']) + "', jan = '" + this.db.escape(data['jan']) + "', isbn = '" + this.db.escape(data['isbn']) + "', mpn = '" + this.db.escape(data['mpn']) + "', location = '" + this.db.escape(data['location']) + "', quantity = '" + data['quantity'] + "', minimum = '" + data['minimum'] + "', subtract = '" + data['subtract'] + "', stock_status_id = '" + data['stock_status_id'] + "', date_available = '" + this.db.escape(data['date_available']) + "', manufacturer_id = '" + data['manufacturer_id'] + "', shipping = '" + data['shipping'] + "', price = '" + data['price'] + "', points = '" + data['points'] + "', weight = '" + data['weight'] + "', weight_class_id = '" + data['weight_class_id'] + "', length = '" + data['length'] + "', width = '" + data['width'] + "', height = '" + data['height'] + "', length_class_id = '" + data['length_class_id'] + "', status = '" + data['status'] + "', tax_class_id = '" + data['tax_class_id'] + "', sort_order = '" + data['sort_order'] + "', date_modified = NOW() WHERE product_id = '" + product_id + "'");

		if ((data['image'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "product SET image = '" + this.db.escape(data['image']) + "' WHERE product_id = '" + product_id + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_description WHERE product_id = '" + product_id + "'");

		for (data['product_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "product_description SET product_id = '" + product_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "', description = '" + this.db.escape(value['description']) + "', tag = '" + this.db.escape(value['tag']) + "', meta_title = '" + this.db.escape(value['meta_title']) + "', meta_description = '" + this.db.escape(value['meta_description']) + "', meta_keyword = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_store WHERE product_id = '" + product_id + "'");

		if ((data['product_store'])) {
			for (data['product_store'] of store_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_store SET product_id = '" + product_id + "', store_id = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "'");

		if ((data['product_attribute'])) {
			for (data['product_attribute'] of product_attribute) {
				if (product_attribute['attribute_id']) {
					// Removes duplicates
					await this.db.query("DELETE FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "' AND attribute_id = '" + product_attribute['attribute_id'] + "'");

					for (product_attribute['product_attribute_description'] of language_id : product_attribute_description) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "product_attribute SET product_id = '" + product_id + "', attribute_id = '" + product_attribute['attribute_id'] + "', language_id = '" + language_id + "', text = '" +  this.db.escape(product_attribute_description['text']) + "'");
					}
				}
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_option WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_option_value WHERE product_id = '" + product_id + "'");

		if ((data['product_option'])) {
			for (data['product_option'] of product_option) {
				if (product_option['type'] == 'select' || product_option['type'] == 'radio' || product_option['type'] == 'checkbox' || product_option['type'] == 'image') {
					if ((product_option['product_option_value'])) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "product_option SET product_option_id = '" + product_option['product_option_id'] + "', product_id = '" + product_id + "', option_id = '" + product_option['option_id'] + "', required = '" + product_option['required'] + "'");

						product_option_id = this.db.getLastId();

						for (product_option['product_option_value'] of product_option_value) {
							await this.db.query("INSERT INTO " + DB_PREFIX + "product_option_value SET product_option_value_id = '" + product_option_value['product_option_value_id'] + "', product_option_id = '" + product_option_id + "', product_id = '" + product_id + "', option_id = '" + product_option['option_id'] + "', option_value_id = '" + product_option_value['option_value_id'] + "', quantity = '" + product_option_value['quantity'] + "', subtract = '" + product_option_value['subtract'] + "', price = '" + product_option_value['price'] + "', price_prefix = '" + this.db.escape(product_option_value['price_prefix']) + "', points = '" + product_option_value['points'] + "', points_prefix = '" + this.db.escape(product_option_value['points_prefix']) + "', weight = '" + product_option_value['weight'] + "', weight_prefix = '" + this.db.escape(product_option_value['weight_prefix']) + "'");
						}
					}
				} else {
					await this.db.query("INSERT INTO " + DB_PREFIX + "product_option SET product_option_id = '" + product_option['product_option_id'] + "', product_id = '" + product_id + "', option_id = '" + product_option['option_id'] + "', value = '" + this.db.escape(product_option['value']) + "', required = '" + product_option['required'] + "'");
				}
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_recurring` WHERE product_id = " + product_id);

		if ((data['product_recurring'])) {
			for (data['product_recurring'] of product_recurring) {
				const query = await this.db.query("SELECT `product_id` FROM `" + DB_PREFIX + "product_recurring` WHERE `product_id` = '" + product_id + "' AND `customer_group_id` = '" + product_recurring['customer_group_id'] + "' AND `recurring_id` = '" + product_recurring['recurring_id'] + "'");

				if (!query.num_rows) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_recurring` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_recurring['customer_group_id'] + "', `recurring_id` = '" + product_recurring['recurring_id'] + "'");
				}				
			}
		}
		
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_discount WHERE product_id = '" + product_id + "'");

		if ((data['product_discount'])) {
			for (data['product_discount'] of product_discount) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_discount SET product_id = '" + product_id + "', customer_group_id = '" + product_discount['customer_group_id'] + "', quantity = '" + product_discount['quantity'] + "', priority = '" + product_discount['priority'] + "', price = '" + product_discount['price'] + "', date_start = '" + this.db.escape(product_discount['date_start']) + "', date_end = '" + this.db.escape(product_discount['date_end']) + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_special WHERE product_id = '" + product_id + "'");

		if ((data['product_special'])) {
			for (data['product_special'] of product_special) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_special SET product_id = '" + product_id + "', customer_group_id = '" + product_special['customer_group_id'] + "', priority = '" + product_special['priority'] + "', price = '" + product_special['price'] + "', date_start = '" + this.db.escape(product_special['date_start']) + "', date_end = '" + this.db.escape(product_special['date_end']) + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_image WHERE product_id = '" + product_id + "'");

		if ((data['product_image'])) {
			for (data['product_image'] of product_image) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_image SET product_id = '" + product_id + "', image = '" + this.db.escape(product_image['image']) + "', sort_order = '" + product_image['sort_order'] + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_download WHERE product_id = '" + product_id + "'");

		if ((data['product_download'])) {
			for (data['product_download'] of download_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_download SET product_id = '" + product_id + "', download_id = '" + download_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_category WHERE product_id = '" + product_id + "'");

		if ((data['product_category'])) {
			for (data['product_category'] of category_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_category SET product_id = '" + product_id + "', category_id = '" + category_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_filter WHERE product_id = '" + product_id + "'");

		if ((data['product_filter'])) {
			for (data['product_filter'] of filter_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_filter SET product_id = '" + product_id + "', filter_id = '" + filter_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE related_id = '" + product_id + "'");

		if ((data['product_related'])) {
			for (data['product_related'] of related_id) {
				await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE product_id = '" + product_id + "' AND related_id = '" + related_id + "'");
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_related SET product_id = '" + product_id + "', related_id = '" + related_id + "'");
				await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE product_id = '" + related_id + "' AND related_id = '" + product_id + "'");
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_related SET product_id = '" + related_id + "', related_id = '" + product_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "product_reward WHERE product_id = '" + product_id + "'");

		if ((data['product_reward'])) {
			for (data['product_reward'] of customer_group_id : value) {
				if (value['points'] > 0) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "product_reward SET product_id = '" + product_id + "', customer_group_id = '" + customer_group_id + "', points = '" + value['points'] + "'");
				}
			}
		}
		
		// SEO URL
		await this.db.query("DELETE FROM " + DB_PREFIX + "seo_url WHERE query = 'product_id=" + product_id + "'");
		
		if ((data['product_seo_url'])) {
			for (data['product_seo_url']as store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "seo_url SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'product_id=" + product_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}
		
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_layout WHERE product_id = '" + product_id + "'");

		if ((data['product_layout'])) {
			for (data['product_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "product_to_layout SET product_id = '" + product_id + "', store_id = '" + store_id + "', layout_id = '" + layout_id + "'");
			}
		}

		this.cache.delete('product');
	}

	async copyProduct(product_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "product p WHERE p.product_id = '" + product_id + "'");

		if (query.num_rows) {
			data = query.row;

			data['sku'] = '';
			data['upc'] = '';
			data['viewed'] = '0';
			data['keyword'] = '';
			data['status'] = '0';

			data['product_attribute'] = this.getProductAttributes(product_id);
			data['product_description'] = this.getProductDescriptions(product_id);
			data['product_discount'] = this.getProductDiscounts(product_id);
			data['product_filter'] = this.getProductFilters(product_id);
			data['product_image'] = this.getProductImages(product_id);
			data['product_option'] = this.getProductOptions(product_id);
			data['product_related'] = this.getProductRelated(product_id);
			data['product_reward'] = this.getProductRewards(product_id);
			data['product_special'] = this.getProductSpecials(product_id);
			data['product_category'] = this.getProductCategories(product_id);
			data['product_download'] = this.getProductDownloads(product_id);
			data['product_layout'] = this.getProductLayouts(product_id);
			data['product_store'] = this.getProductStores(product_id);
			data['product_recurrings'] = this.getRecurrings(product_id);

			this.addProduct(data);
		}
	}

	async deleteProduct(product_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "product WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_description WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_discount WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_filter WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_image WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_option WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_option_value WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_related WHERE related_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_reward WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_special WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_category WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_download WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_layout WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_store WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_recurring WHERE product_id = " + product_id);
		await this.db.query("DELETE FROM " + DB_PREFIX + "review WHERE product_id = '" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "seo_url WHERE query = 'product_id=" + product_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_product WHERE product_id = '" + product_id + "'");

		this.cache.delete('product');
	}

	async getProduct(product_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) WHERE p.product_id = '" + product_id + "' AND pd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getProducts(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND pd.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_model'])) {
			sql += " AND p.model LIKE '" + this.db.escape(data['filter_model']) + "%'";
		}

		if ((data['filter_price'])) {
			sql += " AND p.price LIKE '" + this.db.escape(data['filter_price']) + "%'";
		}

		if ((data['filter_quantity']) && data['filter_quantity'] !== '') {
			sql += " AND p.quantity = '" + data['filter_quantity'] + "'";
		}

		if ((data['filter_status']) && data['filter_status'] !== '') {
			sql += " AND p.status = '" + data['filter_status'] + "'";
		}

		sql += " GROUP BY p.product_id";

		let sort_data = [
			'pd.name',
			'p.model',
			'p.price',
			'p.quantity',
			'p.status',
			'p.sort_order'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY pd.name";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start']||0;
if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getProductsByCategoryId(category_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) LEFT JOIN " + DB_PREFIX + "product_to_category p2c ON (p.product_id = p2c.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "' AND p2c.category_id = '" + category_id + "' ORDER BY pd.name ASC");

		return query.rows;
	}

	async getProductDescriptions(product_id) {
		product_description_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_description WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_description_data[result['language_id']] = array(
				'name'             : result['name'],
				'description'      : result['description'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword'],
				'tag'              : result['tag']
			);
		}

		return product_description_data;
	}

	async getProductCategories(product_id) {
		product_category_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_category WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_category_data[] = result['category_id'];
		}

		return product_category_data;
	}

	async getProductFilters(product_id) {
		product_filter_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_filter WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_filter_data[] = result['filter_id'];
		}

		return product_filter_data;
	}

	async getProductAttributes(product_id) {
		product_attribute_data = {};

		product_attribute_query = await this.db.query("SELECT attribute_id FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "' GROUP BY attribute_id");

		for (product_attribute_query.rows of product_attribute) {
			product_attribute_description_data = {};

			product_attribute_description_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_attribute WHERE product_id = '" + product_id + "' AND attribute_id = '" + product_attribute['attribute_id'] + "'");

			for (product_attribute_description_query.rows of product_attribute_description) {
				product_attribute_description_data[product_attribute_description['language_id']] = array('text' : product_attribute_description['text']);
			}

			product_attribute_data.push({
				'attribute_id'                  : product_attribute['attribute_id'],
				'product_attribute_description' : product_attribute_description_data
			);
		}

		return product_attribute_data;
	}

	async getProductOptions(product_id) {
		product_option_data = {};

		product_option_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_option` po LEFT JOIN `" + DB_PREFIX + "option` o ON (po.option_id = o.option_id) LEFT JOIN `" + DB_PREFIX + "option_description` od ON (o.option_id = od.option_id) WHERE po.product_id = '" + product_id + "' AND od.language_id = '" + this.config.get('config_language_id') + "' ORDER BY o.sort_order ASC");

		for (product_option_query.rows of product_option) {
			product_option_value_data = {};

			product_option_value_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_option_value pov LEFT JOIN " + DB_PREFIX + "option_value ov ON(pov.option_value_id = ov.option_value_id) WHERE pov.product_option_id = '" + product_option['product_option_id'] + "' ORDER BY ov.sort_order ASC");

			for (product_option_value_query.rows of product_option_value) {
				product_option_value_data.push({
					'product_option_value_id' : product_option_value['product_option_value_id'],
					'option_value_id'         : product_option_value['option_value_id'],
					'quantity'                : product_option_value['quantity'],
					'subtract'                : product_option_value['subtract'],
					'price'                   : product_option_value['price'],
					'price_prefix'            : product_option_value['price_prefix'],
					'points'                  : product_option_value['points'],
					'points_prefix'           : product_option_value['points_prefix'],
					'weight'                  : product_option_value['weight'],
					'weight_prefix'           : product_option_value['weight_prefix']
				);
			}

			product_option_data.push({
				'product_option_id'    : product_option['product_option_id'],
				'product_option_value' : product_option_value_data,
				'option_id'            : product_option['option_id'],
				'name'                 : product_option['name'],
				'type'                 : product_option['type'],
				'value'                : product_option['value'],
				'required'             : product_option['required']
			);
		}

		return product_option_data;
	}

	async getProductOptionValue(product_id, product_option_value_id) {
		const query = await this.db.query("SELECT pov.option_value_id, ovd.name, pov.quantity, pov.subtract, pov.price, pov.price_prefix, pov.points, pov.points_prefix, pov.weight, pov.weight_prefix FROM " + DB_PREFIX + "product_option_value pov LEFT JOIN " + DB_PREFIX + "option_value ov ON (pov.option_value_id = ov.option_value_id) LEFT JOIN " + DB_PREFIX + "option_value_description ovd ON (ov.option_value_id = ovd.option_value_id) WHERE pov.product_id = '" + product_id + "' AND pov.product_option_value_id = '" + product_option_value_id + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getProductImages(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_image WHERE product_id = '" + product_id + "' ORDER BY sort_order ASC");

		return query.rows;
	}

	async getProductDiscounts(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_discount WHERE product_id = '" + product_id + "' ORDER BY quantity, priority, price");

		return query.rows;
	}

	async getProductSpecials(product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_special WHERE product_id = '" + product_id + "' ORDER BY priority, price");

		return query.rows;
	}

	async getProductRewards(product_id) {
		product_reward_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_reward WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_reward_data[result['customer_group_id']] = array('points' : result['points']);
		}

		return product_reward_data;
	}

	async getProductDownloads(product_id) {
		product_download_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_download WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_download_data[] = result['download_id'];
		}

		return product_download_data;
	}

	async getProductStores(product_id) {
		product_store_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_store WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_store_data[] = result['store_id'];
		}

		return product_store_data;
	}
	
	async getProductSeoUrls(product_id) {
		product_seo_url_data = {};
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE query = 'product_id=" + product_id + "'");

		for (let result of query.rows ) {
			product_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return product_seo_url_data;
	}
	
	async getProductLayouts(product_id) {
		product_layout_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_layout WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_layout_data[result['store_id']] = result['layout_id'];
		}

		return product_layout_data;
	}

	async getProductRelated(product_id) {
		product_related_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_related WHERE product_id = '" + product_id + "'");

		for (let result of query.rows ) {
			product_related_data[] = result['related_id'];
		}

		return product_related_data;
	}

	async getRecurrings(product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_recurring` WHERE product_id = '" + product_id + "'");

		return query.rows;
	}

	async getTotalProducts(data = {}) {
		let sql = "SELECT COUNT(DISTINCT p.product_id) AS total FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id)";

		sql += " WHERE pd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND pd.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_model'])) {
			sql += " AND p.model LIKE '" + this.db.escape(data['filter_model']) + "%'";
		}

		if ((data['filter_price']) && !is_null(data['filter_price'])) {
			sql += " AND p.price LIKE '" + this.db.escape(data['filter_price']) + "%'";
		}

		if ((data['filter_quantity']) && data['filter_quantity'] !== '') {
			sql += " AND p.quantity = '" + data['filter_quantity'] + "'";
		}

		if ((data['filter_status']) && data['filter_status'] !== '') {
			sql += " AND p.status = '" + data['filter_status'] + "'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getTotalProductsByTaxClassId(tax_class_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product WHERE tax_class_id = '" + tax_class_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByStockStatusId(stock_status_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product WHERE stock_status_id = '" + stock_status_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByWeightClassId(weight_class_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product WHERE weight_class_id = '" + weight_class_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByLengthClassId(length_class_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product WHERE length_class_id = '" + length_class_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByDownloadId(download_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product_to_download WHERE download_id = '" + download_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByManufacturerId(manufacturer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product WHERE manufacturer_id = '" + manufacturer_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByAttributeId(attribute_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product_attribute WHERE attribute_id = '" + attribute_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByOptionId(option_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product_option WHERE option_id = '" + option_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByProfileId(recurring_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product_recurring WHERE recurring_id = '" + recurring_id + "'");

		return query.row['total'];
	}

	async getTotalProductsByLayoutId(layout_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product_to_layout WHERE layout_id = '" + layout_id + "'");

		return query.row['total'];
	}
}
