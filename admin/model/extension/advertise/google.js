const array_merge = require("locutus/php/array/array_merge");
const implode = require("locutus/php/strings/implode");

const Googleshopping = require(DIR_SYSTEM + 'library/googleshopping/googleshopping');
module.exports = class ModelExtensionAdvertiseGoogle extends Model {
    events = {
        'admin/view/common/column_left/before': [
            'extension/advertise/google/admin_link',
        ],
        'admin/model/catalog/product/addProduct/after': [
            'extension/advertise/google/addProduct',
        ],
        'admin/model/catalog/product/copyProduct/after': [
            'extension/advertise/google/copyProduct',
        ],
        'admin/model/catalog/product/deleteProduct/after': [
            'extension/advertise/google/deleteProduct',
        ],
        'catalog/controller/checkout/success/before': [
            'extension/advertise/google/before_checkout_success'
        ],
        'catalog/view/common/header/after': [
            'extension/advertise/google/google_global_site_tag'
        ],
        'catalog/view/common/success/after': [
            'extension/advertise/google/google_dynamic_remarketing_purchase'
        ],
        'catalog/view/product/product/after': [
            'extension/advertise/google/google_dynamic_remarketing_product'
        ],
        'catalog/view/product/search/after': [
            'extension/advertise/google/google_dynamic_remarketing_searchresults'
        ],
        'catalog/view/product/category/after': [
            'extension/advertise/google/google_dynamic_remarketing_category'
        ],
        'catalog/view/common/home/after': [
            'extension/advertise/google/google_dynamic_remarketing_home'
        ],
        'catalog/view/checkout/cart/after': [
            'extension/advertise/google/google_dynamic_remarketing_cart'
        ]
    };

    rename_tables = {
        'advertise_google_target': 'googleshopping_target',
        'category_to_google_product_category': 'googleshopping_category',
        'product_advertise_google_status': 'googleshopping_product_status',
        'product_advertise_google_target': 'googleshopping_product_target',
        'product_advertise_google': 'googleshopping_product'
    };

    table_columns = {
        'googleshopping_target': [
            'advertise_google_target_id',
            'store_id',
            'campaign_name',
            'country',
            'budget',
            'feeds',
            'status'
        ],
        'googleshopping_category': [
            'google_product_category',
            'store_id',
            'category_id'
        ],
        'googleshopping_product_status': [
            'product_id',
            'store_id',
            'product_variation_id',
            'destination_statuses',
            'data_quality_issues',
            'item_level_issues',
            'google_expiration_date'
        ],
        'googleshopping_product_target': [
            'product_id',
            'store_id',
            'advertise_google_target_id'
        ],
        'googleshopping_product': [
            'product_advertise_google_id',
            'product_id',
            'store_id',
            'has_issues',
            'destination_status',
            'impressions',
            'clicks',
            'conversions',
            'cost',
            'conversion_value',
            'google_product_category',
            'condition',
            'adult',
            'multipack',
            'is_bundle',
            'age_group',
            'color',
            'gender',
            'size_type',
            'size_system',
            'size',
            'is_modified'
        ]
    };

    async isAppIdUsed(app_id, store_id) {
        let sql = "SELECT `store_id` FROM `" + DB_PREFIX + "setting` WHERE `key`='advertise_google_app_id' AND `value`='" + this.db.escape(store_id) + "' AND `store_id`!=" + store_id + " LIMIT 1";

        let result = await this.db.query(sql);

        if (result.num_rows > 0) {
            try {
                let googleshopping = new Googleshopping(this.registry, result.row['store_id']);

                return googleshopping.isConnected();
            } catch (e) {
                return false;
            }
        }

        return false;
    }

    async getFinalProductId() {
        let sql = "SELECT product_id FROM `" + DB_PREFIX + "product` ORDER BY product_id DESC LIMIT 1";

        let result = await this.db.query(sql);

        if (result.num_rows > 0) {
            return result.row['product_id'];
        }

        return null;
    }

    async isAnyProductCategoryModified(store_id) {
        let sql = "SELECT pag.is_modified FROM `" + DB_PREFIX + "googleshopping_product` pag WHERE pag.google_product_category IS NOT NULL AND pag.store_id=" + store_id + " LIMIT 0,1";

        return await this.db.query(sql).num_rows > 0;
    }

    async getAdvertisedCount(store_id) {
        let result = await this.db.query("SELECT COUNT(product_id) as total FROM `" + DB_PREFIX + "googleshopping_product_target` WHERE store_id=" + store_id + " GROUP BY `product_id`");

        return result.num_rows > 0 ? result.row['total'] : 0;
    }

    async getMapping(store_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "googleshopping_category` WHERE store_id=" + store_id;

        return await this.db.query(sql).rows;
    }

    async setCategoryMapping(google_product_category, store_id, category_id) {
        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_category` SET `google_product_category`='" + this.db.escape(google_product_category) + "', `store_id`=" + store_id + ", `category_id`=" + category_id + " ON DUPLICATE KEY UPDATE `category_id`=" + category_id;

        await this.db.query(sql);
    }

    async getMappedCategory(google_product_category, store_id) {
        let sql = "SELECT GROUP_CONCAT(cd.name ORDER BY cp.level SEPARATOR '&nbsp;&nbsp;&gt;&nbsp;&nbsp;') AS name, cp.category_id FROM " + DB_PREFIX + "category_path cp LEFT JOIN " + DB_PREFIX + "category_description cd ON (cp.path_id = cd.category_id) LEFT JOIN `" + DB_PREFIX + "googleshopping_category` c2gpc ON (c2gpc.category_id = cp.category_id) WHERE cd.language_id=" + this.config.get('config_language_id') + " AND c2gpc.google_product_category='" + this.db.escape(google_product_category) + "' AND c2gpc.store_id=" + store_id;

        let result = await this.db.query(sql);

        if (result.num_rows > 0) {
            return result.row;
        }

        return null;
    }

    async getProductByProductAdvertiseGoogleId(product_advertise_google_id) {
        let sql = "SELECT pag.product_id FROM `" + DB_PREFIX + "googleshopping_product` pag WHERE pag.product_advertise_google_id=" + product_advertise_google_id;

        let result = await this.db.query(sql);

        if (result.num_rows) {
            this.load.model('catalog/product', this);

            return await this.model_catalog_product.getProduct(result.row['product_id']);
        }
    }

    async getProductAdvertiseGoogle(product_advertise_google_id) {
        let sql = "SELECT pag.* FROM `" + DB_PREFIX + "googleshopping_product` pag WHERE pag.product_advertise_google_id=" + product_advertise_google_id;

        return await this.db.query(sql).row;
    }

    async hasActiveTarget(store_id) {
        let sql = "SELECT agt.advertise_google_target_id FROM `" + DB_PREFIX + "googleshopping_target` agt WHERE agt.store_id=" + store_id + " AND agt.status='active' LIMIT 1";

        return await this.db.query(sql).num_rows > 0;
    }

    async getRequiredFieldsByProductIds(product_ids, store_id) {
        this.load.config('googleshopping/googleshopping');

        let result = {};
        let countries = await this.getTargetCountriesByProductIds(product_ids, store_id);

        for (let country of countries) {
            for (let [field, requirements] of Object.entries(this.config.get('advertise_google_country_required_fields'))) {
                if (
                    ((requirements['countries']) && requirements['countries'].includes(country))
                    ||
                    (Array.isArray(requirements['countries']) && !requirements['countries'])
                ) {
                    result[field] = requirements;
                }
            }
        }

        return result;
    }

    async getRequiredFieldsByFilter(data, store_id) {
        this.load.config('googleshopping/googleshopping');

        let result = {};
        const countries = await this.getTargetCountriesByFilter(data, store_id);

        for (let country of countries) {
            for (let [field, requirements] of Object.entries(this.config.get('advertise_google_country_required_fields'))) {
                if (
                    ((requirements['countries']) && requirements['countries'].includes(country))
                    ||
                    (Array.isArray(requirements['countries']) && !requirements['countries'])
                ) {
                    result[field] = requirements;
                }
            }
        }

        return result;
    }

    async getTargetCountriesByProductIds(product_ids, store_id) {
        let sql = "SELECT DISTINCT agt.country FROM `" + DB_PREFIX + "googleshopping_product_target` pagt LEFT JOIN `" + DB_PREFIX + "googleshopping_target` agt ON (agt.advertise_google_target_id = pagt.advertise_google_target_id AND agt.store_id = pagt.store_id) WHERE pagt.product_id IN (" + await this.googleshopping.productIdsToIntegerExpression(product_ids) + ") AND pagt.store_id=" + store_id;

        return (await this.db.query(sql)).rows.map(a => {
            return this.country(a);
        });
    }

    async getTargetCountriesByFilter(data, store_id) {
        let sql = "SELECT DISTINCT agt.country FROM `" + DB_PREFIX + "googleshopping_product_target` pagt LEFT JOIN `" + DB_PREFIX + "googleshopping_target` agt ON (agt.advertise_google_target_id = pagt.advertise_google_target_id AND agt.store_id = pagt.store_id) LEFT JOIN `" + DB_PREFIX + "product` p ON (pagt.product_id = p.product_id) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = pagt.product_id) WHERE pagt.store_id=" + store_id + " AND pd.language_id=" + this.config.get('config_language_id');

        sql = this.googleshopping.applyFilter(sql, data);

        return (await this.db.query(sql).rows).map(a => this.country(a));
    }

    async getProductOptionsByProductIds(product_ids) {
        let sql = "SELECT po.option_id, od.name FROM `" + DB_PREFIX + "product_option` po LEFT JOIN `" + DB_PREFIX + "option_description` od ON (od.option_id=po.option_id AND od.language_id=" + this.config.get('config_language_id') + ") LEFT JOIN `" + DB_PREFIX + "option` o ON (o.option_id = po.option_id) WHERE o.type IN ('select', 'radio') AND po.product_id IN (" + await this.googleshopping.productIdsToIntegerExpression(product_ids) + ")";

        return await this.db.query(sql).rows;
    }

    async getProductOptionsByFilter(data) {
        sql = "SELECT DISTINCT po.option_id, od.name FROM `" + DB_PREFIX + "product_option` po LEFT JOIN `" + DB_PREFIX + "option_description` od ON (od.option_id=po.option_id AND od.language_id=" + this.config.get('config_language_id') + ") LEFT JOIN `" + DB_PREFIX + "option` o ON (o.option_id = po.option_id) LEFT JOIN `" + DB_PREFIX + "product` p ON (po.product_id = p.product_id) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = po.product_id) WHERE o.type IN ('select', 'radio') AND pd.language_id=" + this.config.get('config_language_id');

        sql = this.googleshopping.applyFilter(sql, data);

        return await this.db.query(sql).rows;
    }

    async addTarget(target, store_id) {
        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_target` SET `store_id`=" + store_id + ", `campaign_name`='" + this.db.escape(target['campaign_name']) + "', `country`='" + this.db.escape(target['country']) + "', `budget`='" + target['budget'] + "', `feeds`='" + this.db.escape(JSON.stringify(target['feeds'])) + "', `date_added`=NOW(), `roas`=" + target['roas'] + " , `status`='" + this.db.escape(target['status']) + "'";

        await this.db.query(sql);

        return this.db.getLastId();
    }

    async deleteProducts(product_ids) {
        let sql = "DELETE FROM `" + DB_PREFIX + "googleshopping_product` WHERE `product_id` IN (" + await this.googleshopping.productIdsToIntegerExpression(product_ids) + ")";

        await this.db.query(sql);

        sql = "DELETE FROM `" + DB_PREFIX + "googleshopping_product_target` WHERE `product_id` IN (" + await this.googleshopping.productIdsToIntegerExpression(product_ids) + ")";

        await this.db.query(sql);

        sql = "DELETE FROM `" + DB_PREFIX + "googleshopping_product_status` WHERE `product_id` IN (" + await this.googleshopping.productIdsToIntegerExpression(product_ids) + ")";

        await this.db.query(sql);

        return true;
    }

    async setAdvertisingBySelect(post_product_ids, post_target_ids, store_id) {
        if ((post_product_ids)) {
            let product_ids = post_product_ids.map(a => this.googleshopping.integer(a));

            let product_ids_expression = product_ids.join(',');

            await this.db.query("DELETE FROM `" + DB_PREFIX + "googleshopping_product_target` WHERE product_id IN (" + product_ids_expression + ") AND store_id=" + store_id);

            if ((post_target_ids)) {
                let target_ids = post_target_ids.map(a => this.googleshopping.integer(a));

                let values = {};

                for (let product_id of product_ids) {
                    for (let target_id of target_ids) {
                        values.push('(' + product_id + ',' + store_id + ',' + target_id + ')');
                    }
                }

                let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product_target` (`product_id`, `store_id`, `advertise_google_target_id`) VALUES " + values.join(',');

                await this.db.query(sql);
            }
        }
    }

    async setAdvertisingByFilter(data, post_target_ids, store_id) {
        let sql = "DELETE pagt FROM `" + DB_PREFIX + "googleshopping_product_target` pagt LEFT JOIN `" + DB_PREFIX + "product` p ON (pagt.product_id = p.product_id) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = p.product_id) WHERE pd.language_id=" + this.config.get('config_language_id');

        sql = this.googleshopping.applyFilter(sql, data);

        await this.db.query(sql);

        if ((post_target_ids)) {
            let target_ids = post_target_ids.map(a => this.googleshopping.integer(a));

            let insert_sql = "SELECT p.product_id, " + store_id + " as store_id, '{TARGET_ID}' as advertise_google_target_id FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = p.product_id) WHERE pd.language_id=" + this.config.get('config_language_id');

            insert_sql = this.googleshopping.applyFilter(insert_sql, data);

            for (let target_id of target_ids) {
                sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product_target` (`product_id`, `store_id`, `advertise_google_target_id`) " + str_replace('{TARGET_ID}', target_id, insert_sql);

                await this.db.query(sql);
            }
        }
    }

    async insertNewProducts(product_ids, store_id) {
        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product` (`product_id`, `store_id`, `google_product_category`) SELECT p.product_id, p2s.store_id, (SELECT c2gpc.google_product_category FROM `" + DB_PREFIX + "product_to_category` p2c LEFT JOIN `" + DB_PREFIX + "category_path` cp ON (p2c.category_id = cp.category_id) LEFT JOIN `" + DB_PREFIX + "googleshopping_category` c2gpc ON (c2gpc.category_id = cp.path_id AND c2gpc.store_id = " + store_id + ") WHERE p2c.product_id = p.product_id AND c2gpc.google_product_category IS NOT NULL ORDER BY cp.level DESC LIMIT 0,1) as `google_product_category` FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_to_store` p2s ON (p2s.product_id = p.product_id AND p2s.store_id = " + store_id + ") LEFT JOIN `" + DB_PREFIX + "googleshopping_product` pag ON (pag.product_id = p.product_id AND pag.store_id=p2s.store_id) WHERE pag.product_id IS NULL AND p2s.store_id IS NOT NULL";

        if ((product_ids)) {
            sql += " AND p.product_id IN (" + await this.googleshopping.productIdsToIntegerExpression(product_ids) + ")";
        }

        await this.db.query(sql);
    }

    async updateGoogleProductCategoryMapping(store_id) {
        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product` (`product_id`, `store_id`, `google_product_category`) SELECT p.product_id, " + store_id + " as store_id, (SELECT c2gpc.google_product_category FROM `" + DB_PREFIX + "product_to_category` p2c LEFT JOIN `" + DB_PREFIX + "category_path` cp ON (p2c.category_id = cp.category_id) LEFT JOIN `" + DB_PREFIX + "googleshopping_category` c2gpc ON (c2gpc.category_id = cp.path_id AND c2gpc.store_id = " + store_id + ") WHERE p2c.product_id = p.product_id AND c2gpc.google_product_category IS NOT NULL ORDER BY cp.level DESC LIMIT 0,1) as `google_product_category` FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "googleshopping_product` pag ON (pag.product_id = p.product_id) WHERE pag.product_id IS NOT NULL ON DUPLICATE KEY UPDATE `google_product_category`=VALUES(`google_product_category`)";

        await this.db.query(sql);
    }

    async updateSingleProductFields(data) {
        let values = [];

        let entry = {};
        entry['product_id'] = data['product_id'];
        entry = array_merge(entry, this.makeInsertData(data));

        values.push("(" + implode(",", entry) + ")");

        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product` (`product_id`, `store_id`, `google_product_category`, `condition`, `adult`, `multipack`, `is_bundle`, `age_group`, `color`, `gender`, `size_type`, `size_system`, `size`, `is_modified`) VALUES " + implode(',', values) + " ON DUPLICATE KEY UPDATE " + this.makeOnDuplicateKeyData();

        await this.db.query(sql);
    }

    async updateMultipleProductFields(filter_data, data) {
        let insert_sql = "SELECT p.product_id, {INSERT_DATA} FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = p.product_id) WHERE pd.language_id=" + this.config.get('config_language_id');

        insert_sql = this.googleshopping.applyFilter(insert_sql, filter_data);

        let insert_data = [];
        let keys = [];
        keys.push("`product_id`");

        for (let [key, value] of Object.entries(this.makeInsertData(data))) {
            insert_data.push(value + " as `" + key + "`");
            keys.push("`" + key + "`");
        }

        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product` (" + implode(", ", keys) + ") " + str_replace('{INSERT_DATA}', implode(", ", insert_data), insert_sql) + " ON DUPLICATE KEY UPDATE " + this.makeOnDuplicateKeyData();

        await this.db.query(sql);
    }

    async makeInsertData(data) {
        let insert_data = {};

        insert_data['store_id'] = data['store_id'];
        insert_data['google_product_category'] = "'" + this.db.escape(data['google_product_category']) + "'";
        insert_data['condition'] = "'" + this.db.escape(data['condition']) + "'";
        insert_data['adult'] = data['adult'];
        insert_data['multipack'] = data['multipack'];
        insert_data['is_bundle'] = data['is_bundle'];
        insert_data['age_group'] = "'" + this.db.escape(data['age_group']) + "'";
        insert_data['color'] = data['color'];
        insert_data['gender'] = "'" + this.db.escape(data['gender']) + "'";
        insert_data['size_type'] = "'" + this.db.escape(data['size_type']) + "'";
        insert_data['size_system'] = "'" + this.db.escape(data['size_system']) + "'";
        insert_data['size'] = data['size'];
        insert_data['is_modified'] = 1;

        return insert_data;
    }

    async makeOnDuplicateKeyData() {
        return "`google_product_category`=VALUES(`google_product_category`), `condition`=VALUES(`condition`), `adult`=VALUES(`adult`), `multipack`=VALUES(`multipack`), `is_bundle`=VALUES(`is_bundle`), `age_group`=VALUES(`age_group`), `color`=VALUES(`color`), `gender`=VALUES(`gender`), `size_type`=VALUES(`size_type`), `size_system`=VALUES(`size_system`), `size`=VALUES(`size`), `is_modified`=VALUES(`is_modified`)";
    }

    async getCategories(data, store_id) {
        let sql = "SELECT cp.category_id AS category_id, GROUP_CONCAT(cd1.name ORDER BY cp.level SEPARATOR '&nbsp;&nbsp;&gt;&nbsp;&nbsp;') AS name, c1.parent_id, c1.sort_order FROM " + DB_PREFIX + "category_path cp LEFT JOIN `" + DB_PREFIX + "category_to_store` c2s ON (c2s.category_id = cp.category_id AND c2s.store_id=" + store_id + ") LEFT JOIN " + DB_PREFIX + "category c1 ON (cp.category_id = c1.category_id) LEFT JOIN " + DB_PREFIX + "category c2 ON (cp.path_id = c2.category_id) LEFT JOIN " + DB_PREFIX + "category_description cd1 ON (cp.path_id = cd1.category_id) LEFT JOIN " + DB_PREFIX + "category_description cd2 ON (cp.category_id = cd2.category_id) WHERE c2s.store_id IS NOT NULL AND cd1.language_id = '" + this.config.get('config_language_id') + "' AND cd2.language_id = '" + this.config.get('config_language_id') + "'";

        if ((data['filter_name'])) {
            sql += " AND cd2.name LIKE '%" + this.db.escape(data['filter_name']) + "%'";
        }

        sql += " GROUP BY cp.category_id";

        let sort_data = [
            'name',
            'sort_order'
        ];

        if ((data['sort']) && sort_data.includes(data['sort'])) {
            sql += " ORDER BY " + data['sort'];
        } else {
            sql += " ORDER BY sort_order";
        }

        if ((data['order']) && (data['order'] == 'DESC')) {
            sql += " DESC";
        } else {
            sql += " ASC";
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

        const query = await this.db.query(sql);

        return query.rows;
    }

    async getProductCampaigns(product_id, store_id) {
        let sql = "SELECT agt.advertise_google_target_id, agt.campaign_name FROM `" + DB_PREFIX + "googleshopping_product_target` pagt LEFT JOIN `" + DB_PREFIX + "googleshopping_target` agt ON (pagt.advertise_google_target_id = agt.advertise_google_target_id) WHERE pagt.product_id=" + product_id + " AND pagt.store_id=" + store_id;

        return await this.db.query(sql).rows;
    }

    async getProductIssues(product_id, store_id) {
        this.load.model('localisation/language', this);

        let sql = "SELECT pag.color, pag.size, pd.name, p.model FROM `" + DB_PREFIX + "googleshopping_product` pag LEFT JOIN `" + DB_PREFIX + "product` p ON (p.product_id = pag.product_id) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = pag.product_id AND pd.language_id=" + this.config.get('config_language_id') + ") WHERE pag.product_id=" + product_id + " AND pag.store_id=" + store_id;

        const product_info = await this.db.query(sql).row;

        if ((product_info)) {
            let result = {};
            result['name'] = product_info['name'];
            result['model'] = product_info['model'];
            result['entries'] = {};

            for (let language of await this.model_localisation_language.getLanguages()) {
                let language_id = language['language_id'];
                let groups = await this.googleshopping.getGroups(product_id, language_id, product_info['color'], product_info['size']);

                result['entries'][language_id] = {
                    'language_name': language['name'],
                    'issues': []
                };

                for (let [id, group] of Object.entries(groups)) {
                    let issues = await this.db.query("SELECT * FROM `" + DB_PREFIX + "googleshopping_product_status` WHERE product_id=" + product_id + " AND store_id=" + store_id + " AND product_variation_id='" + this.db.escape(id) + "'").row;

                    destination_statuses = (issues['destination_statuses']) ? JSON.parse(issues['destination_statuses']) : {};
                    data_quality_issues = (issues['data_quality_issues']) ? JSON.parse(issues['data_quality_issues']) : {};
                    item_level_issues = (issues['item_level_issues']) ? JSON.parse(issues['item_level_issues']) : {};
                    let google_expiration_date = (issues['google_expiration_date']) ? date(this.language.get('datetime_format'), issues['google_expiration_date']) : this.language.get('text_na');

                    result['entries'][language_id]['issues'].push({
                        'color': group['color'] != "" ? group['color'] : this.language.get('text_na'),
                        'size': group['size'] != "" ? group['size'] : this.language.get('text_na'),
                        'destination_statuses': destination_statuses,
                        'data_quality_issues': data_quality_issues,
                        'item_level_issues': item_level_issues,
                        'google_expiration_date': google_expiration_date
                    });
                }
            }

            return result;
        }

        return null;
    }

    /*
     * Shortly after releasing the extension, 
     * we learned that the table names are actually 
     * clashing with third-party extensions. 
     * Hence, this renaming script was created.
     */
    async renameTables() {
        for (let [old_table, new_table] of Object.entries(this.rename_tables)) {
            let new_table_name = DB_PREFIX + new_table;
            let old_table_name = DB_PREFIX + old_table;
            if (await this.tableExists(old_table_name) && !await this.tableExists(new_table_name) && await this.tableColumnsMatch(old_table_name, this.table_columns[new_table])) {
                await this.db.query("RENAME TABLE `" + old_table_name + "` TO `" + new_table_name + "`");
            }
        }
    }

    async tableExists(table) {
        return await this.db.query("SHOW TABLES LIKE '" + table + "'").num_rows > 0;
    }

    async tableColumnsMatch(table, columns) {
        const num_columns = await this.db.query("SHOW COLUMNS FROM `" + table + "` WHERE Field IN (" + implode(',', this.wrap(columns, '"')) + ")").num_rows;

        return num_columns == columns.length;
    }

    async wrap(text, char) {
        if (Array.isArray(text)) {
            for (let string of text) {
                string = char + string + char;
            }

            return text;
        } else {
            return char + text + char;
        }
    }

    async createTables() {
        let sql = `CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}googleshopping_product\` (
            \`product_advertise_google_id\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            \`product_id\` INT(11),
            \`store_id\` INT(11) NOT NULL DEFAULT '0',
            \`has_issues\` TINYINT(1),
            \`destination_status\` ENUM('pending','approved','disapproved') NOT NULL DEFAULT 'pending',
            \`impressions\` INT(11) NOT NULL DEFAULT '0',
            \`clicks\` INT(11) NOT NULL DEFAULT '0',
            \`conversions\` INT(11) NOT NULL DEFAULT '0.0000',
            \`cost\` decimal(15,4) NOT NULL DEFAULT '0.0000',
            \`conversion_value\` decimal(15,4) NOT NULL DEFAULT '0.0000',
            \`google_product_category\` VARCHAR(10),
            \`condition\` ENUM('new','refurbished','used'),
            \`adult\` TINYINT(1),
            \`multipack\` INT(11),
            \`is_bundle\` TINYINT(1),
            \`age_group\` ENUM('newborn','infant','toddler','kids','adult'),
            \`color\` INT(11),
            \`gender\` ENUM('male','female','unisex'),
            \`size_type\` ENUM('regular','petite','plus','big and tall','maternity'),
            \`size_system\` ENUM('AU','BR','CN','DE','EU','FR','IT','JP','MEX','UK','US'),
            \`size\` INT(11),
            \`is_modified\` TINYINT(1) NOT NULL DEFAULT '0',
            PRIMARY KEY (\`product_advertise_google_id\`),
            UNIQUE \`product_id_store_id\` (\`product_id\`, \`store_id\`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8`;
        await this.db.query(sql);

        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "googleshopping_product_status` ( `product_id` INT(11), `store_id` INT(11) NOT NULL DEFAULT '0', `product_variation_id` varchar(64), `destination_statuses` TEXT NOT NULL, `data_quality_issues` TEXT NOT NULL, `item_level_issues` TEXT NOT NULL,  `google_expiration_date` INT(11) NOT NULL DEFAULT '0', PRIMARY KEY(`product_id`, `store_id`, `product_variation_id`) ) ENGINE = MyISAM DEFAULT CHARSET = utf8");

        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "googleshopping_product_target` ( `product_id` INT(11) NOT NULL, `store_id` INT(11) NOT NULL DEFAULT '0', `advertise_google_target_id` INT(11) UNSIGNED NOT NULL, PRIMARY KEY(`product_id`, `advertise_google_target_id`) ) ENGINE = MyISAM DEFAULT CHARSET = utf8");

        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "googleshopping_category` (`google_product_category` VARCHAR(10) NOT NULL, `store_id` INT(11) NOT NULL DEFAULT '0', `category_id` INT(11) NOT NULL, INDEX`category_id_store_id`(`category_id`, `store_id`), PRIMARY KEY(`google_product_category`, `store_id`) ) ENGINE = MyISAM DEFAULT CHARSET = utf8");

        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "googleshopping_target` ( `advertise_google_target_id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, `store_id` INT(11) NOT NULL DEFAULT '0', `campaign_name` varchar(255) NOT NULL DEFAULT '', `country` varchar(2) NOT NULL DEFAULT '', `budget` decimal(15, 4) NOT NULL DEFAULT '0.0000', `feeds` text NOT NULL, `date_added` DATE, `roas` INT(11) NOT NULL DEFAULT '0', `status` ENUM('paused', 'active') NOT NULL DEFAULT 'paused', INDEX`store_id`(`store_id`), PRIMARY KEY(`advertise_google_target_id`) ) ENGINE = MyISAM DEFAULT CHARSET = utf8");
    }

    async fixColumns() {
        const has_auto_increment = await this.db.query("SHOW COLUMNS FROM `" + DB_PREFIX + "googleshopping_product` WHERE Field='product_advertise_google_id' AND Extra LIKE '%auto_increment%'").num_rows > 0;

        if (!has_auto_increment) {
            await this.db.query("ALTER TABLE " + DB_PREFIX + "googleshopping_product MODIFY COLUMN product_advertise_google_id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT");
        }

        const has_unique_key = (await this.db.query("SHOW INDEX FROM `" + DB_PREFIX + "googleshopping_product` WHERE Key_name='product_id_store_id' AND Non_unique=0")).num_rows == 2;
        // console.log(has_unique_key)
        if (!has_unique_key) {
            const index_exists = await this.db.query("SHOW INDEX FROM `" + DB_PREFIX + "googleshopping_product` WHERE Key_name='product_id_store_id'").num_rows > 0;

            if (index_exists) {
                await this.db.query("ALTER TABLE `" + DB_PREFIX + "googleshopping_product` DROP INDEX product_id_store_id;");
            }

            await this.db.query("CREATE UNIQUE INDEX product_id_store_id ON `" + DB_PREFIX + "googleshopping_product` (product_id, store_id)");
        }

        const has_date_added_column = (await this.db.query("SHOW COLUMNS FROM `" + DB_PREFIX + "googleshopping_target` WHERE Field='date_added'")).num_rows > 0;

        if (!has_date_added_column) {
            await this.db.query("ALTER TABLE " + DB_PREFIX + "googleshopping_target ADD COLUMN date_added DATE");

            await this.db.query("UPDATE " + DB_PREFIX + "googleshopping_target SET date_added = NOW() WHERE date_added IS NULL");
        }

        const has_roas_column = (await this.db.query("SHOW COLUMNS FROM `" + DB_PREFIX + "googleshopping_target` WHERE Field='roas'")).num_rows > 0;

        if (!has_roas_column) {
            await this.db.query("ALTER TABLE " + DB_PREFIX + "googleshopping_target ADD COLUMN roas INT(11) NOT NULL DEFAULT '0'");
        }
    }

    async dropTables() {
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "googleshopping_target`");
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "googleshopping_category`");
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "googleshopping_product_status`");
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "googleshopping_product_target`");
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "googleshopping_product`");
    }

    async deleteEvents() {
        this.load.model('setting/event', this);

        await this.model_setting_event.deleteEventByCode('advertise_google');
    }

    async createEvents() {
        this.load.model('setting/event', this);

        for (let [trigger, actions] of Object.entries(this.events)) {
            for (let action of actions) {
                await this.model_setting_event.addEvent('advertise_google', trigger, action, 1, 0);
            }
        }
    }

    async getAllowedTargets() {
        this.load.config('googleshopping/googleshopping');

        let result = [];

        for (let target of this.config.get('advertise_google_targets')) {
            result.push({
                'country': {
                    'code': target['country'],
                    'name': await this.googleshopping.getCountryName(target['country'])
                },
                'languages': await this.googleshopping.getLanguages(target['languages']),
                'currencies': await this.googleshopping.getCurrencies(target['currencies'])
            });
        }

        return result;
    }

    async country(row) {
        return row['country'];
    }
}
