<?php
namespace Opencart\Admin\Model\Catalog;
/**
 * Class Product
 *
 * @package Opencart\Admin\Model\Catalog
 */
class ProductModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addProduct(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "product` SET `master_id` = '" + data['master_id'] + "', `model` = " + this.db.escape(data['model']) + ", `sku` = '" + this.db.escape(data['sku']) + "', `upc` = '" + this.db.escape(data['upc']) + "', `ean` = '" + this.db.escape(data['ean']) + "', `jan` = '" + this.db.escape(data['jan']) + "', `isbn` = '" + this.db.escape(data['isbn']) + "', `mpn` = '" + this.db.escape(data['mpn']) + "', `location` = '" + this.db.escape(data['location']) + "', `variant` = '" + this.db.escape((data['variant']) ? JSON.stringify(data['variant']) : '') + "', `override` = '" + this.db.escape((data['override']) ? JSON.stringify(data['override']) : '') + "', `quantity` = '" + data['quantity'] + "', `minimum` = '" + data['minimum'] + "', `subtract` = '" + ((data['subtract']) ? data['subtract'] : 0) + "', `stock_status_id` = '" + data['stock_status_id'] + "', `date_available` = '" + this.db.escape(data['date_available']) + "', `manufacturer_id` = '" + data['manufacturer_id'] + "', `shipping` = '" + ((data['shipping']) ? data['shipping'] : 0) + "', `price` = '" + data['price'] + "', `points` = '" + data['points'] + "', `weight` = '" + data['weight'] + "', `weight_class_id` = '" + data['weight_class_id'] + "', `length` = '" + data['length'] + "', `width` = '" + data['width'] + "', `height` = '" + data['height'] + "', `length_class_id` = '" + data['length_class_id'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `tax_class_id` = '" + data['tax_class_id'] + "', `sort_order` = '" + data['sort_order'] + "', `date_added` = NOW(), `date_modified` = NOW()");

		product_id = this.db.getLastId();

		if (data['image']) {
			await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `image` = '" + this.db.escape(data['image']) + "' WHERE `product_id` = '" + product_id + "'");
		}

		// Description
		for (data['product_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "product_description` SET `product_id` = '" + product_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + ", `description` = '" + this.db.escape(value['description']) + "', `tag` = '" + this.db.escape(value['tag']) + "', `meta_title` = '" + this.db.escape(value['meta_title']) + "', `meta_description` = '" + this.db.escape(value['meta_description']) + "', `meta_keyword` = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		// Categories
		if ((data['product_category'])) {
			for (data['product_category'] of category_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_category` SET `product_id` = '" + product_id + "', `category_id` = '" + category_id + "'");
			}
		}

		// Filters
		if ((data['product_filter'])) {
			for (data['product_filter'] of filter_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_filter` SET `product_id` = '" + product_id + "', `filter_id` = '" + filter_id + "'");
			}
		}

		// Stores
		if ((data['product_store'])) {
			for (data['product_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_store` SET `product_id` = '" + product_id + "', `store_id` = '" + store_id + "'");
			}
		}

		// Downloads
		if ((data['product_download'])) {
			for (data['product_download'] of download_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_download` SET `product_id` = '" + product_id + "', `download_id` = '" + download_id + "'");
			}
		}

		// Related
		if ((data['product_related'])) {
			for (data['product_related'] of related_id) {
				await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + product_id + "' AND `related_id` = '" + related_id + "'");
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_related` SET `product_id` = '" + product_id + "', `related_id` = '" + related_id + "'");
				await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + related_id + "' AND `related_id` = '" + product_id + "'");
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_related` SET `product_id` = '" + related_id + "', `related_id` = '" + product_id + "'");
			}
		}

		// Attributes
		if ((data['product_attribute'])) {
			for (data['product_attribute'] of product_attribute) {
				if (product_attribute['attribute_id']) {
					// Removes duplicates
					await this.db.query("DELETE FROM `" + DB_PREFIX + "product_attribute` WHERE `product_id` = '" + product_id + "' AND `attribute_id` = '" + product_attribute['attribute_id'] + "'");

					for (product_attribute['product_attribute_description'] of language_id : product_attribute_description) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "product_attribute` SET `product_id` = '" + product_id + "', `attribute_id` = '" + product_attribute['attribute_id'] + "', `language_id` = '" + language_id + "', `text` = '" + this.db.escape(product_attribute_description['text']) + "'");
					}
				}
			}
		}

		// Options
		if ((data['product_option'])) {
			for (data['product_option'] of product_option) {
				if (product_option['type'] == 'select' || product_option['type'] == 'radio' || product_option['type'] == 'checkbox' || product_option['type'] == 'image') {
					if ((product_option['product_option_value'])) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "product_option` SET `product_id` = '" + product_id + "', `option_id` = '" + product_option['option_id'] + "', `required` = '" + product_option['required'] + "'");

						product_option_id = this.db.getLastId();

						for (product_option['product_option_value'] of product_option_value) {
							await this.db.query("INSERT INTO `" + DB_PREFIX + "product_option_value` SET `product_option_id` = '" + product_option_id + "', `product_id` = '" + product_id + "', `option_id` = '" + product_option['option_id'] + "', `option_value_id` = '" + product_option_value['option_value_id'] + "', `quantity` = '" + product_option_value['quantity'] + "', `subtract` = '" + product_option_value['subtract'] + "', `price` = '" + product_option_value['price'] + "', `price_prefix` = '" + this.db.escape(product_option_value['price_prefix']) + "', `points` = '" + product_option_value['points'] + "', `points_prefix` = '" + this.db.escape(product_option_value['points_prefix']) + "', `weight` = '" + product_option_value['weight'] + "', `weight_prefix` = '" + this.db.escape(product_option_value['weight_prefix']) + "'");
						}
					}
				} else {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_option` SET `product_id` = '" + product_id + "', `option_id` = '" + product_option['option_id'] + "', `value` = '" + this.db.escape(product_option['value']) + "', `required` = '" + product_option['required'] + "'");
				}
			}
		}

		// Subscription
		if ((data['product_subscription'])) {
			for (data['product_subscription'] of product_subscription) {
				let query = await this.db.query("SELECT `product_id` FROM `" + DB_PREFIX + "product_subscription` WHERE `product_id` = '" + product_id + "' AND `customer_group_id` = '" + product_subscription['customer_group_id'] + "' AND `subscription_plan_id` = '" + product_subscription['subscription_plan_id'] + "'");

				if (!query.num_rows) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_subscription` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_subscription['customer_group_id'] + "', `subscription_plan_id` = '" + product_subscription['subscription_plan_id'] + "', `trial_price` = '" + product_subscription['trial_price'] + "', `price` = '" + product_subscription['price'] + "'");
				}
			}
		}

		// Discounts
		if ((data['product_discount'])) {
			for (data['product_discount'] of product_discount) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_discount` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_discount['customer_group_id'] + "', `quantity` = '" + product_discount['quantity'] + "', `priority` = '" + product_discount['priority'] + "', `price` = '" + product_discount['price'] + "', `date_start` = '" + this.db.escape(product_discount['date_start']) + "', `date_end` = '" + this.db.escape(product_discount['date_end']) + "'");
			}
		}

		// Specials
		if ((data['product_special'])) {
			for (data['product_special'] of product_special) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_special` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_special['customer_group_id'] + "', `priority` = '" + product_special['priority'] + "', `price` = '" + product_special['price'] + "', `date_start` = '" + this.db.escape(product_special['date_start']) + "', `date_end` = '" + this.db.escape(product_special['date_end']) + "'");
			}
		}

		// Images
		if ((data['product_image'])) {
			for (data['product_image'] of product_image) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_image` SET `product_id` = '" + product_id + "', `image` = '" + this.db.escape(product_image['image']) + "', `sort_order` = '" + product_image['sort_order'] + "'");
			}
		}

		// Reward
		if ((data['product_reward'])) {
			for (data['product_reward'] of customer_group_id : product_reward) {
				if (product_reward['points'] > 0) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_reward` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + customer_group_id + "', `points` = '" + product_reward['points'] + "'");
				}
			}
		}

		// SEO URL
		if ((data['product_seo_url'])) {
			for (data['product_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'product_id', `value` = '" + product_id + "', `keyword` = '" + this.db.escape(keyword) + "'");
				}
			}
		}

		// Layout
		if ((data['product_layout'])) {
			for (data['product_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_layout` SET `product_id` = '" + product_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		this.cache.delete('product');

		return product_id;
	}

	/**
	 * @param   product_id
	 * @param data
	 *
	 * @return void
	 */
	async editProduct(product_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `model` = " + this.db.escape(data['model']) + ", `sku` = '" + this.db.escape(data['sku']) + "', `upc` = '" + this.db.escape(data['upc']) + "', `ean` = '" + this.db.escape(data['ean']) + "', `jan` = '" + this.db.escape(data['jan']) + "', `isbn` = '" + this.db.escape(data['isbn']) + "', `mpn` = '" + this.db.escape(data['mpn']) + "', `location` = '" + this.db.escape(data['location']) + "', `variant` = '" + this.db.escape((data['variant']) ? JSON.stringify(data['variant']) : '') + "', `override` = '" + this.db.escape((data['override']) ? JSON.stringify(data['override']) : '') + "', `quantity` = '" + data['quantity'] + "', `minimum` = '" + data['minimum'] + "', `subtract` = '" + ((data['subtract']) ? data['subtract'] : 0) + "', `stock_status_id` = '" + data['stock_status_id'] + "', `date_available` = '" + this.db.escape(data['date_available']) + "', `manufacturer_id` = '" + data['manufacturer_id'] + "', `shipping` = '" + ((data['shipping']) ? data['shipping'] : 0) + "', `price` = '" + data['price'] + "', `points` = '" + data['points'] + "', `weight` = '" + data['weight'] + "', `weight_class_id` = '" + data['weight_class_id'] + "', `length` = '" + data['length'] + "', `width` = '" + data['width'] + "', `height` = '" + data['height'] + "', `length_class_id` = '" + data['length_class_id'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `tax_class_id` = '" + data['tax_class_id'] + "', `sort_order` = '" + data['sort_order'] + "', `date_modified` = NOW() WHERE `product_id` = '" + product_id + "'");

		if (data['image']) {
			await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `image` = '" + this.db.escape(data['image']) + "' WHERE `product_id` = '" + product_id + "'");
		}

		// Description
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_description` WHERE `product_id` = '" + product_id + "'");

		for (data['product_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "product_description` SET `product_id` = '" + product_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + ", `description` = '" + this.db.escape(value['description']) + "', `tag` = '" + this.db.escape(value['tag']) + "', `meta_title` = '" + this.db.escape(value['meta_title']) + "', `meta_description` = '" + this.db.escape(value['meta_description']) + "', `meta_keyword` = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		// Categories
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_category'])) {
			for (data['product_category'] of category_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_category` SET `product_id` = '" + product_id + "', `category_id` = '" + category_id + "'");
			}
		}

		// Filters
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_filter` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_filter'])) {
			for (data['product_filter'] of filter_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_filter` SET `product_id` = '" + product_id + "', `filter_id` = '" + filter_id + "'");
			}
		}

		// Stores
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_store` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_store'])) {
			for (data['product_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_store` SET `product_id` = '" + product_id + "', `store_id` = '" + store_id + "'");
			}
		}

		// Downloads
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_download` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_download'])) {
			for (data['product_download'] of download_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_download` SET `product_id` = '" + product_id + "', `download_id` = '" + download_id + "'");
			}
		}

		// Related
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `related_id` = '" + product_id + "'");

		if ((data['product_related'])) {
			for (data['product_related'] of related_id) {
				await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + product_id + "' AND `related_id` = '" + related_id + "'");
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_related` SET `product_id` = '" + product_id + "', `related_id` = '" + related_id + "'");
				await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + related_id + "' AND `related_id` = '" + product_id + "'");
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_related` SET `product_id` = '" + related_id + "', `related_id` = '" + product_id + "'");
			}
		}

		// Attributes
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_attribute` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_attribute'])) {
			for (data['product_attribute'] of product_attribute) {
				if (product_attribute['attribute_id']) {
					// Removes duplicates
					await this.db.query("DELETE FROM `" + DB_PREFIX + "product_attribute` WHERE `product_id` = '" + product_id + "' AND `attribute_id` = '" + product_attribute['attribute_id'] + "'");

					for (product_attribute['product_attribute_description'] of language_id : product_attribute_description) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "product_attribute` SET `product_id` = '" + product_id + "', `attribute_id` = '" + product_attribute['attribute_id'] + "', `language_id` = '" + language_id + "', `text` = '" + this.db.escape(product_attribute_description['text']) + "'");
					}
				}
			}
		}

		// Options
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_option` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_option_value` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_option'])) {
			for (data['product_option'] of product_option) {
				if (product_option['type'] == 'select' || product_option['type'] == 'radio' || product_option['type'] == 'checkbox' || product_option['type'] == 'image') {
					if ((product_option['product_option_value'])) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "product_option` SET `product_option_id` = '" + product_option['product_option_id'] + "', `product_id` = '" + product_id + "', `option_id` = '" + product_option['option_id'] + "', `required` = '" + product_option['required'] + "'");

						product_option_id = this.db.getLastId();

						for (product_option['product_option_value'] of product_option_value) {
							await this.db.query("INSERT INTO `" + DB_PREFIX + "product_option_value` SET `product_option_value_id` = '" + product_option_value['product_option_value_id'] + "', `product_option_id` = '" + product_option_id + "', `product_id` = '" + product_id + "', `option_id` = '" + product_option['option_id'] + "', `option_value_id` = '" + product_option_value['option_value_id'] + "', `quantity` = '" + product_option_value['quantity'] + "', `subtract` = '" + product_option_value['subtract'] + "', `price` = '" + product_option_value['price'] + "', `price_prefix` = '" + this.db.escape(product_option_value['price_prefix']) + "', `points` = '" + product_option_value['points'] + "', `points_prefix` = '" + this.db.escape(product_option_value['points_prefix']) + "', `weight` = '" + product_option_value['weight'] + "', `weight_prefix` = '" + this.db.escape(product_option_value['weight_prefix']) + "'");
						}
					}
				} else {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_option` SET `product_option_id` = '" + product_option['product_option_id'] + "', `product_id` = '" + product_id + "', `option_id` = '" + product_option['option_id'] + "', `value` = '" + this.db.escape(product_option['value']) + "', `required` = '" + product_option['required'] + "'");
				}
			}
		}

		// Subscription
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_subscription` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_subscription'])) {
			for (data['product_subscription'] of product_subscription) {
				let query = await this.db.query("SELECT `product_id` FROM `" + DB_PREFIX + "product_subscription` WHERE `product_id` = '" + product_id + "' AND `customer_group_id` = '" + product_subscription['customer_group_id'] + "' AND `subscription_plan_id` = '" + product_subscription['subscription_plan_id'] + "'");

				if (!query.num_rows) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_subscription` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_subscription['customer_group_id'] + "', `subscription_plan_id` = '" + product_subscription['subscription_plan_id'] + "', `trial_price` = '" + product_subscription['trial_price'] + "', `price` = '" + product_subscription['price'] + "'");
				}
			}
		}

		// Discounts
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_discount` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_discount'])) {
			for (data['product_discount'] of product_discount) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_discount` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_discount['customer_group_id'] + "', `quantity` = '" + product_discount['quantity'] + "', `priority` = '" + product_discount['priority'] + "', `price` = '" + product_discount['price'] + "', `date_start` = '" + this.db.escape(product_discount['date_start']) + "', `date_end` = '" + this.db.escape(product_discount['date_end']) + "'");
			}
		}

		// Specials
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_special` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_special'])) {
			for (data['product_special'] of product_special) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_special` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + product_special['customer_group_id'] + "', `priority` = '" + product_special['priority'] + "', `price` = '" + product_special['price'] + "', `date_start` = '" + this.db.escape(product_special['date_start']) + "', `date_end` = '" + this.db.escape(product_special['date_end']) + "'");
			}
		}

		// Images
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_image` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_image'])) {
			for (data['product_image'] of product_image) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_image` SET `product_id` = '" + product_id + "', `image` = '" + this.db.escape(product_image['image']) + "', `sort_order` = '" + product_image['sort_order'] + "'");
			}
		}

		// Rewards
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_reward` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_reward'])) {
			for (data['product_reward'] of customer_group_id : value) {
				if (value['points'] > 0) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "product_reward` SET `product_id` = '" + product_id + "', `customer_group_id` = '" + customer_group_id + "', `points` = '" + value['points'] + "'");
				}
			}
		}

		// SEO URL
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'product_id' AND `value` = '" + product_id + "'");

		if ((data['product_seo_url'])) {
			for (data['product_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'product_id', `value` = '" + product_id + "', `keyword` = '" + this.db.escape(keyword) + "'");
				}
			}
		}

		// Layout
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_layout` WHERE `product_id` = '" + product_id + "'");

		if ((data['product_layout'])) {
			for (data['product_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "product_to_layout` SET `product_id` = '" + product_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		this.cache.delete('product');
	}

	/**
	 * @param product_id
	 *
	 * @return void
	 */
	async copyProduct(product_id) {
		product_info = this.model_catalog_product.getProduct(product_id);

		if (product_info) {
			product_data = product_info;

			product_data['sku'] = '';
			product_data['upc'] = '';
			product_data['status'] = '0';
			
			product_data['variant'] = JSON.stringify(product_info['variant']);
			product_data['override'] = JSON.stringify(product_info['override']);

			product_data['product_attribute'] = this.model_catalog_product.getAttributes(product_id);
			product_data['product_category'] = this.model_catalog_product.getCategories(product_id);
			product_data['product_description'] = this.model_catalog_product.getDescriptions(product_id);
			product_data['product_discount'] = this.model_catalog_product.getDiscounts(product_id);
			product_data['product_download'] = this.model_catalog_product.getDownloads(product_id);
			product_data['product_filter'] = this.model_catalog_product.getFilters(product_id);
			product_data['product_image'] = this.model_catalog_product.getImages(product_id);
			product_data['product_layout'] = this.model_catalog_product.getLayouts(product_id);
			product_data['product_option'] = this.model_catalog_product.getOptions(product_id);
			product_data['product_subscription'] = this.model_catalog_product.getSubscriptions(product_id);
			product_data['product_related'] = this.model_catalog_product.getRelated(product_id);
			product_data['product_reward'] = this.model_catalog_product.getRewards(product_id);
			product_data['product_special'] = this.model_catalog_product.getSpecials(product_id);
			product_data['product_store'] = this.model_catalog_product.getStores(product_id);

			this.model_catalog_product.addProduct(product_data);
		}
	}

	/**
	 * @param product_id
	 *
	 * @return void
	 */
	async deleteProduct(product_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_attribute` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_description` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_discount` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_filter` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_image` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_option` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_option_value` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_subscription` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_related` WHERE `related_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_report` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_reward` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_special` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_download` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_layout` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_store` WHERE `product_id` = '" + product_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "review` WHERE `product_id` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'product_id' AND `value` = '" + product_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_product` WHERE `product_id` = '" + product_id + "'");

		await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `master_id` = '0' WHERE `master_id` = '" + product_id + "'");

		this.cache.delete('product');
	}

	/**
	 * @param   master_id
	 * @param data
	 *
	 * @return int
	 */
	async addVariant(master_id, data) {
		product_data = [];

		// Use master values to override the values
		master_info = this.model_catalog_product.getProduct(master_id);

		if (master_info) {
			// We use the override to override the master product values
			if ((data['override'])) {
				override = data['override'];
			} else {
				override = [];
			}

			ignore = [
				'product_id',
				'master_id',
				'quantity',
				'override',
				'variant'
			];

			for (master_info of key : value) {
				// So if key not in override or ignore list we replace with master value
				if (!array_key_exists(key, override) && !in_array(key, ignore)) {
					product_data[key] = value;
				}
			}

			// Descriptions
			product_descriptions = this.model_catalog_product.getDescriptions(master_id);

			for (product_descriptions of language_id : product_description) {
				for (product_description of key : value) {
					// If an override has been found, we use the POST data values
					if (!(override['product_description'][language_id][key])) {
						product_data['product_description'][language_id][key] = value;
					}
				}
			}

			// Attributes
			if (!(override['product_attribute'])) {
				product_data['product_attribute'] = this.model_catalog_product.getAttributes(master_id);
			}

			// Category
			if (!(override['product_category'])) {
				product_data['product_category'] = this.model_catalog_product.getCategories(master_id);
			}

			// Discounts
			if (!(override['product_discount'])) {
				product_data['product_discount'] = this.model_catalog_product.getDiscounts(master_id);
			}

			// Downloads
			if (!(override['product_download'])) {
				product_data['product_download'] = this.model_catalog_product.getDownloads(master_id);
			}

			// Filters
			if (!(override['product_filter'])) {
				product_data['product_filter'] = this.model_catalog_product.getFilters(master_id);
			}

			// Images
			if (!(override['product_image'])) {
				product_data['product_image'] = this.model_catalog_product.getImages(master_id);
			}

			// Layouts
			if (!(override['product_layout'])) {
				product_data['product_layout'] = this.model_catalog_product.getLayouts(master_id);
			}

			// Options
			// product_option should not be used if variant product

			// Subscriptions
			if (!(override['product_subscription'])) {
				product_data['product_subscription'] = this.model_catalog_product.getSubscriptions(master_id);
			}

			// Related
			if (!(override['product_related'])) {
				product_data['product_related'] = this.model_catalog_product.getRelated(master_id);
			}

			// Rewards
			if (!(override['product_reward'])) {
				product_data['product_reward'] = this.model_catalog_product.getRewards(master_id);
			}

			// SEO
			// product_seo table is not overwritten because that needs to have unique seo keywords for every product

			// Specials
			if (!(override['product_special'])) {
				product_data['product_special'] = this.model_catalog_product.getSpecials(master_id);
			}

			// Stores
			if (!(override['product_store'])) {
				product_data['product_store'] = this.model_catalog_product.getStores(master_id);
			}
		}

		// If override set the POST data values
		for (data of key : value) {
			if (!(product_data[key])) {
				product_data[key] = value;
			}
		}

		// Product Description
		if ((data['product_description'])) {
			for (data['product_description'] of language_id : product_description) {
				for (product_description of key : value) {
					if (!(product_data['product_description'][language_id][key])) {
						product_data['product_description'][language_id][key] = value;
					}
				}
			}
		}

		// Product add with master product overridden values
		return this.model_catalog_product.addProduct(product_data);
	}

	/**
	 * @param   master_id
	 * @param   product_id
	 * @param data
	 *
	 * @return void
	 */
	async editVariant(master_id, product_id, data) {
		product_data = [];

		// Use master values to override the values
		master_info = this.model_catalog_product.getProduct(master_id);

		if (master_info) {
			// We use the override to override the master product values
			if ((data['override'])) {
				override = data['override'];
			} else {
				override = [];
			}

			ignore = [
				'product_id',
				'master_id',
				'quantity',
				'override',
				'variant'
			];

			for (master_info of key : value) {
				// So if key not in override or ignore list we replace with master value
				if (!array_key_exists(key, override) && !in_array(key, ignore)) {
					product_data[key] = value;
				}
			}

			// Description
			product_descriptions = this.model_catalog_product.getDescriptions(master_id);

			for (product_descriptions of language_id : product_description) {
				for (product_description of key : value) {
					if (!(override['product_description'][language_id][key])) {
						product_data['product_description'][language_id][key] = value;
					}
				}
			}

			// Attributes
			if (!(override['product_attribute'])) {
				product_data['product_attribute'] = this.model_catalog_product.getAttributes(master_id);
			}

			// Category
			if (!(override['product_category'])) {
				product_data['product_category'] = this.model_catalog_product.getCategories(master_id);
			}

			// Discounts
			if (!(override['product_discount'])) {
				product_data['product_discount'] = this.model_catalog_product.getDiscounts(master_id);
			}

			// Downloads
			if (!(override['product_download'])) {
				product_data['product_download'] = this.model_catalog_product.getDownloads(master_id);
			}

			// Filters
			if (!(override['product_filter'])) {
				product_data['product_filter'] = this.model_catalog_product.getFilters(master_id);
			}

			// Images
			if (!(override['product_image'])) {
				product_data['product_image'] = this.model_catalog_product.getImages(master_id);
			}

			// Layouts
			if (!(override['product_layout'])) {
				product_data['product_layout'] = this.model_catalog_product.getLayouts(master_id);
			}

			// Options
			// product_option should not be used if variant product

			// Subscription
			if (!(override['product_subscription'])) {
				product_data['product_subscription'] = this.model_catalog_product.getSubscriptions(master_id);
			}

			// Related
			if (!(override['product_related'])) {
				product_data['product_related'] = this.model_catalog_product.getRelated(master_id);
			}

			// Rewards
			if (!(override['product_reward'])) {
				product_data['product_reward'] = this.model_catalog_product.getRewards(master_id);
			}

			// SEO
			// product_seo table is not overwritten because that needs to have unique seo keywords for every product

			// Specials
			if (!(override['product_special'])) {
				product_data['product_special'] = this.model_catalog_product.getSpecials(master_id);
			}

			// Stores
			if (!(override['product_store'])) {
				product_data['product_store'] = this.model_catalog_product.getStores(master_id);
			}
		}

		// If override set the POST data values
		for (data of key : value) {
			if (!(product_data[key])) {
				product_data[key] = value;
			}
		}

		// Product Description
		if ((data['product_description'])) {
			for (data['product_description'] of language_id : product_description) {
				for (product_description of key : value) {
					if (!(product_data['product_description'][language_id][key])) {
						product_data['product_description'][language_id][key] = value;
					}
				}
			}
		}

		// Override the variant product data with the master product values
		this.model_catalog_product.editProduct(product_id, product_data);
	}

	/**
	 * @param   master_id
	 * @param data
	 *
	 * @return void
	 */
	async editVariants(master_id, data) {
		// product_option should not be passed to product variants
		unset(data['product_option']);

		// If product is master update variants
		products = this.model_catalog_product.getProducts(['filter_master_id' : master_id]);

		for (products of product) {
			product_data = [];

			// We need to convert JSON strings back into an array so they can be re-encoded to a to go back into the database.
			product['override'] = json_decode(product['override'], true);
			product['variant'] = json_decode(product['variant'], true);

			// We use the override to override the master product values
			if (product['override']) {
				override = product['override'];
			} else {
				override = [];
			}

			replace = [
				'product_id',
				'master_id',
				'quantity',
				'override',
				'variant'
			];

			// Now we want to
			for (product of key : value) {
				// So if key not in override or ignore list we replace with master value
				if (array_key_exists(key, override) || in_array(key, replace)) {
					product_data[key] = value;
				}
			}

			// Descriptions
			product_descriptions = this.model_catalog_product.getDescriptions(product['product_id']);

			for (product_descriptions of language_id : product_description) {
				for (product_description of key : value) {
					// If override set use the POST data values
					if ((override['product_description'][language_id][key])) {
						product_data['product_description'][language_id][key] = value;
					}
				}
			}

			// Attributes
			if ((override['product_attribute'])) {
				product_data['product_attribute'] = this.model_catalog_product.getAttributes(product['product_id']);
			}

			// Category
			if ((override['product_category'])) {
				product_data['product_category'] = this.model_catalog_product.getCategories(product['product_id']);
			}

			// Discounts
			if ((override['product_discount'])) {
				product_data['product_discount'] = this.model_catalog_product.getDiscounts(product['product_id']);
			}

			// Downloads
			if ((override['product_download'])) {
				product_data['product_download'] = this.model_catalog_product.getDownloads(product['product_id']);
			}

			// Filters
			if ((override['product_filter'])) {
				product_data['product_filter'] = this.model_catalog_product.getFilters(product['product_id']);
			}

			// Images
			if ((override['product_image'])) {
				product_data['product_image'] = this.model_catalog_product.getImages(product['product_id']);
			}

			// Layouts
			if ((override['product_layout'])) {
				product_data['product_layout'] = this.model_catalog_product.getLayouts(product['product_id']);
			}

			// Subscription
			if ((override['product_subscription'])) {
				product_data['product_subscription'] = this.model_catalog_product.getSubscriptions(product['product_id']);
			}

			// Related
			if ((override['product_related'])) {
				product_data['product_related'] = this.model_catalog_product.getRelated(product['product_id']);
			}

			// Rewards
			if ((override['product_reward'])) {
				product_data['product_reward'] = this.model_catalog_product.getRewards(product['product_id']);
			}

			// SEO
			product_data['product_seo_url'] = this.model_catalog_product.getSeoUrls(product['product_id']);

			// Specials
			if ((override['product_special'])) {
				product_data['product_special'] = this.model_catalog_product.getSpecials(product['product_id']);
			}

			// Stores
			if ((override['product_store'])) {
				product_data['product_store'] = this.model_catalog_product.getStores(product['product_id']);
			}

			// If override set the POST data values
			for (data of key : value) {
				if (!(product_data[key])) {
					product_data[key] = value;
				}
			}

			// Descriptions
			if ((data['product_description'])) {
				for (data['product_description'] of language_id : product_description) {
					for (product_description of key : value) {
						// If override set use the POST data values
						if (!(product_data['product_description'][language_id][key])) {
							product_data['product_description'][language_id][key] = value;
						}
					}
				}
			}

			this.model_catalog_product.editProduct(product['product_id'], product_data);
		}
	}

	/**
	 * @param product_id
	 * @param rating
	 *
	 * @return void
	 */
	async editRating(product_id, rating) {
		await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `rating` = '" + rating + "', `date_modified` = NOW() WHERE `product_id` = '" + product_id + "'");
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getProduct(product_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.`product_id` = pd.`product_id`) WHERE p.`product_id` = '" + product_id + "' AND pd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getProducts(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.`product_id` = pd.`product_id`) WHERE pd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_master_id'])) {
			sql += " AND p.`master_id` = '" + data['filter_master_id'] + "'";
		}

		if (data['filter_name']) {
			sql += " AND pd.`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if ((data['filter_model'])) {
			sql += " AND p.`model` LIKE '" + this.db.escape(data['filter_model'] + '%') + "'";
		}

		if ((data['filter_price'])) {
			sql += " AND p.`price` LIKE '" + this.db.escape(data['filter_price'] + '%') + "'";
		}

		if ((data['filter_quantity']) && data['filter_quantity'] !== '') {
			sql += " AND p.`quantity` = '" + data['filter_quantity'] + "'";
		}

		if (data['filter_status'] && data['filter_status'] !== '') {
			sql += " AND p.`status` = '" + data['filter_status'] + "'";
		}

		sql += " GROUP BY p.`product_id`";

		let sort_data = [
			'pd.name',
			'p.model',
			'p.price',
			'p.quantity',
			'p.status',
			'p.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY pd.`name`";
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
	 * @param product_id
	 *
	 * @return array
	 */
	async getDescriptions(product_id) {
		product_description_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_description` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_description_data[result['language_id']] = [
				'name'             : result['name'],
				'description'      : result['description'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword'],
				'tag'              : result['tag']
			];
		}

		return product_description_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getCategories(product_id) {
		product_category_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_category_data[] = result['category_id'];
		}

		return product_category_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getFilters(product_id) {
		product_filter_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_filter` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_filter_data[] = result['filter_id'];
		}

		return product_filter_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getAttributes(product_id) {
		product_attribute_data = [];

		product_attribute_query = await this.db.query("SELECT attribute_id FROM `" + DB_PREFIX + "product_attribute` WHERE `product_id` = '" + product_id + "' GROUP BY `attribute_id`");

		for (product_attribute_query.rows of product_attribute) {
			product_attribute_description_data = [];

			product_attribute_description_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_attribute` WHERE `product_id` = '" + product_id + "' AND `attribute_id` = '" + product_attribute['attribute_id'] + "'");

			for (product_attribute_description_query.rows of product_attribute_description) {
				product_attribute_description_data[product_attribute_description['language_id']] = ['text' : product_attribute_description['text']];
			}

			product_attribute_data[] = [
				'attribute_id'                  : product_attribute['attribute_id'],
				'product_attribute_description' : product_attribute_description_data
			];
		}

		return product_attribute_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getOptions(product_id) {
		product_option_data = [];

		product_option_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_option` po LEFT JOIN `" + DB_PREFIX + "option` o ON (po.`option_id` = o.`option_id`) LEFT JOIN `" + DB_PREFIX + "option_description` od ON (o.`option_id` = od.`option_id`) WHERE po.`product_id` = '" + product_id + "' AND od.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY o.`sort_order` ASC");

		for (product_option_query.rows of product_option) {
			product_option_value_data = [];

			product_option_value_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_option_value` pov LEFT JOIN `" + DB_PREFIX + "option_value` ov ON (pov.`option_value_id` = ov.`option_value_id`) WHERE pov.`product_option_id` = '" + product_option['product_option_id'] + "' ORDER BY ov.`sort_order` ASC");

			for (product_option_value_query.rows of product_option_value) {
				product_option_value_data[] = [
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
				];
			}

			product_option_data[] = [
				'product_option_id'    : product_option['product_option_id'],
				'product_option_value' : product_option_value_data,
				'option_id'            : product_option['option_id'],
				'name'                 : product_option['name'],
				'type'                 : product_option['type'],
				'value'                : product_option['value'],
				'required'             : product_option['required']
			];
		}

		return product_option_data;
	}

	/**
	 * @param product_id
	 * @param product_option_value_id
	 *
	 * @return array
	 */
	async getOptionValue(product_id, product_option_value_id) {
		let query = await this.db.query("SELECT pov.`option_value_id`, ovd.`name`, pov.`quantity`, pov.`subtract`, pov.`price`, pov.`price_prefix`, pov.`points`, pov.`points_prefix`, pov.`weight`, pov.`weight_prefix` FROM `" + DB_PREFIX + "product_option_value` pov LEFT JOIN `" + DB_PREFIX + "option_value` ov ON (pov.`option_value_id` = ov.`option_value_id`) LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (ov.`option_value_id` = ovd.`option_value_id`) WHERE pov.`product_id` = '" + product_id + "' AND pov.`product_option_value_id` = '" + product_option_value_id + "' AND ovd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param option_id
	 *
	 * @return array
	 */
	async getOptionValuesByOptionId(option_id) {
		let query = await this.db.query("SELECT DISTINCT `option_value_id` FROM `" + DB_PREFIX + "product_option_value` WHERE `option_id` = '" + option_id + "'");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getImages(product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_image` WHERE `product_id` = '" + product_id + "' ORDER BY `sort_order` ASC");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getDiscounts(product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_discount` WHERE `product_id` = '" + product_id + "' ORDER BY `quantity`, `priority`, `price`");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getSpecials(product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_special` WHERE `product_id` = '" + product_id + "' ORDER BY `priority`, `price`");

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getRewards(product_id) {
		product_reward_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_reward` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_reward_data[result['customer_group_id']] = ['points' : result['points']];
		}

		return product_reward_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getDownloads(product_id) {
		product_download_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_download` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_download_data[] = result['download_id'];
		}

		return product_download_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getStores(product_id) {
		product_store_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_store` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_store_data[] = result['store_id'];
		}

		return product_store_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getSeoUrls(product_id) {
		product_seo_url_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'product_id' AND `value` = '" + product_id + "'");

		for (query.rows of result) {
			product_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return product_seo_url_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getLayouts(product_id) {
		product_layout_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_layout` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_layout_data[result['store_id']] = result['layout_id'];
		}

		return product_layout_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getRelated(product_id) {
		product_related_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_related` WHERE `product_id` = '" + product_id + "'");

		for (query.rows of result) {
			product_related_data[] = result['related_id'];
		}

		return product_related_data;
	}

	/**
	 * @param product_id
	 *
	 * @return array
	 */
	async getSubscriptions(product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_subscription` WHERE `product_id` = '" + product_id + "'");

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalProducts(data = {}) {
		let sql = "SELECT COUNT(DISTINCT p.`product_id`) AS `total` FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.`product_id` = pd.`product_id`) WHERE pd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_master_id'])) {
			sql += " AND p.`master_id` = '" + data['filter_master_id'] + "'";
		}

		if (data['filter_name']) {
			sql += " AND pd.`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		if ((data['filter_model'])) {
			sql += " AND p.`model` LIKE '" + this.db.escape(data['filter_model'] + '%') + "'";
		}

		if ((data['filter_price']) && data['filter_price'] !== '') {
			sql += " AND p.`price` LIKE '" + this.db.escape(data['filter_price'] + '%') + "'";
		}

		if ((data['filter_quantity']) && data['filter_quantity'] !== '') {
			sql += " AND p.`quantity` = '" + data['filter_quantity'] + "'";
		}

		if (data['filter_status'] && data['filter_status'] !== '') {
			sql += " AND p.`status` = '" + data['filter_status'] + "'";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param tax_class_id
	 *
	 * @return int
	 */
	async getTotalProductsByTaxClassId(tax_class_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product` WHERE `tax_class_id` = '" + tax_class_id + "'");

		return query.row['total'];
	}

	/**
	 * @param stock_status_id
	 *
	 * @return int
	 */
	async getTotalProductsByStockStatusId(stock_status_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product` WHERE `stock_status_id` = '" + stock_status_id + "'");

		return query.row['total'];
	}

	/**
	 * @param weight_class_id
	 *
	 * @return int
	 */
	async getTotalProductsByWeightClassId(weight_class_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product` WHERE `weight_class_id` = '" + weight_class_id + "'");

		return query.row['total'];
	}

	/**
	 * @param length_class_id
	 *
	 * @return int
	 */
	async getTotalProductsByLengthClassId(length_class_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product` WHERE `length_class_id` = '" + length_class_id + "'");

		return query.row['total'];
	}

	/**
	 * @param download_id
	 *
	 * @return int
	 */
	async getTotalProductsByDownloadId(download_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_to_download` WHERE `download_id` = '" + download_id + "'");

		return query.row['total'];
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return int
	 */
	async getTotalProductsByManufacturerId(manufacturer_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product` WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		return query.row['total'];
	}

	/**
	 * @param attribute_id
	 *
	 * @return int
	 */
	async getTotalProductsByAttributeId(attribute_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_attribute` WHERE `attribute_id` = '" + attribute_id + "'");

		return query.row['total'];
	}

	/**
	 * @param subscription_plan_id
	 *
	 * @return int
	 */
	async getTotalProductsBySubscriptionPlanId(subscription_plan_id) {
		let query = await this.db.query("SELECT COUNT(DISTINCT `product_id`) AS `total` FROM `" + DB_PREFIX + "product_subscription` WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");

		return query.row['total'];
	}

	/**
	 * @param layout_id
	 *
	 * @return int
	 */
	async getTotalProductsByLayoutId(layout_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_to_layout` WHERE `layout_id` = '" + layout_id + "'");

		return query.row['total'];
	}

	/**
	 * @param option_id
	 *
	 * @return int
	 */
	async getTotalProductsByOptionId(option_id) {
		let query = await this.db.query("SELECT COUNT(DISTINCT `product_id`) AS `total` FROM `" + DB_PREFIX + "product_option` WHERE `option_id` = '" + option_id + "'");

		return query.row['total'];
	}

	/**
	 * @param option_value_id
	 *
	 * @return int
	 */
	async getTotalProductsByOptionValueId(option_value_id) {
		let query = await this.db.query("SELECT COUNT(DISTINCT `product_id`) AS `total` FROM `" + DB_PREFIX + "product_option_value` WHERE `option_value_id` = '" + option_value_id + "'");

		return query.row['total'];
	}

	/**
	 * @param product_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getReports(product_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `ip`, `store_id`, `country`, `date_added` FROM `" + DB_PREFIX + "product_report` WHERE `product_id` = '" + product_id + "' ORDER BY `date_added` ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return int
	 */
	async getTotalReports(product_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_report` WHERE `product_id` = '" + product_id + "'");

		return query.row['total'];
	}
}
