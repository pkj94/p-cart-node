module.exports =
    class ModelExtensionAdvertiseGoogle extends Model {
        async getHumanReadableCategory(product_id, store_id) {
            this.load.config('googleshopping/googleshopping');

            const google_category_result = await this.db.query("SELECT google_product_category FROM `" + DB_PREFIX + "googleshopping_product` pag WHERE pag.product_id = " + product_id + " AND pag.store_id = " + store_id);

            if (google_category_result.num_rows > 0) {
                const google_category_id = google_category_result.row['google_product_category'];
                const google_categories = this.config.get('advertise_google_google_product_categories');

                if ((google_category_id) && (google_categories[google_category_id])) {
                    return google_categories[google_category_id];
                }
            }

            const oc_category_result = await this.db.query("SELECT c.category_id FROM `" + DB_PREFIX + "product_to_category` p2c LEFT JOIN `" + DB_PREFIX + "category` c ON (c.category_id = p2c.category_id) WHERE p2c.product_id=" + product_id + " LIMIT 0,1");

            if (oc_category_result.num_rows > 0) {
                return await this.getHumanReadableOpenCartCategory(oc_category_result.row['category_id']);
            }

            return "";
        }

        async getHumanReadableOpenCartCategory(category_id) {
            let sql = "SELECT GROUP_CONCAT(cd.name ORDER BY cp.level SEPARATOR ' &gt; ') AS path FROM " + DB_PREFIX + "category_path cp LEFT JOIN " + DB_PREFIX + "category_description cd ON (cp.path_id = cd.category_id) WHERE cd.language_id=" + this.config.get('config_language_id') + " AND cp.category_id=" + category_id;

            const result = await this.db.query(sql);

            if (result.num_rows > 0) {
                return result.row['path'];
            }

            return "";
        }

        async getSizeAndColorOptionMap(product_id, store_id) {
            const color_id = await this.getOptionId(product_id, store_id, 'color');
            const size_id = await this.getOptionId(product_id, store_id, 'size');

            const groups = await this.googleshopping.getGroups(product_id, this.config.get('config_language_id'), color_id, size_id);

            const colors = await this.googleshopping.getProductOptionValueNames(product_id, this.config.get('config_language_id'), color_id);
            const sizes = await this.googleshopping.getProductOptionValueNames(product_id, this.config.get('config_language_id'), size_id);

            const map = {
                'groups': groups,
                'colors': colors.length > 1 ? colors : null,
                'sizes': sizes.length > 1 ? sizes : null,
            };

            return map;
        }

        async getCoupon(order_id) {
            let sql = "SELECT c.code FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "coupon` c ON (c.coupon_id = ch.coupon_id) WHERE ch.order_id=" + order_id;

            const result = await this.db.query(sql);

            if (result.num_rows > 0) {
                return result.row['code'];
            }

            return null;
        }

        async getRemarketingProductIds(products, store_id) {
            const ecomm_prodid = [];

            for (let product of products) {
                let id = await this.getRemarketingProductId(product, store_id)
                if (null !== id) {
                    ecomm_prodid.push(id);
                }
            }

            return ecomm_prodid;
        }

        async getRemarketingItems(products, store_id) {
            const items = [];

            for (let product of products) {
                let id = await this.getRemarketingProductId(product, store_id)
                if (null !== id) {
                    items.push({
                        'google_business_vertical': 'retail',
                        'id': id,
                        'name': product['name'],
                        'quantity': product['quantity']
                    });
                }
            }

            return items;
        }

        async getRemarketingProductId(product, store_id) {
            const option_map = await this.getSizeAndColorOptionMap(product['product_id'], store_id);
            let found_color = "";
            let found_size = "";

            for (let option of product['option']) {
                if ((option_map['colors'])) {
                    for (let [product_option_value_id, color] of Object.entries(option_map['colors'])) {
                        if (option['product_option_value_id'] == product_option_value_id) {
                            found_color = color;
                        }
                    }
                }

                if ((option_map['sizes'])) {
                    for (let [product_option_value_id, size] of Object.entries(option_map['sizes'])) {
                        if (option['product_option_value_id'] == product_option_value_id) {
                            found_size = size;
                        }
                    }
                }
            }

            for (let [id, group] of Object.entries(option_map['groups'])) {
                if (group['color'] === found_color && group['size'] === found_size) {
                    return id;
                }
            }

            return null;
        }

        async getOptionId(product_id, store_id, type) {
            let sql = "SELECT pag." + type + " FROM `" + DB_PREFIX + "googleshopping_product` pag WHERE product_id=" + product_id + " AND store_id=" + store_id;

            const result = await this.db.query(sql);

            if (result.num_rows > 0) {
                return result.row[type];
            }

            return 0;
        }
    }