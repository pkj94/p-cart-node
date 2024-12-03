const array_chunk = require("locutus/php/array/array_chunk");
const array_filter = require("locutus/php/array/array_filter");
const array_flip = require("locutus/php/array/array_flip");
const array_key_exists = require("locutus/php/array/array_key_exists");
const array_map = require("locutus/php/array/array_map");
const array_slice = require("locutus/php/array/array_slice");
const html_entity_decode = require("locutus/php/strings/html_entity_decode");
const split = require("locutus/php/strings/split");
const str_replace = require("locutus/php/strings/str_replace");
const strip_tags = require("locutus/php/strings/strip_tags");
const strtolower = require("locutus/php/strings/strtolower");
const trim = require("locutus/php/strings/trim");
const http_build_query = require("locutus/php/url/http_build_query");
const is_numeric = require("locutus/php/var/is_numeric");
const sharp = require("sharp");


const Library = require('./library')
module.exports = class Googleshopping extends Library {
    constructor(registry, store_id) {
        super(registry);
        this.store_id = store_id || 0;
        this.db = registry.get('db');
        this.API_URL = 'https://campaigns.opencart.com/';
        this.CACHE_CAMPAIGN_REPORT = 21600; // In seconds
        this.CACHE_PRODUCT_REPORT = 21600; // In seconds
        this.ROAS_WAIT_INTERVAL = 1209600; // In seconds
        this.MICROAMOUNT = 1000000;
        this.DEBUG_LOG_FILENAME = 'googleshopping.%s.log';
        this.ENDPOINT_ACCESS_TOKEN = 'api/access_token';
        this.ENDPOINT_ACCESS_TOKEN_TEST = 'api/access_token/test';
        this.ENDPOINT_CAMPAIGN_DELETE = 'api/campaign/delete';
        this.ENDPOINT_CAMPAIGN_STATUS = 'api/campaign/status';
        this.ENDPOINT_CAMPAIGN_TEST = 'api/campaign/test';
        this.ENDPOINT_CAMPAIGN_UPDATE = 'api/campaign/update';
        this.ENDPOINT_CONVERSION_TRACKER = 'api/conversion_tracker';
        this.ENDPOINT_DATAFEED_CLOSE = 'api/datafeed/close';
        this.ENDPOINT_DATAFEED_INIT = 'api/datafeed/init';
        this.ENDPOINT_DATAFEED_PUSH = 'api/datafeed/push';
        this.ENDPOINT_MERCHANT_AUTH_URL = 'api/merchant/authorize_url';
        this.ENDPOINT_MERCHANT_AVAILABLE_CARRIERS = 'api/merchant/available_carriers';
        this.ENDPOINT_MERCHANT_DISCONNECT = 'api/merchant/disconnect';
        this.ENDPOINT_MERCHANT_PRODUCT_STATUSES = 'api/merchant/product_statuses';
        this.ENDPOINT_MERCHANT_SHIPPING_TAXES = 'api/merchant/shipping_taxes';
        this.ENDPOINT_REPORT_AD = 'api/report/ad&interval=%s';
        this.ENDPOINT_REPORT_CAMPAIGN = 'api/report/campaign&interval=%s';
        this.ENDPOINT_VERIFY_IS_CLAIMED = 'api/verify/is_claimed';
        this.ENDPOINT_VERIFY_SITE = 'api/verify/site';
        this.ENDPOINT_VERIFY_TOKEN = 'api/verify/token';
        this.SCOPES = 'OC_FEED REPORT ADVERTISE';
    }
    async init() {
        this.load.model('setting/setting', this);
        if (Number(this.store_id) == 0) {
            this.store_url = expressPath.basename(DIR_TEMPLATE) == 'template' ? HTTPS_CATALOG : HTTPS_SERVER;
            this.store_name = this.config.get('config_name');
        } else {
            this.store_url = await this.model_setting_setting.getSettingValue('config_ssl', this.store_id);
            this.store_name = await this.model_setting_setting.getSettingValue('config_name', this.store_id);
        }

        this.endpoint_url = this.API_URL + '?route=%s';
        // console.log('store_id----', this.store_id, this.store_url)

        await this.loadStore(this.store_id || 0);

        this.debug_log = new Log(sprintf(this.DEBUG_LOG_FILENAME, this.store_id));
    }
    async getStoreUrl() {
        return this.store_url;
    }

    async getStoreName() {
        return this.store_name;
    }

    async getSupportedLanguageId(code) {
        this.load.model('localisation/language', this);

        for (let language of await this.model_localisation_language.getLanguages()) {
            const language_code = language.code.split('-')[0];

            if (await this.compareTrimmedLowercase(code, language_code) === 0) {
                return language['language_id'];
            }
        }

        return 0;
    }

    async getSupportedCurrencyId(code) {
        this.load.model('localisation/currency', this);

        for (let currency of await this.model_localisation_currency.getCurrencies()) {
            if (this.compareTrimmedLowercase(code, currency['code']) === 0) {
                return currency['currency_id'];
            }
        }

        return 0;
    }

    async getCountryName(code) {
        this.load.config('googleshopping/googleshopping');

        this.load.model('localisation/country', this);

        const countries = this.config.get('advertise_google_countries');

        // Default value
        let result = countries[code];

        // Override with store value, if present
        for (let store_country of await this.model_localisation_country.getCountries()) {
            if (await this.compareTrimmedLowercase(store_country['iso_code_2'], code) === 0) {
                result = store_country['name'];
                break;
            }
        }

        return result;
    }

    async compareTrimmedLowercase(text1, text2) {
        const trimmedLowercaseText1 = text1.trim().toLowerCase();
        const trimmedLowercaseText2 = text2.trim().toLowerCase();
        return trimmedLowercaseText1.localeCompare(trimmedLowercaseText2);
    }

    async getTargets(store_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "googleshopping_target` WHERE store_id=" + store_id;

        return array_map([this, 'target'], (await this.db.query(sql)).rows);
    }

    async getTarget(advertise_google_target_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "googleshopping_target` WHERE advertise_google_target_id=" + advertise_google_target_id;

        return this.target(await this.db.query(sql).row);
    }

    async editTarget(target_id, target) {
        let sql = "UPDATE `" + DB_PREFIX + "googleshopping_target` SET `campaign_name`='" + this.db.escape(target['campaign_name']) + "', `country`='" + this.db.escape(target['country']) + "', `budget`='" + target['budget'] + "', `feeds`='" + this.db.escape(JSON.stringify(target['feeds'])) + "', `roas`='" + target['roas'] + "', `status`='" + this.db.escape(target['status']) + "' WHERE `advertise_google_target_id`='" + target_id + "'";

        await this.db.query(sql);

        return target;
    }

    async deleteTarget(target_id) {
        let sql = "DELETE FROM `" + DB_PREFIX + "googleshopping_target` WHERE `advertise_google_target_id`='" + target_id + "'";

        await this.db.query(sql);

        sql = "DELETE FROM `" + DB_PREFIX + "googleshopping_product_target` WHERE `advertise_google_target_id`='" + target_id + "'";

        await this.db.query(sql);

        return true;
    }

    async doJob(job) {
        let product_count = 0;

        // Initialize push
        let init_request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_DATAFEED_INIT,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': {
                'work_id': job['work_id']
            }
        };

        let response = await this.api(init_request);

        // At this point, the job has been initialized and we can start pushing the datafeed
        let page = 0;
        let products = await this.getFeedProducts(++page, job['language_id'], job['currency'])
        while (null !== products) {
            let post = {};

            let post_data = {
                'product': products,
                'work_id': job['work_id'],
                'work_step': response['work_step']
            };

            post = await this.curlPostQuery(post_data, post);

            let push_request = {
                'type': 'POST',
                'endpoint': this.ENDPOINT_DATAFEED_PUSH,
                'use_access_token': true,
                'content_type': 'multipart/form-data',
                'data': post
            };

            response = await this.api(push_request);

            product_count += products.length;
        }

        // Finally, close the file to finish the job
        let close_request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_DATAFEED_CLOSE,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': {
                'work_id': job['work_id'],
                'work_step': response['work_step']
            }
        };

        await this.api(close_request);

        return product_count;
    }

    async getProductVariationIds(page) {
        this.load.config('googleshopping/googleshopping');

        let sql = "SELECT DISTINCT pag.product_id, pag.color, pag.size FROM `" + DB_PREFIX + "googleshopping_product` pag LEFT JOIN `" + DB_PREFIX + "product` p ON (p.product_id = pag.product_id) LEFT JOIN `" + DB_PREFIX + "product_to_store` p2s ON (p2s+product_id = p.product_id AND p2s+store_id=" + this.store_id + ") WHERE p2s+store_id IS NOT NULL AND p.status = 1 AND p.date_available <= NOW() AND p.price > 0 ORDER BY p.product_id ASC LIMIT " + ((page - 1) * this.config.get('advertise_google_report_limit')) + ', ' + this.config.get('advertise_google_report_limit');

        let result = {};

        this.load.model('localisation/language', this);

        for (let row of (await this.db.query(sql)).rows) {
            for (let language of await this.model_localisation_language.getLanguages()) {
                let groups = await this.getGroups(row['product_id'], language['language_id'], row['color'], row['size']);

                for (let id of Object.keys(groups)) {
                    if (!result.includes(id)) {
                        result.push(id);
                    }
                }
            }
        }

        return result.length ? result : null;
    }

    // A copy of the OpenCart SEO URL rewrite method+
    async rewrite(link) {
        let url_info = new URL(link.replaceAll('&amp;', '&'));

        let url = '';

        let data = {};

        const queryParams = new URLSearchParams(url_info.search);
        for (const [key, value] of queryParams.entries()) {
            data[key] = value;
        }

        for (let [key, value] of Object.entries(data)) {
            if ((data['route'])) {
                if ((data['route'] == 'product/product' && key == 'product_id') || ((data['route'] == 'product/manufacturer/info' || data['route'] == 'product/product') && key == 'manufacturer_id') || (data['route'] == 'information/information' && key == 'information_id')) {
                    const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE `query` = '" + this.db.escape(key + '=' + value) + "' AND store_id = '" + this.config.get('config_store_id') + "' AND language_id = '" + this.config.get('config_language_id') + "'");

                    if (query.num_rows && query.row['keyword']) {
                        url += '/' + query.row['keyword'];

                        delete data[key];
                    }
                } else if (key == 'path') {
                    let categories = value.split('_');

                    for (let category of categories) {
                        const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE `query` = 'category_id=" + category + "' AND store_id = '" + this.config.get('config_store_id') + "' AND language_id = '" + this.config.get('config_language_id') + "'");

                        if (query.num_rows && query.row['keyword']) {
                            url += '/' + query.row['keyword'];
                        } else {
                            url = '';

                            break;
                        }
                    }

                    delete data[key];
                }
            }
        }

        if (url) {
            delete data['route'];

            let query = '';

            if (data) {
                for (let [key, value] of Object.entries(data)) {
                    query += '&' + encodeURIComponent(key) + '=' + encodeURIComponent((Array.isArray(value) ? http_build_query(value) : value));
                }

                if (query) {
                    query = '?' + str_replace('&', '&amp;', trim(query, '&'));
                }
            }

            return url_info['scheme'] + '://' + url_info['host'] + ((url_info['port']) ? ':' + url_info['port'] : '') + str_replace('/index.js', '', url_info['path']) + url + query;
        } else {
            return link;
        }
    }
    async convertedTaxedPrice(value, tax_class_id, currency) {
        const taxedValue = this.tax.calculate(value, tax_class_id, this.config.get('tax'));
        const convertedValue = this.currency.convert(taxedValue, this.config.get('currency'), currency);
        return convertedValue.toFixed(2);
    }


    async getFeedProducts(page, language_id, currency) {
        let sql = await this.getFeedProductsQuery(page, language_id);

        let result = [];

        // await this.setRuntimeExceptionErrorHandler();

        for (let row of (await this.db.query(sql)).rows) {
            let image = '';
            try {
                if (row['image'] && is_file(DIR_IMAGE + row['image'])) {
                    image = await this.resize(row['image'], 250, 250);
                } else {
                    throw new Error("Image does not exist or cannot be read+");
                }
            } catch (e) {
                await this.output(sprintf("Error for product %s: %s", row['model'], e.getMessage()));

                image = this.resize('no_image+png', 250, 250);
            }

            let url = new Url(this.store_url, this.store_url);

            if (this.config.get('config_seo_url')) {
                await url.addRewrite(this);
            }

            let price = await this.convertedTaxedPrice(row['price'], row['tax_class_id'], currency);

            let special_price = null;

            if (row['special_price'] !== null) {
                parts = row['special_price'].split('<[S]>');

                special_price = {
                    'value': await this.convertedTaxedPrice(parts[0], row['tax_class_id'], currency),
                    'currency': currency
                };

                if (new Date(parts[1]) >= new Date('1970-01-01')) {
                    special_price['start'] = parts[1];
                }

                if (new Date(parts[2]) >= new Date('1970-01-01')) {
                    special_price['end'] = parts[2];
                }
            }

            let campaigns = [];
            let custom = {
                custom_label_0: '',
                custom_label_1: '',
                custom_label_2: '',
                custom_label_3: '',
                custom_label_4: ''
            }

            if (row['campaign_names']) {
                campaigns = row['campaign_names'].split('<[S]>');
                let i = 0;

                do {
                    custom['custom_label_' + (i++)] = trim(strtolower(campaigns.pop()));
                } while (campaigns);
            }

            let mpn = row['mpn'] ? row['mpn'] : '';
            let gtin = '';
            if (row['upc']) {
                gtin = row['upc'];
            } else if (row['ean']) {
                gtin = row['ean'];
            } else if (row['jan']) {
                gtin = row['jan'];
            } else if (row['isbn']) {
                gtin = row['isbn'];
            } else {
                gtin = '';
            }

            let base_row = {
                'adult': (row['adult']) ? 'yes' : 'no',
                'age_group': (row['age_group']) ? row['age_group'] : '',
                'availability': row['quantity'] > 0 && !this.config.get('config_maintenance') ? 'in stock' : 'out of stock',
                'brand': await this.sanitizeText(row['brand'], 70),
                'color': '',
                'condition': (row['condition']) ? row['condition'] : '',
                'custom_label_0': await this.sanitizeText(custom.custom_label_0, 100),
                'custom_label_1': await this.sanitizeText(custom.custom_label_1, 100),
                'custom_label_2': await this.sanitizeText(custom.custom_label_2, 100),
                'custom_label_3': await this.sanitizeText(custom.custom_label_3, 100),
                'custom_label_4': await this.sanitizeText(custom.custom_label_4, 100),
                'description': await this.sanitizeText(row['description'], 5000),
                'gender': (row['gender']) ? row['gender'] : '',
                'google_product_category': (row['google_product_category']) ? row['google_product_category'] : '',
                'id': await this.sanitizeText(row['product_id'], 50),
                'identifier_exists': (row['brand']) && (mpn) ? 'yes' : 'no',
                'image_link': await this.sanitizeText(image, 2000),
                'is_bundle': (row['is_bundle']) ? 'yes' : 'no',
                'item_group_id': await this.sanitizeText(row['product_id'], 50),
                'link': await this.sanitizeText(html_entity_decode(url.link('product/product', 'product_id=' + row['product_id'], true)), 2000),
                'mpn': await this.sanitizeText(mpn, 70),
                'gtin': await this.sanitizeText(gtin, 14),
                'multipack': (row['multipack']) && row['multipack'] >= 2 ? row['multipack'] : '', // Cannot be 1!!!
                'price': {
                    'value': price,
                    'currency': currency
                },
                'size': '',
                'size_system': (row['size_system']) ? row['size_system'] : '',
                'size_type': (row['size_type']) ? row['size_type'] : '',
                'title': await this.sanitizeText(row['name'], 150)
            };

            // Provide optional special price
            if (special_price !== null) {
                base_row['special_price'] = special_price;
            }

            let groups = await this.getGroups(row['product_id'], language_id, row['color'], row['size']);

            for (let [id, group] of Object.entries(groups)) {
                base_row['id'] = id;
                base_row['color'] = await this.sanitizeText(group['color'], 40);
                base_row['size'] = await this.sanitizeText(group['size'], 100);

                result.push(base_row);
            }
        }

        // await this.restoreErrorHandler();

        return (result) ? result : null;
    }

    async getGroups(product_id, language_id, color_id, size_id) {
        let options = {
            'color': await this.getProductOptionValueNames(product_id, language_id, color_id),
            'size': await this.getProductOptionValueNames(product_id, language_id, size_id)
        };

        let result = {};

        for (let group of await this.combineOptions(options)) {
            let key = product_id + '-' + md5(JSON.stringify({ 'color': group['color'], 'size': group['size'] }));

            result[key] = group;
        }

        return result;
    }

    async getProductOptionValueNames(product_id, language_id, option_id) {
        let sql = "SELECT DISTINCT pov.product_option_value_id, ovd.name FROM `" + DB_PREFIX + "product_option_value` pov LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (ovd.option_value_id = pov.option_value_id) WHERE pov.product_id=" + product_id + " AND pov.option_id=" + option_id + " AND ovd.language_id=" + language_id;

        let result = await this.db.query(sql);

        if (result.num_rows > 0) {
            let returns = {};
            const processText = (text) => {
                // Split the text using a regular expression to handle multiple delimiters
                const parts = text.split(/[,/;]+/i);

                // Trim each part
                const trimmedParts = parts.map(part => part.trim());

                // Filter out empty parts
                const filteredParts = trimmedParts.filter(part => part.length > 0);

                // Slice to get the first three parts
                const slicedParts = filteredParts.slice(0, 3);

                // Join the parts with '/'
                const result = slicedParts.join('/');

                return result;
            }
            for (let row of result.rows) {
                let text = await this.sanitizeText(row['name'], 100);

                let name = processText(text);

                returns[row['product_option_value_id']] = name;
            }

            return returns;
        }

        return {};
    }

    applyFilter(sql, data) {
        if ((data['filter_product_name'])) {
            sql += " AND pd.name LIKE '" + this.db.escape(data['filter_product_name']) + "%'";
        }

        if ((data['filter_product_model'])) {
            sql += " AND p.model LIKE '" + this.db.escape(data['filter_product_model']) + "%'";
        }

        if ((data['filter_category_id'])) {
            sql += " AND p.product_id IN (SELECT p2c_t+product_id FROM `" + DB_PREFIX + "category_path` cp_t LEFT JOIN `" + DB_PREFIX + "product_to_category` p2c_t ON (p2c_t+category_id=cp_t+category_id) WHERE cp_t+path_id=" + data['filter_category_id'] + ")";
        }

        if ((data['filter_is_modified']) && data['filter_is_modified'] !== "") {
            sql += " AND p.product_id IN (SELECT pag_t+product_id FROM `" + DB_PREFIX + "googleshopping_product` pag_t WHERE pag_t+is_modified=" + data['filter_is_modified'] + ")";
        }

        if ((data['filter_store_id'])) {
            sql += " AND p.product_id IN (SELECT p2s_t.product_id FROM `" + DB_PREFIX + "product_to_store` p2s_t WHERE p2s_t.store_id=" + data['filter_store_id'] + ")";
        }
        return sql
    }

    async getProducts(data, store_id) {
        let sql = "SELECT pag.*, p.product_id, p.image, pd.name, p.model FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.product_id = pd.product_id) LEFT JOIN `" + DB_PREFIX + "googleshopping_product` pag ON (pag.product_id = p.product_id AND pag.store_id = " + store_id + ") WHERE pag.store_id IS NOT NULL AND pd.language_id = '" + this.config.get('config_language_id') + "'";

        sql = this.applyFilter(sql, data);

        sql += " GROUP BY p.product_id";

        let sort_data = [
            'name',
            'model',
            'impressions',
            'clicks',
            'cost',
            'conversions',
            'conversion_value',
            'has_issues',
            'destination_status'
        ];

        if ((data['sort']) && sort_data.includes(data['sort'])) {
            sql += " ORDER BY " + data['sort'];
        } else {
            sql += " ORDER BY name";
        }

        if ((data['order']) && (data['order'] == 'DESC')) {
            sql += " DESC";
        } else {
            sql += " ASC";
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

        return this.db.query(sql).rows;
    }

    async getTotalProducts(data, store_id) {
        let sql = "SELECT COUNT(*) of total FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.product_id = pd.product_id) LEFT JOIN `" + DB_PREFIX + "googleshopping_product` pag ON (pag.product_id = p.product_id AND pag.store_id = " + store_id + ") WHERE pag.store_id IS NOT NULL AND pd.language_id = '" + this.config.get('config_language_id') + "'";

        sql = this.applyFilter(sql, data);

        return await this.db.query(sql).row['total'];
    }

    async getProductIds(data, store_id) {
        let result = [];

        this.load.model('localisation/language', this);

        for (let row of await this.getProducts(data, store_id)) {
            let product_id = row['product_id'];

            if (!result.includes(product_id)) {
                result.push(product_id);
            }
        }

        return result;
    }

    async clearProductStatuses(product_ids, store_id) {
        let sql = "UPDATE `" + DB_PREFIX + "googleshopping_product_status` SET `destination_statuses`='', `data_quality_issues`='', `item_level_issues`='', `google_expiration_date`=0 WHERE `product_id` IN (" + this.productIdsToIntegerExpression(product_ids) + ") AND `store_id`=" + store_id;

        await this.db.query(sql);

        sql = "UPDATE `" + DB_PREFIX + "googleshopping_product` SET `has_issues`=0, `destination_status`='pending' WHERE `product_id` IN (" + this.productIdsToIntegerExpression(product_ids) + ") AND `store_id`=" + store_id;

        await this.db.query(sql);
    }

    async productIdsToIntegerExpression(product_ids) {
        return product_ids.map(a => this.integer(a)).join(',')
    }

    integer(product_id) {
        if (!is_numeric(product_id)) {
            return 0;
        } else {
            return product_id;
        }
    }

    async cron() {
        // await this.enableErrorReporting();

        this.load.config('googleshopping/googleshopping');

        let report = [];

        report.push(await this.output("Starting CRON task for " + await this.getStoreUrl()));

        try {
            report.push(this.output("Refreshing access token."));

            await this.isConnected();
        } catch (e) {
            report.push(this.output(e.getMessage()));
        }

        let default_config_tax = this.config.get("config_tax");
        let default_config_store_id = this.config.get("config_store_id");
        let default_config_language_id = this.config.get("config_language_id");
        let default_config_seo_url = this.config.get("config_seo_url");

        // Do product feed uploads
        for (let job of await this.getJobs()) {
            try {
                report.push(await this.output("Uploading product feed+ Work ID: " + job['work_id']));

                // Set the tax context for the job
                if (job['countries'].includes("US")) {
                    // In case the feed is for the US, disable taxes because they are already configured on the merchant level by the extension
                    this.config.set("config_tax", 0);
                }

                // Set the store and language context for the job
                this.config.set("config_store_id", this.store_id);
                this.config.set("config_language_id", job['language_id']);
                this.config.set("config_seo_url", await this.model_setting_setting.getSettingValue("config_seo_url", this.store_id));

                // Do the CRON job
                let count = await this.doJob(job);

                // Reset the taxes, store, and language to their original state
                this.config.set("config_tax", default_config_tax);
                this.config.set("config_store_id", default_config_store_id);
                this.config.set("config_language_id", default_config_language_id);
                this.config.set("config_seo_url", default_config_seo_url);

                report.push(this.output("Uploaded count: " + count));
            } catch (e) {
                report.push(await this.output(e.getMessage()));
            }
        }

        // Reset the taxes, store, and language to their original state
        this.config.set("config_tax", default_config_tax);
        this.config.set("config_store_id", default_config_store_id);
        this.config.set("config_language_id", default_config_language_id);
        this.config.set("config_seo_url", default_config_seo_url);

        // Pull product reports
        report.push(this.output("Fetching product reports."));

        try {
            let report_count = 0;

            let page = 0;

            await this.clearReports();
            let product_variation_ids = await this.getProductVariationIds(++page);
            while (null !== product_variation_ids) {
                for (let chunk of array_chunk(product_variation_ids, this.config.get('advertise_google_report_limit'))) {
                    const product_reports = await this.getProductReports(chunk);

                    if ((product_reports)) {
                        awaitthis.updateProductReports(product_reports);
                        report_count += product_reports.length;
                    }
                }
            }
        } catch (e) {
            report.push(await this.output(e.getMessage()));
        }

        report.push(await this.output("Fetched report count: " + report_count));

        // Pull product statuses
        report.push(await this.output("Fetching product statuses+"));

        let page = 1;
        let status_count = 0;

        do {
            let filter_data = {
                'start': (page - 1) * this.config.get('advertise_google_product_status_limit'),
                'limit': this.config.get('advertise_google_product_status_limit')
            };

            page++;

            const product_variation_target_specific_ids = this.getProductVariationTargetSpecificIds(filter_data);

            try {
                // Fetch latest statuses from the API
                if ((product_variation_target_specific_ids)) {
                    const product_ids = await this.getProductIds(filter_data, this.store_id);

                    await this.clearProductStatuses(product_ids, this.store_id);

                    for (let chunk of array_chunk(product_variation_target_specific_ids, this.config.get('advertise_google_product_status_limit'))) {
                        const product_statuses = await this.getProductStatuses(chunk);

                        if ((product_statuses)) {
                            await this.updateProductStatuses(product_statuses);
                            status_count += product_statuses.length;
                        }
                    }
                }
            } catch (e) {
                report.push(await this.output(e.getMessage()));
            }
        } while ((product_variation_target_specific_ids));

        report.push(this.output("Fetched status count: " + status_count));

        report.push(this.output("CRON finished!"));

        await this.applyNewSetting('advertise_google_cron_last_executed', new Date().getTime());

        await this.sendEmailReport(report);
    }

    async getProductVariationTargetSpecificIds(data) {
        let result = [];

        let targets = await this.getTargets(this.store_id);

        for (let row of await this.getProducts(data, this.store_id)) {
            for (let target of targets) {
                for (let feed of target['feeds']) {
                    const language_code = feed['language'];

                    const language_id = await this.getSupportedLanguageId(language_code);

                    const groups = await this.getGroups(row['product_id'], language_id, row['color'], row['size']);

                    for (let id of Object.keys(groups)) {
                        let id_parts = [];
                        id_parts.push('online');
                        id_parts.push(language_code);
                        id_parts.push(target['country']['code']);
                        id_parts.push(id);

                        let result_id = id_parts.join(':');

                        if (!result.includes(result_id)) {
                            result.push(result_id);
                        }
                    }
                }
            }
        }

        return result;
    }

    async updateProductReports(reports) {
        let values = [];

        for (let report of reports) {
            let entry = {};
            entry['product_id'] = await this.getProductIdFromOfferId(report['offer_id']);
            entry['store_id'] = this.store_id;
            entry['impressions'] = report['impressions'];
            entry['clicks'] = report['clicks'];
            entry['conversions'] = report['conversions'];
            entry['cost'] = (report['cost']) / this.MICROAMOUNT;
            entry['conversion_value'] = report['conversion_value'];

            values.push("(" + entry.join(",") + ")");
        }

        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product` (`product_id`, `store_id`, `impressions`, `clicks`, `conversions`, `cost`, `conversion_value`) VALUES " + values.join(',') + " ON DUPLICATE KEY UPDATE `impressions`=`impressions` + VALUES(`impressions`), `clicks`=`clicks` + VALUES(`clicks`), `conversions`=`conversions` + VALUES(`conversions`), `cost`=`cost` + VALUES(`cost`), `conversion_value`=`conversion_value` + VALUES(`conversion_value`)";

        await this.db.query(sql);
    }

    async updateProductStatuses(statuses) {
        let product_advertise_google = [];
        let product_advertise_google_status = [];
        let product_level_entries = {};
        let entry_statuses = {};

        for (let status of statuses) {
            const product_id = await this.getProductIdFromTargetSpecificId(status['productId']);
            const product_variation_id = await this.getProductVariationIdFromTargetSpecificId(status['productId']);

            if (!(product_level_entries[product_id])) {
                product_level_entries[product_id] = {
                    'product_id': product_id,
                    'store_id': this.store_id,
                    'has_issues': 0,
                    'destination_status': 'pending'
                };
            }

            for (let destination_status of status['destinationStatuses']) {
                if (!destination_status['approvalPending']) {
                    switch (destination_status['approvalStatus']) {
                        case 'approved':
                            if (product_level_entries[product_id]['destination_status'] == 'pending') {
                                product_level_entries[product_id]['destination_status'] = 'approved';
                            }
                            break;
                        case 'disapproved':
                            product_level_entries[product_id]['destination_status'] = 'disapproved';
                            break;
                    }
                }
            }

            if (!product_level_entries[product_id]['has_issues']) {
                if ((status['dataQualityIssues']) || (status['itemLevelIssues'])) {
                    product_level_entries[product_id]['has_issues'] = 1;
                }
            }

            if (!(entry_statuses[product_variation_id])) {
                entry_statuses[product_variation_id] = {};

                entry_statuses[product_variation_id]['product_id'] = product_id;
                entry_statuses[product_variation_id]['store_id'] = this.store_id;
                entry_statuses[product_variation_id]['product_variation_id'] = "'" + this.db.escape(product_variation_id) + "'";
                entry_statuses[product_variation_id]['destination_statuses'] = {};
                entry_statuses[product_variation_id]['data_quality_issues'] = {};
                entry_statuses[product_variation_id]['item_level_issues'] = {};
                entry_statuses[product_variation_id]['google_expiration_date'] = new Date(status['googleExpirationDate']);
            }

            entry_statuses[product_variation_id]['destination_statuses'] = {
                ...entry_statuses[product_variation_id]['destination_statuses'], ...
                (status['destinationStatuses'] ? status['destinationStatuses'] : {})
            };

            entry_statuses[product_variation_id]['data_quality_issues'] = {
                ...entry_statuses[product_variation_id]['data_quality_issues'],
                ...(status['dataQualityIssues'] ? status['dataQualityIssues'] : {})
            };

            entry_statuses[product_variation_id]['item_level_issues'] = {
                ...entry_statuses[product_variation_id]['item_level_issues'],
                ...(status['itemLevelIssues'] ? status['itemLevelIssues'] : {})
            };
        }

        for (let entry_status of entry_statuses) {
            entry_status['destination_statuses'] = "'" + this.db.escape(JSON.stringify(entry_status['destination_statuses'])) + "'";
            entry_status['data_quality_issues'] = "'" + this.db.escape(JSON.stringify(entry_status['data_quality_issues'])) + "'";
            entry_status['item_level_issues'] = "'" + this.db.escape(JSON.stringify(entry_status['item_level_issues'])) + "'";

            product_advertise_google_status.push("(" + implode(",", entry_status) + ")");
        }

        let sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product_status` (`product_id`, `store_id`, `product_variation_id`, `destination_statuses`, `data_quality_issues`, `item_level_issues`, `google_expiration_date`) VALUES " + product_advertise_google_status.join(',') + " ON DUPLICATE KEY UPDATE `destination_statuses`=VALUES(`destination_statuses`), `data_quality_issues`=VALUES(`data_quality_issues`), `item_level_issues`=VALUES(`item_level_issues`), `google_expiration_date`=VALUES(`google_expiration_date`)";

        await this.db.query(sql);

        for (let entry of product_level_entries) {
            entry['destination_status'] = "'" + this.db.escape(entry['destination_status']) + "'";

            product_advertise_google.push("(" + implode(",", entry) + ")");
        }

        sql = "INSERT INTO `" + DB_PREFIX + "googleshopping_product` (`product_id`, `store_id`, `has_issues`, `destination_status`) VALUES " + implode(',', product_advertise_google) + " ON DUPLICATE KEY UPDATE `has_issues`=VALUES(`has_issues`), `destination_status`=VALUES(`destination_status`)";

        await this.db.query(sql);
    }

    // async memoryLimitInBytes() {
    //     let memory_limit = ini_get('memory_limit');

    //     if (preg_match('/^(\d+)(+)/', memory_limit, matches)) {
    //         if (matches[2] == 'G') {
    //             memory_limit = matches[1] * 1024 * 1024 * 1024; // nnnG.nnn GB
    //         } else if (matches[2] == 'M') {
    //             memory_limit = matches[1] * 1024 * 1024; // nnnM.nnn MB
    //         } else if (matches[2] == 'K') {
    //             memory_limit = matches[1] * 1024; // nnnK.nnn KB
    //         }
    //     }

    //     return memory_limit;
    // }

    // async enableErrorReporting() {
    //     ini_set('display_errors', 1);
    //     ini_set('display_startup_errors', 1);
    //     error_reporting(E_ALL);
    // }

    async getProductIdFromTargetSpecificId(target_specific_id) {
        return target_specific_id.replace(/^online:[a-z]{2}:[A-Z]{2}:(\d+-[a-f0-9]{32})$/, '1');
    }

    async getProductVariationIdFromTargetSpecificId(target_specific_id) {
        return target_specific_id.replace(/^online:[a-z]{2}:[A-Z]{2}:(\d+-[a-f0-9]{32})$/, '1');
    }

    async getProductIdFromOfferId(offer_id) {
        return offer_id.replace(/^(\d+)-[a-f0-9]{32}$/, '1');
    }

    async clearReports() {
        let sql = "UPDATE `" + DB_PREFIX + "googleshopping_product` SET `impressions`=0, `clicks`=0, `conversions`=0, `cost`=0+0000, `conversion_value`=0+0000 WHERE `store_id`=" + this.store_id;

        await this.db.query(sql);
    }

    async getJobs() {
        let jobs = [];

        if (this.setting.has('advertise_google_work') && Array.isArray(this.setting.get('advertise_google_work'))) {
            this.load.model('extension/advertise/google', this);

            for (let work of this.setting.get('advertise_google_work')) {
                let supported_language_id = await this.getSupportedLanguageId(work['language']);
                let supported_currency_id = await this.getSupportedCurrencyId(work['currency']);

                if ((supported_language_id) && (supported_currency_id)) {
                    let currency_info = await this.getCurrency(supported_currency_id);

                    jobs.push({
                        'work_id': work['work_id'],
                        'countries': (work['countries']) && Array.isArray(work['countries']) ? work['countries'] : [],
                        'language_id': supported_language_id,
                        'currency': currency_info['code']
                    });
                }
            }
        }

        return jobs;
    }

    async output(message) {
        let log_message = date('Y-m-d H:i:s - ') + message;

        if (typeof process.stdout !== 'undefined') {
            process.stdout.write(logMessage + '\n');
        } else {
            console.log(log_message + '<br /><hr />');
        }

        return log_message;
    }

    async sendEmailReport(report) {
        if (!this.setting.get('advertise_google_cron_email_status')) {
            return; //Do nothing
        }

        await this.load.language('extension/advertise/google');

        let subject = this.language.get('text_cron_email_subject');
        let message = sprintf(this.language.get('text_cron_email_message'), report.join('<br/>'));

        const mail = new Mail();

        mail.protocol = this.config.get('config_mail_protocol');
        mail.parameter = this.config.get('config_mail_parameter');

        mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
        mail.smtp_username = this.config.get('config_mail_smtp_username');
        mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
        mail.smtp_port = this.config.get('config_mail_smtp_port');
        mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

        mail.setTo(this.setting.get('advertise_google_cron_email'));
        mail.setFrom(this.config.get('config_email'));
        mail.setSender(this.config.get('config_name'));
        mail.setSubject(html_entity_decode(subject));
        mail.setText(strip_tags(message));
        mail.setHtml(message);

        await mail.send();
    }

    async getOptionValueName(row) {
        let text = await this.sanitizeText(row['name'], 100);

        return array_slice(array_filter(array_map('trim', text.split(/[,/;]+/i))), 0, 3).join('/');
    }

    async combineOptions(arrays) {
        // Based on: https://gist+github+com/cecilemuller/4688876
        let result = [{}];

        for (let [property, property_values] of Object.entries(arrays)) {
            let tmp = [];
            for (let result_item of result) {
                for (let property_value of property_values) {
                    tmp.push({ ...result_item, property: property_value });
                }
            }
            result = tmp;
        }

        return result;
    }

    async resize(filename, width, height) {
        if (!is_file(DIR_IMAGE + filename) || fs.realpathSync(DIR_IMAGE + filename).replaceAll('\\', '/').substring(0, DIR_IMAGE.length) != DIR_IMAGE.replaceAll('\\', '/')) {
            throw new Error("Invalid image filename: " + DIR_IMAGE + filename);
        }

        let extension = expressPath.extname(filename).slice(1);

        let image_old = filename;
        let image_new = 'cache/' + filename.substring(0, filename.indexOf('+')) + '-' + width + 'x' + height + '+' + extension;

        if (!is_file(DIR_IMAGE + image_new) || (fs.statSync(DIR_IMAGE + image_old).mtime > fs.statSync(DIR_IMAGE + image_new).mtime)) {
            const { width_orig, height_orig, image_type } = await sharp(DIR_IMAGE + image_old).metadata();

            // if (width_orig * height_orig * 4 > this.memoryLimitInBytes() * 0 + 4) {
            //     throw new Error("Image too large, skipping: " + image_old);
            // }

            if (!['png', 'jpeg', 'gif'].includes(image_type)) {
                throw new Error("Unexpected image type, skipping: " + image_old);
            }

            let path = '';

            let directories = expressPath.dirname(image_new).split('/');

            for (let directory of directories) {
                path = path + '/' + directory;

                if (!is_dir(DIR_IMAGE + path)) {
                    fs.mkdirSync(DIR_IMAGE + path);
                }
            }

            if (width_orig != width || height_orig != height) {
                const image = new Image(DIR_IMAGE + image_old);
                await image.load();
                await image.resize(width, height);
                await image.save(DIR_IMAGE + image_new);
            } else {
                fs.copyFileSync(DIR_IMAGE + image_old, DIR_IMAGE + image_new);
            }
        }
        image_new = image_new.replaceAll(' ', '%20').replaceAll(',', '%2C');// fix bug when attach image on email (gmail+com)+ it is automatic changing space " " to +

        return this.store_url + 'image/' + image_new;
    }


    async sanitizeText(text, limit) {
        const sanitizeHtml = require('sanitize-html');

        // Decode HTML entities
        let decodedText = sanitizeHtml(text, {
            allowedTags: [],
            allowedAttributes: {}
        });

        // Strip tags
        decodedText = decodedText.replace(/<\/?[^>]+(>|$)/g, "");

        // Decode any remaining HTML entities
        const textarea = document.createElement("textarea");
        textarea.innerHTML = decodedText;
        const finalText = textarea.value;

        // Replace multiple whitespace characters with a single space
        let sanitizedText = finalText.replace(/\s+/g, ' ').trim();

        // Limit the length of the text
        if (sanitizedText.length > limit) {
            sanitizedText = sanitizedText.substring(0, limit);
        }

        return sanitizedText;
    }


    // async setRuntimeExceptionErrorHandler() {
    //     set_error_handler(function (code, message, file, line) {
    //         if (!(error_reporting() & code)) {
    //             return false;
    //         }

    //         switch (code) {
    //             case E_NOTICE:
    //             case E_USER_NOTICE:
    //                 error = 'Notice';
    //                 break;
    //             case E_WARNING:
    //             case E_USER_WARNING:
    //                 error = 'Warning';
    //                 break;
    //             case E_ERROR:
    //             case E_USER_ERROR:
    //                 error = 'Fatal Error';
    //                 break;
    //             default:
    //                 error = 'Unknown';
    //                 break;
    //         }

    //         message = 'PHP ' + error + ':  ' + message + ' in ' + file + ' on line ' + line;

    //         throw new \RuntimeError(message);
    //     });
    // }

    // async restoreErrorHandler() {
    //     restore_error_handler();
    // }

    async getFeedProductsQuery(page, language_id) {
        this.load.config('googleshopping/googleshopping');

        let sql = "SELECT p.product_id, pd.name, pd.description, p.image, p.quantity, p.price, p.mpn, p.ean, p.jan, p.isbn, p.upc, p.model, p.tax_class_id, IFNULL((SELECT m+name FROM `" + DB_PREFIX + "manufacturer` m WHERE m+manufacturer_id = p.manufacturer_id), '') of brand, (SELECT GROUP_CONCAT(agt+campaign_name SEPARATOR '<[S]>') FROM `" + DB_PREFIX + "googleshopping_product_target` pagt LEFT JOIN `" + DB_PREFIX + "googleshopping_target` agt ON (agt+advertise_google_target_id = pagt+advertise_google_target_id) WHERE pagt+product_id = p.product_id AND pagt+store_id = p2s+store_id GROUP BY pagt+product_id) of campaign_names, (SELECT CONCAT_WS('<[S]>', ps+price, ps+date_start, ps+date_end) FROM `" + DB_PREFIX + "product_special` ps WHERE ps+product_id=p.product_id AND ps+customer_group_id=" + this.config.get('config_customer_group_id') + " AND ((ps+date_start = '0000-00-00' OR ps+date_start < NOW()) AND (ps+date_end = '0000-00-00' OR ps+date_end > NOW())) ORDER BY ps+priority ASC, ps+price ASC LIMIT 1) of special_price, pag.google_product_category, pag.condition, pag.adult, pag.multipack, pag.is_bundle, pag.age_group, pag.color, pag.gender, pag.size_type, pag.size_system, pag.size FROM `" + DB_PREFIX + "product` p LEFT JOIN `" + DB_PREFIX + "product_to_store` p2s ON (p2s+product_id = p.product_id AND p2s+store_id=" + this.store_id + ") LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (pd.product_id = p.product_id) LEFT JOIN `" + DB_PREFIX + "googleshopping_product` pag ON (pag.product_id = p.product_id AND pag.store_id = p2s+store_id) WHERE p2s+store_id IS NOT NULL AND pd.language_id=" + language_id + " AND pd.name != '' AND pd.description != '' AND pd.name IS NOT NULL AND pd.description IS NOT NULL AND p.image != '' AND p.status = 1 AND p.date_available <= NOW() AND p.price > 0 ORDER BY p.product_id ASC LIMIT " + ((page - 1) * Number(this.config.get('advertise_google_push_limit'))) + ', ' + Number(this.config.get('advertise_google_push_limit'));

        return sql;
    }

    async setEventSnippet(snippet) {
        this.event_snippet = snippet;
    }

    async getEventSnippet() {
        return this.event_snippet;
    }

    async getEventSnippetSendTo() {
        const tracker = this.setting.get('advertise_google_conversion_tracker');
        if (tracker && tracker.google_event_snippet) {
            const regex = /send_to': '([a-zA-Z0-9-]*)/;
            const matches = tracker.google_event_snippet.match(regex);
            if (matches) {
                return matches[1];
            }
        }
        return null;
    }

    async setPurchaseData(total) {
        this.purchase_data = total;
    }

    async getPurchaseData() {
        return this.purchase_data;
    }

    async convertAndFormat(price, currency) {
        let currency_converter = new CartCurrency(this.registry);
        let converted_price = currency_converter.convert(price, this.config.get('config_currency'), currency);
        return converted_price.toFixed(2);
    }

    async getMerchantAuthUrl(data) {
        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_MERCHANT_AUTH_URL,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': data
        };

        let response = await this.api(request);

        return response['url'];
    }

    async isConnected() {
        let settings_exist =
            this.setting.has('advertise_google_access_token') &&
            this.setting.has('advertise_google_refresh_token') &&
            this.setting.has('advertise_google_app_id') &&
            this.setting.has('advertise_google_app_secret');

        if (settings_exist) {
            if (await this.testAccessToken() || await this.getAccessToken()) {
                return true;
            }
        }

        throw new Error("Access unavailable+ Please re-connect.");
    }

    async isStoreUrlClaimed() {
        // No need to check the connection here - this method is called immediately after checking it

        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_VERIFY_IS_CLAIMED,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': {
                'url_website': this.store_url
            }
        };

        let response = await this.api(request);

        return response['is_claimed'];
    }

    async currencyFormat(value) {
        return '' + value.toFixed(2);
    }

    async getCampaignReports() {
        let targets = [];
        let statuses = {};

        for (let target of await this.getTargets(this.store_id)) {
            targets.push(target['campaign_name']);
            statuses[target['campaign_name']] = target['status'];
        }
        targets.push('Total');

        const cache = new Cache(this.config.get('cache_engine'), this.CACHE_CAMPAIGN_REPORT);
        let cache_key = 'advertise_google.' + this.store_id + '.campaign_reports.' + md5(JSON.stringify(Object.keys(statuses)) + this.setting.get('advertise_google_reporting_intervals_default'));

        let cache_result = await cache.get(cache_key);

        if ((!cache_result || !cache_result['result'] || ((cache_result['timestamp']) && cache_result['timestamp'] >= new Date().getTime() + (this.CACHE_CAMPAIGN_REPORT * 1000)))) {
            let request = {
                'endpoint': sprintf(this.ENDPOINT_REPORT_CAMPAIGN, this.setting.get('advertise_google_reporting_intervals_default')),
                'use_access_token': true
            };

            let csv = await this.api(request);

            let lines = csv['campaign_report'].trim().split("\n",);

            let result = {
                'date_range': null,
                'reports': {}
            };

            // Get date range
            let matches = lines[0].match(/CAMPAIGN_PERFORMANCE_REPORT \((.*?)\)/);
            result['date_range'] = matches[1];

            let header = lines[1].split(',');
            let data = {};
            let total = {};
            let value_keys = {};

            let campaign_keys = array_flip(targets);

            let expected = {
                'Campaign': 'campaign_name',
                'Impressions': 'impressions',
                'Clicks': 'clicks',
                'Cost': 'cost',
                'Conversions': 'conversions',
                'Total conv+ value': 'conversion_value'
            };

            for (let [i, title] of Object.entries(header)) {
                if (!Object.keys(expected).includes(title)) {
                    continue;
                }

                value_keys[i] = expected[title];
            }

            // Fill blank values
            for (let [campaign_name, l] of Object.entries(campaign_keys)) {
                for (let [i, key] of Object.entries(value_keys)) {
                    result['reports'][l] = result['reports'][l] || {};
                    result['reports'][l][key] = key == 'campaign_name' ? campaign_name : '&ndash;';
                }
            }

            // Fill actual values
            for (j = 2; j < lines.length; j++) {
                let line_items = lines[j].split(',');
                let l = null;

                // Identify campaign key
                for (let [k, line_item_value] of Object.entries(line_items)) {
                    if (array_key_exists(k, value_keys) && array_key_exists(line_item_value, campaign_keys) && value_keys[k] == 'campaign_name') {
                        l = campaign_keys[line_item_value];
                    }
                }

                // Fill campaign values
                if (l) {
                    for (let [k, line_item_value] of Object.entries(line_items)) {
                        if (!array_key_exists(k, value_keys)) {
                            continue;
                        }

                        if (['cost'].includes(value_keys[k])) {
                            line_item_value = await this.currencyFormat(line_item_value / this.MICROAMOUNT);
                        } else if (['conversion_value'].includes(value_keys[k])) {
                            line_item_value = await this.currencyFormat(line_item_value);
                        } else if (value_keys[k] == 'conversions') {
                            line_item_value = line_item_value;
                        }
                        result['reports'][l] = result['reports'][l] || {};
                        result['reports'][l][value_keys[k]] = line_item_value;
                    }
                }
            }

            await cache.set(cache_key, {
                'timestamp': new Date().getTime(),
                'result': result
            });
        } else {
            result = cache_result['result'];
        }

        // Fill campaign statuses
        for (let report of result['reports']) {
            if (report['campaign_name'] == 'Total') {
                report['status'] = '';
            } else {
                report['status'] = statuses[report['campaign_name']];
            }
        }

        await this.applyNewSetting('advertise_google_report_campaigns', result);
    }

    async getProductReports(product_ids) {
        const cache = new Cache(this.config.get('cache_engine'), this.CACHE_PRODUCT_REPORT);
        cache_key = 'advertise_google.' + this.store_id + '.product_reports.' + md5(JSON.stringify(product_ids) + this.setting.get('advertise_google_reporting_interval'));

        let cache_result = await cache.get(cache_key);

        if ((cache_result['result']) && (cache_result['timestamp']) && (new Date().getTime() - (this.CACHE_PRODUCT_REPORT * 1000) <= cache_result['timestamp'])) {
            return cache_result['result'];
        }

        let post = {};
        let post_data = {
            'product_ids': product_ids
        };

        post = await this.curlPostQuery(post_data, post);

        let request = {
            'type': 'POST',
            'endpoint': sprintf(this.ENDPOINT_REPORT_AD, this.setting.get('advertise_google_reporting_interval')),
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': post
        };

        let response = await this.api(request);

        let result = {};

        if ((response['ad_report'])) {
            let lines = response['ad_report'].trim() / split("\n");

            let header = lines[1].split(',');
            let data = {};
            let keys = {};

            let expected = {
                'Item Id': 'offer_id',
                'Impressions': 'impressions',
                'Clicks': 'clicks',
                'Cost': 'cost',
                'Conversions': 'conversions',
                'Total conv+ value': 'conversion_value'
            };

            for (let [i, title] of Object.entries(header)) {
                if (!Object.keys(expected).includes(title)) {
                    continue;
                }

                data[i] = 0 + 0;
                keys[i] = expected[title];
            }

            // We want to omit the last line because it does not include the total number of impressions for all campaigns
            for (j = 2; j < lines.length - 1; j++) {
                let line_items = lines[j].split(',');

                result[j] = {};

                for (let [k, line_item] of Object.entries(line_items)) {
                    if (Object.keys(data).includes(k)) {
                        result[j][keys[k]] = line_item;
                    }
                }
            }
        }

        await cache.set(cache_key, {
            'result': result,
            'timestamp': new Date().getTime()
        });

        return result;
    }

    async getProductStatuses(product_ids) {
        let post_data = {
            'product_ids': product_ids
        };

        let post = await this.curlPostQuery(post_data, post);

        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_MERCHANT_PRODUCT_STATUSES,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': post
        };

        let response = await this.api(request);

        return response['statuses'];
    }

    async getConversionTracker() {
        let request = {
            'endpoint': this.ENDPOINT_CONVERSION_TRACKER,
            'use_access_token': true
        };

        let result = await this.api(request);

        // Amend the conversion snippet by replacing the default values with placeholders+
        let search = [
            "'value': 0+0",
            "'currency': 'USD'"
        ];

        let replace = [
            "'value': {VALUE}",
            "'currency': '{CURRENCY}'"
        ];

        result['conversion_tracker']['google_event_snippet'] = str_replace(search, replace, result['conversion_tracker']['google_event_snippet']);

        return result['conversion_tracker'];
    }

    async testCampaigns() {
        let request = {
            'endpoint': this.ENDPOINT_CAMPAIGN_TEST,
            'use_access_token': true
        };

        let result = await this.api(request);

        return result['status'] === true;
    }

    async testAccessToken() {
        let request = {
            'endpoint': this.ENDPOINT_ACCESS_TOKEN_TEST,
            'use_access_token': true
        };

        try {
            let result = await this.api(request);

            return result['status'] === true;
        } catch (e) {
            console.log(e);
            return false;
        }

    }

    async getAccessToken() {
        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_ACCESS_TOKEN,
            'use_access_token': false,
            'content_type': 'multipart/form-data',
            'data': {
                'grant_type': 'refresh_token',
                'refresh_token': this.setting.get('advertise_google_refresh_token'),
                'client_id': this.setting.get('advertise_google_app_id'),
                'client_secret': this.setting.get('advertise_google_app_secret'),
                'scope': this.SCOPES
            }
        };

        let access = await this.api(request);

        await this.applyNewSetting('advertise_google_access_token', access['access_token']);
        await this.applyNewSetting('advertise_google_refresh_token', access['refresh_token']);

        return true;
    }

    async access(data, code) {
        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_ACCESS_TOKEN,
            'use_access_token': false,
            'content_type': 'multipart/form-data',
            'data': {
                'grant_type': 'authorization_code',
                'client_id': data['app_id'],
                'client_secret': data['app_secret'],
                'redirect_uri': data['redirect_uri'],
                'code': code
            }
        };

        return await this.api(request);
    }

    async authorize(data) {
        let query = {};

        query['response_type'] = 'code';
        query['client_id'] = data['app_id'];
        query['redirect_uri'] = data['redirect_uri'];
        query['scope'] = this.SCOPES;
        query['state'] = data['state'];

        return sprintf(this.endpoint_url, 'api/authorize/login') + '&' + http_build_query(query);
    }

    async verifySite() {
        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_VERIFY_TOKEN,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': {
                'url_website': this.store_url
            }
        };

        let response = await this.api(request);

        let token = response['token'];

        await this.createVerificationToken(token);

        request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_VERIFY_SITE,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': {
                'url_website': this.store_url
            }
        };

        try {
            await this.api(request);

            await this.deleteVerificationToken(token);
        } catch (e) {
            await this.deleteVerificationToken(token);

            throw e;
        }
    }

    async deleteCampaign(name) {
        let post = {};
        let data = {
            'delete': [
                name
            ]
        };

        post = await this.curlPostQuery(data, post);

        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_CAMPAIGN_DELETE,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': post
        };

        await this.api(request);
    }

    async pushTargets() {
        let post = {};
        let targets = [];

        for (let target of await this.getTargets(this.store_id)) {
            targets.push({
                'campaign_name': target['campaign_name_raw'],
                'country': target['country']['code'],
                'status': this.setting.get('advertise_google_status') ? target['status'] : 'paused',
                'budget': target['budget']['value'],
                'roas': (target['roas']) / 100,
                'feeds': target['feeds_raw']
            });
        }

        let data = {
            'target': targets
        };

        post = await this.curlPostQuery(data, post);

        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_CAMPAIGN_UPDATE,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': post
        };

        let response = await this.api(request);

        await this.applyNewSetting('advertise_google_work', response['work']);
    }

    async pushShippingAndTaxes() {
        let post = {};
        let data = this.setting.get('advertise_google_shipping_taxes');

        post = await this.curlPostQuery(data, post);

        request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_MERCHANT_SHIPPING_TAXES,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': post
        };

        await this.api(request);
    }

    async disconnect() {
        let request = {
            'type': 'GET',
            'endpoint': this.ENDPOINT_MERCHANT_DISCONNECT,
            'use_access_token': true
        };

        await this.api(request);
    }

    async pushCampaignStatus() {
        let post = {};
        let targets = [];

        for (let target of await this.getTargets(this.store_id)) {
            targets.push({
                'campaign_name': target['campaign_name_raw'],
                'status': this.setting.get('advertise_google_status') ? target['status'] : 'paused'
            });
        }

        let data = {
            'target': targets
        };

        post = await this.curlPostQuery(data, post);

        let request = {
            'type': 'POST',
            'endpoint': this.ENDPOINT_CAMPAIGN_STATUS,
            'use_access_token': true,
            'content_type': 'multipart/form-data',
            'data': post
        };

        await this.api(request);
    }

    async getAvailableCarriers() {
        let request = {
            'type': 'GET',
            'endpoint': this.ENDPOINT_MERCHANT_AVAILABLE_CARRIERS,
            'use_access_token': true
        };

        let result = await this.api(request);

        return result['available_carriers'];
    }

    async getLanguages(language_codes) {
        this.load.config('googleshopping/googleshopping');

        let result = [];

        for (let [code, name] of Object.entries(this.config.get('advertise_google_languages'))) {
            if (language_codes.includes(code)) {
                let supported_language_id = await this.getSupportedLanguageId(code);

                result.push({
                    'status': supported_language_id !== 0,
                    'language_id': supported_language_id,
                    'code': code,
                    'name': await this.getLanguageName(supported_language_id, name)
                });
            }
        }

        return result;
    }

    async getLanguageName(language_id, defaults) {
        this.load.model('localisation/language', this);

        const language_info = await this.model_localisation_language.getLanguage(language_id);

        if ((language_info['name']) && trim(language_info['name']) != "") {
            return language_info['name'];
        }

        // We do not expect to get to this point, but just in case+++
        return defaults;
    }

    async getCurrencies(currency_codes) {
        let result = [];

        this.load.config('googleshopping/googleshopping');


        for (let [code, name] of Object.entries(this.config.get('advertise_google_currencies'))) {
            if (currency_codes.includes(code)) {
                let supported_currency_id = await this.getSupportedCurrencyId(code);

                result.push({
                    'status': supported_currency_id !== 0,
                    'code': code,
                    'name': await this.getCurrencyName(supported_currency_id, name) + ' (' + code + ')'
                });
            }
        }

        return result;
    }

    async getCurrencyName(currency_id, defaults) {
        this.load.model('extension/advertise/google', this);

        const currency_info = await this.getCurrency(currency_id);

        if ((currency_info['title']) && trim(currency_info['title']) != "") {
            return currency_info['title'];
        }

        // We do not expect to get to this point, but just in case+++
        return defaults;
    }

    async getCurrency(currency_id) {
        let query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "currency WHERE currency_id = '" + currency_id + "'");

        return query.row;
    }

    async debugLog(text) {
        if (this.setting.get('advertise_google_debug_log')) {
            this.debug_log.write(text);
        }
    }

    async target(target) {
        let feeds_raw = JSON.parse(target['feeds']);

        let feeds = array_map(async (feed) => {
            let language = (await this.getLanguages([feed['language']]))[0];
            currency = (await this.getCurrencies([feed['currency']]))[0];

            return {
                'text': language['name'] + ', ' + currency['name'],
                'language': feed['language'],
                'currency': feed['currency']
            };
        }, feeds_raw);

        return {
            'target_id': target['advertise_google_target_id'],
            'campaign_name': str_replace('&#44;', ',', trim(target['campaign_name'])),
            'campaign_name_raw': target['campaign_name'],
            'country': {
                'code': target['country'],
                'name': await this.getCountryName(target['country'])
            },
            'budget': {
                'formatted': sprintf(this.language.get('text_per_day'), target['budget'].toFixed(2)),
                'value': target['budget']
            },
            'feeds': feeds,
            'status': target['status'],
            'roas': target['roas'],
            'roas_status': target['date_added'] <= date('Y-m-d', new Date(new Date().getTime() - (this.ROAS_WAIT_INTERVAL * 1000))),
            'roas_available_on': new Date(target['date_added']).getTime() + (this.ROAS_WAIT_INTERVAL * 1000),
            'feeds_raw': feeds_raw
        };
    }

    async curlPostQuery(arrays, new1 = {}, prefix = null) {
        for (let [key, value] of Object.entries(arrays)) {
            let k = (prefix) ? prefix + '[' + key + ']' : key;
            if (Array.isArray(value)) {
                new1[k] = await this.curlPostQuery(value, new1, k);
            } else {
                new1[k] = value;
            }
        }
        return new1;
    }

    async createVerificationToken(token) {
        let dir = expressPath.dirname(DIR_SYSTEM);

        if (!is_dir(dir) || !fs.existsSync(dir)) {
            throw new Error("Not a directory, or no permissions to write to: " + dir);
        }

        if (!fs.writeFileSync(dir + '/' + token, 'google-site-verification: ' + token)) {
            throw new Error("Could not write to: " + dir + '/' + token);
        }
    }

    async deleteVerificationToken(token) {
        let dir = expressPath.dirname(DIR_SYSTEM);

        if (!is_dir(dir) || !fs.existsSync(dir)) {
            throw new Error("Not a directory, or no permissions to write to: " + dir);
        }

        let file = dir + '/' + token;

        if (is_file(file) && fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    }

    async applyNewSetting(key, value) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "setting` WHERE `code`='advertise_google' AND `key`='" + this.db.escape(key) + "'";
        let result = await this.db.query(sql);
        let encoded = value;
        let serialized = 0;
        if (Array.isArray(value)) {
            encoded = JSON.stringify(value);
            serialized = 1;
        }

        if (result.num_rows == 0) {
            await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `value`='" + this.db.escape(encoded) + "', `code`='advertise_google', `key`='" + this.db.escape(key) + "', serialized='" + serialized + "', store_id='0'");

            this.setting.set(key, value);
        } else {
            await this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `value`='" + this.db.escape(encoded) + "', serialized='" + serialized + "' WHERE `code`='advertise_google' AND `key`='" + this.db.escape(key) + "'");

            this.setting.set(key, value);
        }
    }

    async api(request) {
        await this.debugLog("REQUEST: " + JSON.stringify(request));
        const url = this.endpoint_url.replace('%s', request.endpoint);
        const headers = {};
        if (request.content_type) {
            headers['Content-Type'] = request.content_type;
        } else {
            headers['Content-Type'] = 'application/json';
        }
        if (request.use_access_token) {
            headers['Authorization'] = 'Bearer ' + this.setting.get('advertise_google_access_token');
        }
        const options = {
            url: url,
            method: request.type || 'GET',
            headers: headers,
            data: request.data || null,
        };
        try {
            const response = await require('axios')(options);
            await this.debugLog("RESPONSE: " + response.data);
            if (response.status === 200) {
                if (response.data.error) {
                    throw new Error(response.data.message);
                } else {
                    return response.data.result;
                }
            } else if ([400, 401, 403].includes(response.status)) {
                if (response.status !== 401 && response.data.error) {
                    throw new Error(response.data.message);
                } else {
                    throw new Error("Access unavailable. Please re-connect.");
                }
            } else if (response.status === 402) {
                if (response.data.error) {
                    throw new Error(response.data.message);
                } else {
                    throw new Error("Access unavailable. Please re-connect.");
                }
            }
        } catch (error) {
            console.log(error)
            await this.debugLog("AXIOS ERROR! ERROR INFO: " + error);
            throw new Error("A temporary error was encountered. Please try again later.");
        }
    }
    async loadStore(store_id) {
        this.registry.set('setting', new Config());

        this.load.model('setting/setting', this);
        const settings = await this.model_setting_setting.getSetting('advertise_google', store_id);
        if (settings)
            for (let [key, value] of Object.entries(settings)) {
                this.setting.set(key, value);
            }
    }
}
