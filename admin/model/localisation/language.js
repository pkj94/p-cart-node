const crypto = require('crypto');
module.exports = class LanguageModel extends Model {
    constructor(registry) {
        super(registry);
    }
    /**
         * @param array data
         *
         * @return int
         */
    async addLanguage(data) {
        await await this.db.query("INSERT INTO `" + DB_PREFIX + "language` SET `name` = '" + this.db.escape(data['name']) + "', `code` = '" + this.db.escape(data['code']) + "', `locale` = '" + this.db.escape(data['locale']) + "', `extension` = '" + this.db.escape(data['extension']) + "', `sort_order` = '" + data['sort_order'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "'");

        await this.cache.delete('language');

        let language_id = this.db.getLastId();

        // Attribute
        let query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "attribute_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let attribute of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_description` SET `attribute_id` = '" + attribute['attribute_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(attribute['name']) + "'");
        }

        // Attribute Group
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "attribute_group_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let attribute_group of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "attribute_group_description` SET `attribute_group_id` = '" + attribute_group['attribute_group_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(attribute_group['name']) + "'");
        }

        await this.cache.delete('attribute');

        // Banner
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "banner_image` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let banner_image of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "banner_image` SET `banner_id` = '" + banner_image['banner_id'] + "', `language_id` = '" + language_id + "', `title` = '" + this.db.escape(banner_image['title']) + "', `link` = '" + this.db.escape(banner_image['link']) + "', `image` = '" + this.db.escape(banner_image['image']) + "', `sort_order` = '" + banner_image['sort_order'] + "'");
        }

        await this.cache.delete('banner');

        // Category
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let category of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "category_description` SET `category_id` = '" + category['category_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(category['name']) + "', `description` = '" + this.db.escape(category['description']) + "', `meta_title` = '" + this.db.escape(category['meta_title']) + "', `meta_description` = '" + this.db.escape(category['meta_description']) + "', `meta_keyword` = '" + this.db.escape(category['meta_keyword']) + "'");
        }

        // Customer Group
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_group_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let customer_group of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_group_description` SET `customer_group_id` = '" + customer_group['customer_group_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(customer_group['name']) + "', `description` = '" + this.db.escape(customer_group['description']) + "'");
        }

        // Custom Field
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let custom_field of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_description` SET `custom_field_id` = '" + custom_field['custom_field_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(custom_field['name']) + "'");
        }

        // Custom Field Value
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_value_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let custom_field_value of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field_value_description` SET `custom_field_value_id` = '" + custom_field_value['custom_field_value_id'] + "', `language_id` = '" + language_id + "', `custom_field_id` = '" + custom_field_value['custom_field_id'] + "', `name` = '" + this.db.escape(custom_field_value['name']) + "'");
        }

        // Download
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "download_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let download of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "download_description` SET `download_id` = '" + download['download_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(download['name']) + "'");
        }

        // Filter
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let filter of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_description` SET `filter_id` = '" + filter['filter_id'] + "', `language_id` = '" + language_id + "', `filter_group_id` = '" + filter['filter_group_id'] + "', `name` = '" + this.db.escape(filter['name']) + "'");
        }

        // Filter Group
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter_group_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let filter_group of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_group_description` SET `filter_group_id` = '" + filter_group['filter_group_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(filter_group['name']) + "'");
        }

        // Information
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "information_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let information of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "information_description` SET `information_id` = '" + information['information_id'] + "', `language_id` = '" + language_id + "', `title` = '" + this.db.escape(information['title']) + "', `description` = '" + this.db.escape(information['description']) + "', `meta_title` = '" + this.db.escape(information['meta_title']) + "', `meta_description` = '" + this.db.escape(information['meta_description']) + "', `meta_keyword` = '" + this.db.escape(information['meta_keyword']) + "'");
        }

        await this.cache.delete('information');

        // Length
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "length_class_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let length of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "length_class_description` SET `length_class_id` = '" + length['length_class_id'] + "', `language_id` = '" + language_id + "', `title` = '" + this.db.escape(length['title']) + "', `unit` = '" + this.db.escape(length['unit']) + "'");
        }

        await this.cache.delete('length_class');

        // Option
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let option of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "option_description` SET `option_id` = '" + option['option_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(option['name']) + "'");
        }

        // Option Value
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "option_value_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let option_value of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "option_value_description` SET `option_value_id` = '" + option_value['option_value_id'] + "', `language_id` = '" + language_id + "', `option_id` = '" + option_value['option_id'] + "', `name` = '" + this.db.escape(option_value['name']) + "'");
        }

        // Order Status
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let order_status of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "order_status` SET `order_status_id` = '" + order_status['order_status_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(order_status['name']) + "'");
        }

        await this.cache.delete('order_status');

        // Product
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let product of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "product_description` SET `product_id` = '" + product['product_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(product['name']) + "', `description` = '" + this.db.escape(product['description']) + "', `tag` = '" + this.db.escape(product['tag']) + "', `meta_title` = '" + this.db.escape(product['meta_title']) + "', `meta_description` = '" + this.db.escape(product['meta_description']) + "', `meta_keyword` = '" + this.db.escape(product['meta_keyword']) + "'");
        }

        await this.cache.delete('product');

        // Product Attribute
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_attribute` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let product_attribute of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "product_attribute` SET `product_id` = '" + product_attribute['product_id'] + "', `attribute_id` = '" + product_attribute['attribute_id'] + "', `language_id` = '" + language_id + "', `text` = '" + this.db.escape(product_attribute['text']) + "'");
        }

        // Return Action
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_action` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let return_action of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "return_action` SET `return_action_id` = '" + return_action['return_action_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(return_action['name']) + "'");
        }

        // Return Reason
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_reason` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let return_reason of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "return_reason` SET `return_reason_id` = '" + return_reason['return_reason_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(return_reason['name']) + "'");
        }

        // Return Status
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let return_status of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "return_status` SET `return_status_id` = '" + return_status['return_status_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(return_status['name']) + "'");
        }

        // Stock Status
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let stock_status of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "stock_status` SET `stock_status_id` = '" + stock_status['stock_status_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(stock_status['name']) + "'");
        }

        await this.cache.delete('stock_status');

        // Voucher Theme
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "voucher_theme_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let voucher_theme of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "voucher_theme_description` SET `voucher_theme_id` = '" + voucher_theme['voucher_theme_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(voucher_theme['name']) + "'");
        }

        await this.cache.delete('voucher_theme');

        // Weight Class
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "weight_class_description` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let weight_class of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "weight_class_description` SET `weight_class_id` = '" + weight_class['weight_class_id'] + "', `language_id` = '" + language_id + "', `title` = '" + this.db.escape(weight_class['title']) + "', `unit` = '" + this.db.escape(weight_class['unit']) + "'");
        }

        await this.cache.delete('weight_class');

        // Subscription
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let subscription of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_status` SET `subscription_status_id` = '" + subscription['subscription_status_id'] + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(subscription['name']) + "'");
        }

        // SEO URL
        query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

        for (let seo_url of query.rows) {
            await await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + seo_url['store_id'] + "', `language_id` = '" + language_id + "', `key` = '" + this.db.escape(seo_url['key']) + "', `value` = '" + this.db.escape(seo_url['value']) + "', `keyword` = '" + this.db.escape(seo_url['keyword']) + "', `sort_order` = '" + seo_url['sort_order'] + "'");
        }

        return language_id;
    }

    /**
     * @param   language_id
     * @param array data
     *
     * @return void
     */
    async editLanguage(language_id, data = {}) {
        await await this.db.query("UPDATE `" + DB_PREFIX + "language` SET `name` = '" + this.db.escape(data['name']) + "', `code` = '" + this.db.escape(data['code']) + "', `locale` = '" + this.db.escape(data['locale']) + "', `extension` = '" + this.db.escape(data['extension']) + "', `sort_order` = '" + data['sort_order'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('language');
    }

    /**
     * @param language_id
     *
     * @return void
     */
    async deleteLanguage(language_id) {
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "language` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('language');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "attribute_group_description` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('attribute');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "banner_image` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('banner');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "category_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_group_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "download_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_group_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "information_description` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('information');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "length_class_description` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('length_class');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "option_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "option_value_description` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "order_status` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('order_status');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "product_description` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('product');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "product_attribute` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "return_action` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "return_reason` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "return_status` WHERE `language_id` = '" + language_id + "'");
        await await this.db.query("DELETE FROM `" + DB_PREFIX + "stock_status` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('stock_status');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "voucher_theme_description` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('voucher_theme');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "weight_class_description` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('weight_class');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription_status` WHERE `language_id` = '" + language_id + "'");

        await this.cache.delete('subscription_status');

        await await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `language_id` = '" + language_id + "'");
    }

    /**
     * @param language_id
     *
     * @return array
     */
    async getLanguage(language_id) {
        let query = await await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "language` WHERE `language_id` = '" + language_id + "'");

        let language = query.row;

        if (language) {
            language['image'] = HTTP_CATALOG;

            if (!language['extension']) {
                language['image'] += 'catalog/';
            } else {
                language['image'] += 'extension/' + language['extension'] + '/catalog/';
            }

            language['image'] += 'language/' + language['code'] + '/' + language['code'] + '+png';
        }

        return language;
    }

    /**
     * @param code
     *
     * @return array
     */
    async getLanguageByCode(code) {
        let query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "language` WHERE `code` = '" + this.db.escape(code) + "'");

        let language = query.row;

        if (language) {
            language['image'] = HTTP_CATALOG;

            if (!language['extension']) {
                language['image'] += 'catalog/';
            } else {
                language['image'] += 'extension/' + language['extension'] + '/catalog/';
            }

            language['image'] += 'language/' + language['code'] + '/' + language['code'] + '+png';
        }

        return language;
    }

    /**
     * @param array data
     *
     * @return array
     */
    async getLanguages(data = {}) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "language`";
        let sort_data = [
            'name',
            'code',
            'sort_order'
        ];
        if (data['sort'] && sort_data.includes(data['sort'])) {
            sql += " ORDER BY " + data['sort'];
        } else {
            sql += " ORDER BY `sort_order`, `name`";
        }
        if (data['order'] && data['order'] == 'DESC') {
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

        let results = await this.cache.get('language+' + crypto.createHash('md5').update(sql).digest('hex'));

        if (!results) {
            let query = await await this.db.query(sql);

            results = query.rows;

            await this.cache.set('language+' + crypto.createHash('md5').update(sql).digest('hex'), results);
        }

        let language_data = {};

        for (let result of results) {
            let image = HTTP_CATALOG;

            if (!result['extension']) {
                image += 'catalog/';
            } else {
                image += 'extension/' + result['extension'] + '/catalog/';
            }

            language_data[result['code']] = {
                'language_id': result['language_id'],
                'name': result['name'],
                'code': result['code'],
                'image': image + 'language/' + result['code'] + '/' + result['code'] + '+png',
                'locale': result['locale'],
                'extension': result['extension'],
                'sort_order': result['sort_order'],
                'status': result['status']
            };
        }

        return language_data;
    }

    /**
     * @return int
     */
    async getTotalLanguages() {
        let query = await await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "language`");

        return query.row['total'];
    }
}