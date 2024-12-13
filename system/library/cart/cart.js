module.exports = class Cart {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.customer = registry.get('customer');
        this.session = registry.get('session');
        this.tax = registry.get('tax');
        this.weight = registry.get('weight');
        this.request = registry.get('request');
        this.data = {};
    }
    async init() {
        // Remove all the expired carts with no customer ID
        await this.db.query("DELETE FROM " + DB_PREFIX + "cart WHERE (api_id > '0' OR customer_id = '0') AND date_added < DATE_SUB(NOW(), INTERVAL 1 HOUR)");

        if (await this.customer.getId()) {
            // We want to change the session ID on all the old items in the customers cart
            await this.db.query("UPDATE " + DB_PREFIX + "cart SET session_id = '" + this.db.escape(this.session.getId()) + "' WHERE api_id = '0' AND customer_id = '" + await this.customer.getId() + "'");

            // Once the customer is logged in we want to update the customers cart
            const cart_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "cart WHERE api_id = '0' AND customer_id = '0' AND session_id = '" + this.db.escape(this.session.getId()) + "'");

            for (let cart of cart_query.rows) {
                await this.db.query("DELETE FROM " + DB_PREFIX + "cart WHERE cart_id = '" + cart['cart_id'] + "'");

                // The advantage of using this->add is that it will check if the products already exist and increaser the quantity if necessary.
                this.add(cart['product_id'], cart['quantity'], JSON.parse(cart['option']), cart['recurring_id']);
            }
        }
    }
    async getProducts() {
        await this.init()
        let product_data = [];

        const cart_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "cart WHERE api_id = '" + ((this.session.data['api_id']) ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "'");

        for (let cart of cart_query.rows) {
            let stock = true;

            const product_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_store p2s LEFT JOIN " + DB_PREFIX + "product p ON (p2s.product_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) WHERE p2s.store_id = '" + this.config.get('config_store_id') + "' AND p2s.product_id = '" + cart['product_id'] + "' AND pd.language_id = '" + this.config.get('config_language_id') + "' AND p.date_available <= NOW() AND p.status = '1'");

            if (product_query.num_rows && (cart['quantity'] > 0)) {
                let option_price = 0;
                let option_points = 0;
                let option_weight = 0;

                let option_data = [];

                for (let [product_option_id, value] of Object.entries(JSON.parse(cart['option']))) {
                    const option_query = await this.db.query("SELECT po.product_option_id, po.option_id, od.name, o.type FROM " + DB_PREFIX + "product_option po LEFT JOIN `" + DB_PREFIX + "option` o ON (po.option_id = o.option_id) LEFT JOIN " + DB_PREFIX + "option_description od ON (o.option_id = od.option_id) WHERE po.product_option_id = '" + product_option_id + "' AND po.product_id = '" + cart['product_id'] + "' AND od.language_id = '" + this.config.get('config_language_id') + "'");

                    if (option_query.num_rows) {
                        if (option_query.row['type'] == 'select' || option_query.row['type'] == 'radio') {
                            const option_value_query = await this.db.query("SELECT pov.option_value_id, ovd.name, pov.quantity, pov.subtract, pov.price, pov.price_prefix, pov.points, pov.points_prefix, pov.weight, pov.weight_prefix FROM " + DB_PREFIX + "product_option_value pov LEFT JOIN " + DB_PREFIX + "option_value ov ON (pov.option_value_id = ov.option_value_id) LEFT JOIN " + DB_PREFIX + "option_value_description ovd ON (ov.option_value_id = ovd.option_value_id) WHERE pov.product_option_value_id = '" + value + "' AND pov.product_option_id = '" + product_option_id + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "'");

                            if (option_value_query.num_rows) {
                                if (option_value_query.row['price_prefix'] == '+') {
                                    option_price += option_value_query.row['price'];
                                } else if (option_value_query.row['price_prefix'] == '-') {
                                    option_price -= option_value_query.row['price'];
                                }

                                if (option_value_query.row['points_prefix'] == '+') {
                                    option_points += option_value_query.row['points'];
                                } else if (option_value_query.row['points_prefix'] == '-') {
                                    option_points -= option_value_query.row['points'];
                                }

                                if (option_value_query.row['weight_prefix'] == '+') {
                                    option_weight += option_value_query.row['weight'];
                                } else if (option_value_query.row['weight_prefix'] == '-') {
                                    option_weight -= option_value_query.row['weight'];
                                }

                                if (option_value_query.row['subtract'] && (!option_value_query.row['quantity'] || (option_value_query.row['quantity'] < cart['quantity']))) {
                                    stock = false;
                                }

                                option_data.push({
                                    'product_option_id': product_option_id,
                                    'product_option_value_id': value,
                                    'option_id': option_query.row['option_id'],
                                    'option_value_id': option_value_query.row['option_value_id'],
                                    'name': option_query.row['name'],
                                    'value': option_value_query.row['name'],
                                    'type': option_query.row['type'],
                                    'quantity': option_value_query.row['quantity'],
                                    'subtract': option_value_query.row['subtract'],
                                    'price': option_value_query.row['price'],
                                    'price_prefix': option_value_query.row['price_prefix'],
                                    'points': option_value_query.row['points'],
                                    'points_prefix': option_value_query.row['points_prefix'],
                                    'weight': option_value_query.row['weight'],
                                    'weight_prefix': option_value_query.row['weight_prefix']
                                });
                            }
                        } else if (option_query.row['type'] == 'checkbox' && Array.isArray(value)) {
                            for (let product_option_value_id of value) {
                                const option_value_query = await this.db.query("SELECT pov.option_value_id, pov.quantity, pov.subtract, pov.price, pov.price_prefix, pov.points, pov.points_prefix, pov.weight, pov.weight_prefix, ovd.name FROM " + DB_PREFIX + "product_option_value pov LEFT JOIN " + DB_PREFIX + "option_value_description ovd ON (pov.option_value_id = ovd.option_value_id) WHERE pov.product_option_value_id = '" + product_option_value_id + "' AND pov.product_option_id = '" + product_option_id + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "'");

                                if (option_value_query.num_rows) {
                                    if (option_value_query.row['price_prefix'] == '+') {
                                        option_price += option_value_query.row['price'];
                                    } else if (option_value_query.row['price_prefix'] == '-') {
                                        option_price -= option_value_query.row['price'];
                                    }

                                    if (option_value_query.row['points_prefix'] == '+') {
                                        option_points += option_value_query.row['points'];
                                    } else if (option_value_query.row['points_prefix'] == '-') {
                                        option_points -= option_value_query.row['points'];
                                    }

                                    if (option_value_query.row['weight_prefix'] == '+') {
                                        option_weight += option_value_query.row['weight'];
                                    } else if (option_value_query.row['weight_prefix'] == '-') {
                                        option_weight -= option_value_query.row['weight'];
                                    }

                                    if (option_value_query.row['subtract'] && (!option_value_query.row['quantity'] || (option_value_query.row['quantity'] < cart['quantity']))) {
                                        stock = false;
                                    }

                                    option_data.push({
                                        'product_option_id': product_option_id,
                                        'product_option_value_id': product_option_value_id,
                                        'option_id': option_query.row['option_id'],
                                        'option_value_id': option_value_query.row['option_value_id'],
                                        'name': option_query.row['name'],
                                        'value': option_value_query.row['name'],
                                        'type': option_query.row['type'],
                                        'quantity': option_value_query.row['quantity'],
                                        'subtract': option_value_query.row['subtract'],
                                        'price': option_value_query.row['price'],
                                        'price_prefix': option_value_query.row['price_prefix'],
                                        'points': option_value_query.row['points'],
                                        'points_prefix': option_value_query.row['points_prefix'],
                                        'weight': option_value_query.row['weight'],
                                        'weight_prefix': option_value_query.row['weight_prefix']
                                    });
                                }
                            }
                        } else if (option_query.row['type'] == 'text' || option_query.row['type'] == 'textarea' || option_query.row['type'] == 'file' || option_query.row['type'] == 'date' || option_query.row['type'] == 'datetime' || option_query.row['type'] == 'time') {
                            option_data.push({
                                'product_option_id': product_option_id,
                                'product_option_value_id': '',
                                'option_id': option_query.row['option_id'],
                                'option_value_id': '',
                                'name': option_query.row['name'],
                                'value': value,
                                'type': option_query.row['type'],
                                'quantity': '',
                                'subtract': '',
                                'price': '',
                                'price_prefix': '',
                                'points': '',
                                'points_prefix': '',
                                'weight': '',
                                'weight_prefix': ''
                            });
                        }
                    }
                }

                let price = product_query.row['price'];

                // Product Discounts
                let discount_quantity = 0;

                for (let cart_2 of cart_query.rows) {
                    if (cart_2['product_id'] == cart['product_id']) {
                        discount_quantity += cart_2['quantity'];
                    }
                }

                const product_discount_query = await this.db.query("SELECT price FROM " + DB_PREFIX + "product_discount WHERE product_id = '" + cart['product_id'] + "' AND customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND quantity <= '" + discount_quantity + "' AND ((date_start = '0000-00-00' OR date_start < NOW()) AND (date_end = '0000-00-00' OR date_end > NOW())) ORDER BY quantity DESC, priority ASC, price ASC LIMIT 1");

                if (product_discount_query.num_rows) {
                    price = product_discount_query.row['price'];
                }

                // Product Specials
                const product_special_query = await this.db.query("SELECT price FROM " + DB_PREFIX + "product_special WHERE product_id = '" + cart['product_id'] + "' AND customer_group_id = '" + this.config.get('config_customer_group_id') + "' AND ((date_start = '0000-00-00' OR date_start < NOW()) AND (date_end = '0000-00-00' OR date_end > NOW())) ORDER BY priority ASC, price ASC LIMIT 1");

                if (product_special_query.num_rows) {
                    price = product_special_query.row['price'];
                }

                // Reward Points
                const product_reward_query = await this.db.query("SELECT points FROM " + DB_PREFIX + "product_reward WHERE product_id = '" + cart['product_id'] + "' AND customer_group_id = '" + this.config.get('config_customer_group_id') + "'");
                let reward = 0;
                if (product_reward_query.num_rows) {
                    reward = product_reward_query.row['points'];
                } else {
                    reward = 0;
                }

                // Downloads
                let download_data = [];

                const download_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "product_to_download p2d LEFT JOIN " + DB_PREFIX + "download d ON (p2d.download_id = d.download_id) LEFT JOIN " + DB_PREFIX + "download_description dd ON (d.download_id = dd.download_id) WHERE p2d.product_id = '" + cart['product_id'] + "' AND dd.language_id = '" + this.config.get('config_language_id') + "'");

                for (let download of download_query.rows) {
                    download_data.push({
                        'download_id': download['download_id'],
                        'name': download['name'],
                        'filename': download['filename'],
                        'mask': download['mask']
                    });
                }

                // Stock
                let stock = true;
                if (!product_query.row['quantity'] || (product_query.row['quantity'] < cart['quantity'])) {
                    stock = false;
                }

                const recurring_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "recurring r LEFT JOIN " + DB_PREFIX + "product_recurring pr ON (r.recurring_id = pr.recurring_id) LEFT JOIN " + DB_PREFIX + "recurring_description rd ON (r.recurring_id = rd.recurring_id) WHERE r.recurring_id = '" + cart['recurring_id'] + "' AND pr.product_id = '" + cart['product_id'] + "' AND rd.language_id = " + this.config.get('config_language_id') + " AND r.status = 1 AND pr.customer_group_id = '" + this.config.get('config_customer_group_id') + "'");
                let recurring = false;
                if (recurring_query.num_rows) {
                    recurring = {
                        'recurring_id': cart['recurring_id'],
                        'name': recurring_query.row['name'],
                        'frequency': recurring_query.row['frequency'],
                        'price': recurring_query.row['price'],
                        'cycle': recurring_query.row['cycle'],
                        'duration': recurring_query.row['duration'],
                        'trial': recurring_query.row['trial_status'],
                        'trial_frequency': recurring_query.row['trial_frequency'],
                        'trial_price': recurring_query.row['trial_price'],
                        'trial_cycle': recurring_query.row['trial_cycle'],
                        'trial_duration': recurring_query.row['trial_duration']
                    };
                } else {
                    recurring = false;
                }

                product_data.push({
                    'cart_id': cart['cart_id'],
                    'product_id': product_query.row['product_id'],
                    'name': product_query.row['name'],
                    'model': product_query.row['model'],
                    'shipping': product_query.row['shipping'],
                    'image': product_query.row['image'],
                    'option': option_data,
                    'download': download_data,
                    'quantity': cart['quantity'],
                    'minimum': product_query.row['minimum'],
                    'subtract': product_query.row['subtract'],
                    'stock': stock,
                    'price': (price + option_price),
                    'total': (price + option_price) * cart['quantity'],
                    'reward': reward * cart['quantity'],
                    'points': (product_query.row['points'] ? (product_query.row['points'] + option_points) * cart['quantity'] : 0),
                    'tax_class_id': product_query.row['tax_class_id'],
                    'weight': (product_query.row['weight'] + option_weight) * cart['quantity'],
                    'weight_class_id': product_query.row['weight_class_id'],
                    'length': product_query.row['length'],
                    'width': product_query.row['width'],
                    'height': product_query.row['height'],
                    'length_class_id': product_query.row['length_class_id'],
                    'recurring': recurring
                });
            } else {
                await this.remove(cart['cart_id']);
            }
        }

        return product_data;
    }

    async add(product_id, quantity = 1, option = {}, recurring_id = 0) {
        const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "cart WHERE api_id = '" + ((this.session.data['api_id']) ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "' AND product_id = '" + product_id + "' AND recurring_id = '" + recurring_id + "' AND `option` = '" + this.db.escape(JSON.stringify(option)) + "'");

        if (!query.row['total']) {
            await this.db.query("INSERT INTO " + DB_PREFIX + "cart SET api_id = '" + ((this.session.data['api_id']) ? this.session.data['api_id'] : 0) + "', customer_id = '" + await this.customer.getId() + "', session_id = '" + this.db.escape(this.session.getId()) + "', product_id = '" + product_id + "', recurring_id = '" + recurring_id + "', `option` = '" + this.db.escape(JSON.stringify(option)) + "', quantity = '" + quantity + "', date_added = NOW()");
        } else {
            await this.db.query("UPDATE " + DB_PREFIX + "cart SET quantity = (quantity + " + quantity + ") WHERE api_id = '" + (this.session.data['api_id'] ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "' AND product_id = '" + product_id + "' AND recurring_id = '" + recurring_id + "' AND `option` = '" + this.db.escape(JSON.stringify(option)) + "'");
        }
    }

    async update(cart_id, quantity) {
        console.log("UPDATE " + DB_PREFIX + "cart SET quantity = '" + quantity + "' WHERE cart_id = '" + cart_id + "' AND api_id = '" + (this.session.data['api_id'] ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "'");
        await this.db.query("UPDATE " + DB_PREFIX + "cart SET quantity = '" + quantity + "' WHERE cart_id = '" + cart_id + "' AND api_id = '" + (this.session.data['api_id'] ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "'");
    }

    async remove(cart_id) {
        await this.db.query("DELETE FROM " + DB_PREFIX + "cart WHERE cart_id = '" + cart_id + "' AND api_id = '" + (this.session.data['api_id'] ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "'");
    }

    async clear() {
        await this.db.query("DELETE FROM " + DB_PREFIX + "cart WHERE api_id = '" + ((this.session.data['api_id']) ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "'");
    }

    async getRecurringProducts() {
        let product_data = [];

        for (let value of await this.getProducts()) {
            if (value['recurring']) {
                product_data.push(value);
            }
        }

        return product_data;
    }

    async getWeight() {
        let weight = 0;

        for (let product of await this.getProducts()) {
            if (product['shipping']) {
                weight += this.weight.convert(product['weight'], product['weight_class_id'], this.config.get('config_weight_class_id'));
            }
        }

        return weight;
    }

    async getSubTotal() {
        let total = 0;

        for (let product of await this.getProducts()) {
            total += product['total'];
        }

        return total;
    }

    async getTaxes() {
        const tax_data = {};

        for (let product of await this.getProducts()) {
            if (product['tax_class_id']) {
                const tax_rates = await this.tax.getRates(product['price'], product['tax_class_id']);

                for (let tax_rate of tax_rates) {
                    if (!tax_data[tax_rate['tax_rate_id']]) {
                        tax_data[tax_rate['tax_rate_id']] = (tax_rate['amount'] * product['quantity']);
                    } else {
                        tax_data[tax_rate['tax_rate_id']] += (tax_rate['amount'] * product['quantity']);
                    }
                }
            }
        }

        return tax_data;
    }

    async getTotal() {
        let total = 0;

        for (let product of await this.getProducts()) {
            total += this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')) * product['quantity'];
        }

        return total;
    }

    async countProducts() {
        let product_total = 0;

        const products = await this.getProducts();

        for (let product of products) {
            product_total += product['quantity'];
        }

        return product_total;
    }

    async hasProducts() {
        return (await this.getProducts()).length;
    }

    async hasRecurringProducts() {
        return (await this.getRecurringProducts()).length;
    }

    async hasStock() {
        for (let product of await this.getProducts()) {
            if (!product['stock']) {
                return false;
            }
        }

        return true;
    }

    async hasShipping() {
        for (let product of await this.getProducts()) {
            if (product['shipping']) {
                return true;
            }
        }

        return false;
    }

    async hasDownload() {
        for (let product of await this.getProducts()) {
            if (product['download']) {
                return true;
            }
        }

        return false;
    }
}
