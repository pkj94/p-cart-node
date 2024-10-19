module.exports = class CartLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.customer = registry.get('customer');
        this.session = registry.get('session');
        this.tax = registry.get('tax');
        this.weight = registry.get('weight');
        this.request = registry.get('request');
        this.data = {};
        this.init();
    }
    async init() {
        await this.db.query(`DELETE FROM \`${DB_PREFIX}cart\` WHERE (api_id > 0 OR customer_id = '0') AND date_added < DATE_SUB(NOW(), INTERVAL 1 HOUR)`);

        if (await this.customer.isLogged()) {
            await this.db.query(`UPDATE \`${DB_PREFIX}cart\` SET session_id = '${this.session.getId()}' WHERE api_id = '0' AND customer_id = ${await this.customer.getId()}`);
            const cart_query = this.db.query(`SELECT * FROM \`${DB_PREFIX}cart\` WHERE api_id = '0' AND customer_id = '0' AND session_id = '${this.session.getId()}'`);

            for (let cart of cart_query.rows) {
                await this.db.query(`DELETE FROM \`${DB_PREFIX}cart\` WHERE cart_id = ${cart.cart_id}`);
                await this.add(cart.product_id, cart.quantity, JSON.parse(cart.option), cart.subscription_plan_id, cart.override, cart.price);
            }
        }

        this.data = await this.getProducts();
    }
    async getProducts() {
        //await this.init();
        if (!Object.keys(this.data).length) {
            const apiId = this.session.data?.api_id ? parseInt(this.session.data.api_id) : 0;
            const cartQuery = await this.db.query(
                `SELECT * FROM ${DB_PREFIX}cart WHERE api_id = ${apiId} AND customer_id = ${await this.customer.getId()} AND session_id = '${this.session.getId()}'`);
            this.data = {};

            for (const cart of cartQuery.rows) {
                let stock = true;
                const productQuery = await this.db.query(
                    `SELECT * FROM ${DB_PREFIX}product_to_store p2s
               LEFT JOIN ${DB_PREFIX}product p ON (p2s.product_id = p.product_id)
               LEFT JOIN ${DB_PREFIX}product_description pd ON (p.product_id = pd.product_id)
               WHERE p2s.store_id = ${this.config.get('config_store_id')} AND p2s.product_id = ${cart.product_id} AND pd.language_id = ${this.config.get('config_language_id')}
               AND p.date_available <= NOW() AND p.status = '1'`);

                if (Object.keys(productQuery.row).length && cart.quantity > 0) {
                    let optionPrice = 0;
                    let optionPoints = 0;
                    let optionWeight = 0;
                    const optionData = [];
                    let productOptions = JSON.parse(cart.option || '{}');
                    const variant = JSON.parse(productQuery.row.variant || '{}');

                    if (variant) {
                        productOptions = { ...productOptions, ...variant };
                    }

                    for (const [productOptionId, value] of Object.entries(productOptions)) {
                        const productId = productQuery.row.master_id || cart.product_id;

                        const optionQuery = await this.db.query(
                            `SELECT po.product_option_id, po.option_id, od.name, o.type
                   FROM ${DB_PREFIX}product_option po
                   LEFT JOIN ${DB_PREFIX}option o ON (po.option_id = o.option_id)
                   LEFT JOIN ${DB_PREFIX}option_description od ON (o.option_id = od.option_id)
                   WHERE po.product_option_id = ${productOptionId} AND po.product_id = ${productId} AND od.language_id = ${this.config.get('config_language_id')}`);

                        if (Object.keys(optionQuery.row).length) {
                            const option = optionQuery.row;
                            if (['select', 'radio'].includes(option.type)) {
                                const optionValueQuery = await this.db.query(
                                    `SELECT pov.option_value_id, ovd.name, pov.quantity, pov.subtract,
                       pov.price, pov.price_prefix, pov.points, pov.points_prefix, pov.weight, pov.weight_prefix
                       FROM ${DB_PREFIX}product_option_value pov
                       LEFT JOIN ${DB_PREFIX}option_value ov ON (pov.option_value_id = ov.option_value_id)
                       LEFT JOIN ${DB_PREFIX}option_value_description ovd ON (ov.option_value_id = ovd.option_value_id)
                       WHERE pov.product_option_value_id = ${value} AND pov.product_option_id = ${productOptionId} AND ovd.language_id = ${this.config.get('config_language_id')}`);

                                if (Object.keys(optionValueQuery.row).length) {
                                    const optionValue = optionValueQuery.row;
                                    if (optionValue.price_prefix === '+')
                                        optionPrice += optionValue.price;
                                    else if (optionValue.price_prefix === '-')
                                        optionPrice -= optionValue.price;

                                    if (optionValue.points_prefix === '+')
                                        optionPoints += optionValue.points;
                                    else if (optionValue.points_prefix === '-')
                                        optionPoints -= optionValue.points;

                                    if (optionValue.weight_prefix === '+')
                                        optionWeight += optionValue.weight;
                                    else if (optionValue.weight_prefix === '-')
                                        optionWeight -= optionValue.weight;

                                    if (optionValue.subtract && (!optionValue.quantity || optionValue.quantity < cart.quantity)) {
                                        stock = false;
                                    }

                                    optionData.push({
                                        product_option_id: productOptionId,
                                        product_option_value_id: value,
                                        option_id: option.option_id,
                                        option_value_id: optionValue.option_value_id,
                                        name: option.name,
                                        value: optionValue.name,
                                        type: option.type,
                                        quantity: optionValue.quantity,
                                        subtract: optionValue.subtract,
                                        price: optionValue.price,
                                        price_prefix: optionValue.price_prefix,
                                        points: optionValue.points,
                                        points_prefix: optionValue.points_prefix,
                                        weight: optionValue.weight,
                                        weight_prefix: optionValue.weight_prefix,
                                    });
                                }
                            }
                            // Handle other option types here like 'checkbox', 'text', 'textarea', etc.
                        }
                    }

                    let price = productQuery.row.price;
                    const discountQuantity = cartQuery.rows.reduce((sum, item) => sum + (item.product_id === cart.product_id ? item.quantity : 0), 0);
                    const productDiscountQuery = await this.db.query(
                        `SELECT price FROM ${DB_PREFIX}product_discount
                 WHERE product_id = ${cart.product_id} AND customer_group_id = ${this.config.get('config_customer_group_id')} AND quantity <= ${discountQuantity}
                 AND (date_start = '0000-00-00' OR date_start < NOW())
                 AND (date_end = '0000-00-00' OR date_end > NOW())
                 ORDER BY quantity DESC, priority ASC, price ASC LIMIT 1`);

                    if (Object.keys(productDiscountQuery.row).length) {
                        price = productDiscountQuery.row.price;
                    }

                    const productSpecialQuery = await this.db.query(
                        `SELECT price FROM ${DB_PREFIX}product_special
                 WHERE product_id = ${cart.product_id} AND customer_group_id = ${this.config.get('config_customer_group_id')}
                 AND (date_start = '0000-00-00' OR date_start < NOW())
                 AND (date_end = '0000-00-00' OR date_end > NOW())
                 ORDER BY priority ASC, price ASC LIMIT 1`);

                    if (Object.keys(productSpecialQuery.row).length) {
                        price = productSpecialQuery.row.price;
                    }

                    // Calculate total product quantities and other relevant data...
                    this.data[cart.cart_id] = {
                        cart_id: cart.cart_id,
                        product_id: productQuery.row.product_id,
                        master_id: productQuery.row.master_id,
                        name: productQuery.row.name,
                        model: productQuery.row.model,
                        shipping: productQuery.row.shipping,
                        image: productQuery.row.image,
                        option: optionData,
                        quantity: cart.quantity,
                        stock: stock,
                        price: price + optionPrice,
                        total: (price + optionPrice) * cart.quantity,
                        // Add other relevant fields here...
                    };
                } else {
                    await this.remove(cart.cart_id);
                }
            }
        }
        return this.data;
    }
    async add(product_id, quantity = 1, option = [], subscription_plan_id = 0, override = false, price = 0) {
        //await this.init();
        const query = await this.db.query(
            "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "cart` WHERE `api_id` = " + (this.session.data.api_id || 0) + " AND `customer_id` = " + await this.customer.getId() + " AND `session_id` = '" + this.session.getId() + "' AND `product_id` = " + product_id + " AND `subscription_plan_id` = " + subscription_plan_id + " AND `option` = '" + JSON.stringify(option) + "'");
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
        //await this.init();
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
            if (product.subscription) {
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
            total += product.total;
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
            total += this.tax.calculate(product.price, product.tax_class_id, Number(this.config.get('config_tax'))) * product.quantity;
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
        return !!(await this.getProducts()).length;
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
