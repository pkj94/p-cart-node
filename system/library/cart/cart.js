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
        await this.db.query(`DELETE FROM \`${DB_PREFIX}cart\` WHERE (api_id > 0 OR customer_id = '0') AND date_added < DATE_SUB(NOW(), INTERVAL 1 HOUR)`);

        if (await this.customer.isLogged()) {
            await this.db.query(`UPDATE \`${DB_PREFIX}cart\` SET session_id = '${this.session.getId()}' WHERE api_id = '0' AND customer_id = ${await this.customer.getId()}`);
            const cart_query = await this.db.query(`SELECT * FROM \`${DB_PREFIX}cart\` WHERE api_id = '0' AND customer_id = '0' AND session_id = '${this.session.getId()}'`);

            for (let cart of cart_query.rows) {
                await this.db.query(`DELETE FROM \`${DB_PREFIX}cart\` WHERE cart_id = ${cart.cart_id}`);
                await this.add(cart.product_id, cart.quantity, JSON.parse(cart.option), cart.subscription_plan_id, cart.override, cart.price);
            }
        }

        this.data = await this.getProducts();
    }
    async getProducts() {
        if (!Object.keys(this.data).length) {
            const cart_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cart` WHERE `api_id` = '" + (this.session.data['api_id'] ? this.session.data['api_id'] : 0) + "' AND `customer_id` = '" + await this.customer.getId() + "' AND `session_id` = " + this.db.escape(this.session.getId()));

            for (let cart of cart_query.rows) {
                let stock = true;

                const product_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_store` `p2s` LEFT JOIN `" + DB_PREFIX + "product` p ON (p2s.`product_id` = p.`product_id`) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.`product_id` = pd.`product_id`) WHERE p2s.`store_id` = '" + this.config.get('config_store_id') + "' AND p2s.`product_id` = '" + cart['product_id'] + "' AND pd.`language_id` = '" + this.config.get('config_language_id') + "' AND p.`date_available` <= NOW() AND p.`status` = '1'");

                if (product_query.num_rows && (cart['quantity'] > 0)) {
                    let option_price = 0;
                    let option_points = 0;
                    let option_weight = 0;

                    let option_data = [];

                    let product_options = cart['option'] ? JSON.parse(cart['option']) : {};

                    // Merge variant code with options
                    let variant = product_query.row['variant'] ? JSON.parse(product_query.row['variant']) : {};

                    if (variant) {
                        for (let [key, value] of Object.entries(variant)) {
                            product_options[key] = value;
                        }
                    }

                    for (let [product_option_id, value] of Object.entries(product_options)) {
                        let product_id = product_query.row['master_id'];
                        if (!product_query.row['master_id']) {
                            product_id = cart['product_id'];
                        }

                        const option_query = await this.db.query("SELECT po.`product_option_id`, po.`option_id`, od.`name`, o.`type` FROM `" + DB_PREFIX + "product_option` po LEFT JOIN `" + DB_PREFIX + "option` o ON (po.`option_id` = o.`option_id`) LEFT JOIN `" + DB_PREFIX + "option_description` od ON (o.`option_id` = od.`option_id`) WHERE po.`product_option_id` = '" + product_option_id + "' AND po.`product_id` = '" + product_id + "' AND od.`language_id` = '" + this.config.get('config_language_id') + "'");

                        if (option_query.num_rows) {
                            if (option_query.row['type'] == 'select' || option_query.row['type'] == 'radio') {
                                const option_value_query = await this.db.query("SELECT pov.`option_value_id`, ovd.`name`, pov.`quantity`, pov.`subtract`, pov.`price`, pov.`price_prefix`, pov.`points`, pov.`points_prefix`, pov.`weight`, pov.`weight_prefix` FROM `" + DB_PREFIX + "product_option_value` pov LEFT JOIN `" + DB_PREFIX + "option_value` ov ON (pov.`option_value_id` = ov.`option_value_id`) LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (ov.`option_value_id` = ovd.`option_value_id`) WHERE pov.`product_option_value_id` = '" + value + "' AND pov.`product_option_id` = '" + product_option_id + "' AND ovd.`language_id` = '" + this.config.get('config_language_id') + "'");

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
                                    const option_value_query = await this.db.query("SELECT pov.`option_value_id`, pov.`quantity`, pov.`subtract`, pov.`price`, pov.`price_prefix`, pov.`points`, pov.`points_prefix`, pov.`weight`, pov.`weight_prefix`, ovd.`name` FROM `" + DB_PREFIX + "product_option_value` `pov` LEFT JOIN `" + DB_PREFIX + "option_value_description` ovd ON (pov.`option_value_id` = ovd.option_value_id) WHERE pov.product_option_value_id = '" + product_option_value_id + "' AND pov.product_option_id = '" + product_option_id + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "'");

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

                    const product_discount_query = await this.db.query("SELECT `price` FROM `" + DB_PREFIX + "product_discount` WHERE `product_id` = '" + cart['product_id'] + "' AND `customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND `quantity` <= '" + discount_quantity + "' AND ((`date_start` = '0000-00-00' OR `date_start` < NOW()) AND (`date_end` = '0000-00-00' OR `date_end` > NOW())) ORDER BY `quantity` DESC, `priority` ASC, `price` ASC LIMIT 1");

                    if (product_discount_query.num_rows) {
                        price = product_discount_query.row['price'];
                    }

                    // Product Specials
                    const product_special_query = await this.db.query("SELECT `price` FROM `" + DB_PREFIX + "product_special` WHERE `product_id` = '" + cart['product_id'] + "' AND `customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND ((`date_start` = '0000-00-00' OR `date_start` < NOW()) AND (`date_end` = '0000-00-00' OR `date_end` > NOW())) ORDER BY `priority` ASC, `price` ASC LIMIT 1");

                    if (product_special_query.num_rows) {
                        price = product_special_query.row['price'];
                    }

                    let product_total = 0;

                    for (let cart_2 of cart_query.rows) {
                        if (cart_2['product_id'] == cart['product_id']) {
                            product_total += cart_2['quantity'];
                        }
                    }
                    let minimum = true;
                    if (product_query.row['minimum'] > product_total) {
                        minimum = false;
                    }

                    // Reward Points
                    let product_reward_query = await this.db.query("SELECT `points` FROM `" + DB_PREFIX + "product_reward` WHERE `product_id` = '" + cart['product_id'] + "' AND `customer_group_id` = '" + this.config.get('config_customer_group_id') + "'");
                    let reward = 0;
                    if (product_reward_query.num_rows) {
                        reward = product_reward_query.row['points'];
                    }

                    // Downloads
                    let download_data = [];

                    const download_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_to_download` p2d LEFT JOIN `" + DB_PREFIX + "download` d ON (p2d.`download_id` = d.`download_id`) LEFT JOIN `" + DB_PREFIX + "download_description` dd ON (d.`download_id` = dd.`download_id`) WHERE p2d.`product_id` = '" + cart['product_id'] + "' AND dd.`language_id` = '" + this.config.get('config_language_id') + "'");

                    for (let download of download_query.rows) {
                        download_data.push({
                            'download_id': download['download_id'],
                            'name': download['name'],
                            'filename': download['filename'],
                            'mask': download['mask']
                        });
                    }

                    // Stock
                    if (!product_query.row['quantity'] || (product_query.row['quantity'] < cart['quantity'])) {
                        stock = false;
                    }

                    let subscription_data = {};
                    const subscription_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_subscription` ps LEFT JOIN `" + DB_PREFIX + "subscription_plan` sp ON (ps.`subscription_plan_id` = sp.`subscription_plan_id`) LEFT JOIN `" + DB_PREFIX + "subscription_plan_description` spd ON (sp.`subscription_plan_id` = spd.`subscription_plan_id`) WHERE ps.`product_id` = '" + cart['product_id'] + "' AND ps.`subscription_plan_id` = '" + cart['subscription_plan_id'] + "' AND ps.`customer_group_id` = '" + this.config.get('config_customer_group_id') + "' AND spd.`language_id` = '" + this.config.get('config_language_id') + "' AND sp.`status` = '1'");

                    if (subscription_query.num_rows) {
                        price = subscription_query.row['price'];

                        if (subscription_query.row['trial_status']) {
                            price = subscription_query.row['trial_price'];
                        }

                        subscription_data = {
                            'subscription_plan_id': subscription_query.row['subscription_plan_id'],
                            'name': subscription_query.row['name'],
                            'trial_price': subscription_query.row['trial_price'],
                            'trial_frequency': subscription_query.row['trial_frequency'],
                            'trial_cycle': subscription_query.row['trial_cycle'],
                            'trial_duration': subscription_query.row['trial_duration'],
                            'trial_remaining': subscription_query.row['trial_duration'],
                            'trial_status': subscription_query.row['trial_status'],
                            'price': subscription_query.row['price'],
                            'frequency': subscription_query.row['frequency'],
                            'cycle': subscription_query.row['cycle'],
                            'duration': subscription_query.row['duration'],
                            'remaining': subscription_query.row['duration']
                        };
                    }

                    if (cart['override']) {
                        price = cart['price'];
                    }

                    this.data[cart['cart_id']] = {
                        'cart_id': cart['cart_id'],
                        'product_id': product_query.row['product_id'],
                        'master_id': product_query.row['master_id'],
                        'name': product_query.row['name'],
                        'model': product_query.row['model'],
                        'shipping': product_query.row['shipping'],
                        'image': product_query.row['image'],
                        'option': option_data,
                        'subscription': subscription_data,
                        'download': download_data,
                        'quantity': cart['quantity'],
                        'minimum': minimum,
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
                        'length_class_id': product_query.row['length_class_id']
                    };
                } else {
                    this.remove(cart['cart_id']);
                }
            }
        }

        return this.data;
    }
    async add(product_id, quantity = 1, option = [], subscription_plan_id = 0, override = false, price = 0) {
        //await this.init();
        const query = await this.db.query(
            "SELECT COUNT(*) as  `total` FROM `" + DB_PREFIX + "cart` WHERE `api_id` = " + (this.session.data.api_id || 0) + " AND `customer_id` = " + await this.customer.getId() + " AND `session_id` = '" + this.session.getId() + "' AND `product_id` = " + product_id + " AND `subscription_plan_id` = " + subscription_plan_id + " AND `option` = '" + JSON.stringify(option) + "'");
        if (!query.row.total) {
            await this.db.query(
                "INSERT INTO `" + DB_PREFIX + "cart` SET `api_id` = " + (this.session.data.api_id || 0) + ", `customer_id` = " + await this.customer.getId() + ", `session_id` = '" + this.session.getId() + "', `product_id` = " + product_id + ", `subscription_plan_id` = " + subscription_plan_id + ", `option` = '" + JSON.stringify(option) + "', `quantity` = " + quantity + ", `override` = '" + override + "', `price` = " + (override ? price : 0) + ", `date_added` = NOW()");
        } else {
            await this.db.query(
                "UPDATE `" + DB_PREFIX + "cart` SET `quantity` = (`quantity` + " + quantity + ") WHERE `api_id` = " + (this.session.data.api_id || 0) + " AND `customer_id` = " + await this.customer.getId() + " AND `session_id` = '" + this.session.getId() + "' AND `product_id` = " + product_id + " AND `subscription_plan_id` = " + subscription_plan_id + " AND `option` = '" + JSON.stringify(option) + "'");
        }

        this.data = await this.getProducts();
    }

    async update(cart_id, quantity) {
        //await this.init();
        await this.db.query(
            "UPDATE `" + DB_PREFIX + "cart` SET `quantity` = " + quantity + " WHERE `cart_id` = " + cart_id + " AND `api_id` = " + (this.session.data.api_id || 0) + " AND `customer_id` = " + await this.customer.getId() + " AND `session_id` = '" + this.session.getId() + "'");
        this.data = await this.getProducts();
    }

    async has(cart_id) {
        await this.init();
        return !!this.data[cart_id];
    }

    async remove(cart_id) {
        //await this.init();
        await this.db.query("DELETE FROM `" + DB_PREFIX + "cart` WHERE `cart_id` = " + cart_id + " AND `api_id` = " + (this.session.data.api_id || 0) + " AND `customer_id` = " + await this.customer.getId() + " AND `session_id` = '" + this.session.getId() + "'");
        delete this.data[cart_id];
    }

    async clear() {
        //await this.init();
        await this.db.query("DELETE FROM `" + DB_PREFIX + "cart` WHERE `api_id` = " + (this.session.data.api_id || 0) + " AND `customer_id` = " + await this.customer.getId() + " AND `session_id` = '" + this.session.getId() + "'");
        this.data = [];
    }

    async getSubscriptions() {
        const productData = [];
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            if (product.subscription.subscription_plan_id) {
                productData.push(product);
            }
        }
        return productData;
    }

    async getWeight() {
        let totalWeight = 0;
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            if (product.shipping) {
                totalWeight += this.weight.convert(product.weight, product.weight_class_id, this.config.get('config_weight_class_id'));
            }
        }
        return totalWeight;
    }

    async getSubTotal() {
        let total = 0;
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            total = total + product.total;
        }
        return total;
    }

    async getTaxes() {
        const taxData = {};
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            if (product.tax_class_id) {
                const taxRates = await this.tax.getRates(product.price, product.tax_class_id);
                for (const rate of taxRates) {
                    taxData[rate.tax_rate_id] = (taxData[rate.tax_rate_id] || 0) + rate.amount * product.quantity;
                }
            }
        }
        return taxData;
    }

    async getTotal() {
        let total = 0;
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            total = total + (this.tax.calculate(product.price, product.tax_class_id, Number(this.config.get('config_tax'))) * product.quantity);
        }
        return total;
    }

    async countProducts() {
        let totalProducts = 0;
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            totalProducts += product.quantity;
        }
        return totalProducts;
    }

    async hasProducts() {
        return Object.keys(await this.getProducts()).length;
    }

    async hasSubscription() {
        return !!(await this.getSubscriptions()).length;
    }

    async hasStock() {
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            if (!product.stock) {
                return false;
            }
        }
        return true;
    }

    async hasShipping() {
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            if (product.shipping) {
                return true;
            }
        }
        return false;
    }

    async hasDownload() {
        const products = await this.getProducts();
        for (const [cart_id, product] of Object.entries(products)) {
            if (product.download) {
                return true;
            }
        }
        return false;
    }
}
