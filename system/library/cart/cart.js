module.exports = class CartLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.customer = registry.get('customer');
        this.session = registry.get('session');
        this.tax = registry.get('tax');
        this.weight = registry.get('weight');
        this.data = [];
        this.init();
    }
    async init() {
        await this.db.query(`DELETE FROM ${DB_PREFIX}cart WHERE (api_id > '0' OR customer_id = '0') AND date_added < DATE_SUB(NOW(), INTERVAL 1 HOUR)`);

        if (this.customer.isLogged()) {
            await this.db.query(`UPDATE cart SET session_id = '${this.session.getId()}' WHERE api_id = '0' AND customer_id = ${this.customer.getId()}`);
            const cart_query = this.db.query(`SELECT * FROM ${DB_PREFIX}cart WHERE api_id = '0' AND customer_id = '0' AND session_id = '${this.session.getId()}'`);

            for (let cart of cart_query.rows) {
                await this.db.query(`DELETE FROM ${DB_PREFIX}cart WHERE cart_id = ${cart.cart_id}`);
                this.add(cart.product_id, cart.quantity, JSON.parse(cart.option), cart.subscription_plan_id, cart.override, cart.price);
            }
        }

        this.data = await this.getProducts();
    }
    async getProducts() {
        if (!this.data) {
            const apiId = this.session.data?.api_id ? parseInt(this.session.data.api_id) : 0;
            const cartQuery = await this.db.query(
                `SELECT * FROM ${DB_PREFIX}cart WHERE api_id = ? AND customer_id = ? AND session_id = ?`,
                [apiId, this.customerId, this.session.id]
            );

            this.data = {};

            for (const cart of cartQuery[0]) {
                let stock = true;
                const productQuery = await this.db.query(
                    `SELECT * FROM ${DB_PREFIX}product_to_store p2s
               LEFT JOIN ${DB_PREFIX}product p ON (p2s.product_id = p.product_id)
               LEFT JOIN ${DB_PREFIX}product_description pd ON (p.product_id = pd.product_id)
               WHERE p2s.store_id = ? AND p2s.product_id = ? AND pd.language_id = ?
               AND p.date_available <= NOW() AND p.status = '1'`,
                    [this.config.config_store_id, cart.product_id, this.config.config_language_id]
                );

                if (productQuery[0].length && cart.quantity > 0) {
                    let optionPrice = 0;
                    let optionPoints = 0;
                    let optionWeight = 0;
                    const optionData = [];
                    let productOptions = JSON.parse(cart.option || '{}');
                    const variant = JSON.parse(productQuery[0][0].variant || '{}');

                    if (variant) {
                        productOptions = { ...productOptions, ...variant };
                    }

                    for (const [productOptionId, value] of Object.entries(productOptions)) {
                        const productId = productQuery[0][0].master_id || cart.product_id;

                        const optionQuery = await this.db.query(
                            `SELECT po.product_option_id, po.option_id, od.name, o.type
                   FROM ${DB_PREFIX}product_option po
                   LEFT JOIN ${DB_PREFIX}option o ON (po.option_id = o.option_id)
                   LEFT JOIN ${DB_PREFIX}option_description od ON (o.option_id = od.option_id)
                   WHERE po.product_option_id = ? AND po.product_id = ? AND od.language_id = ?`,
                            [productOptionId, productId, this.config.config_language_id]
                        );

                        if (optionQuery[0].length) {
                            const option = optionQuery[0][0];
                            if (['select', 'radio'].includes(option.type)) {
                                const optionValueQuery = await this.db.query(
                                    `SELECT pov.option_value_id, ovd.name, pov.quantity, pov.subtract,
                       pov.price, pov.price_prefix, pov.points, pov.points_prefix, pov.weight, pov.weight_prefix
                       FROM ${DB_PREFIX}product_option_value pov
                       LEFT JOIN ${DB_PREFIX}option_value ov ON (pov.option_value_id = ov.option_value_id)
                       LEFT JOIN ${DB_PREFIX}option_value_description ovd ON (ov.option_value_id = ovd.option_value_id)
                       WHERE pov.product_option_value_id = ? AND pov.product_option_id = ? AND ovd.language_id = ?`,
                                    [value, productOptionId, this.config.config_language_id]
                                );

                                if (optionValueQuery[0].length) {
                                    const optionValue = optionValueQuery[0][0];
                                    if (optionValue.price_prefix === '+') optionPrice += optionValue.price;
                                    else if (optionValue.price_prefix === '-') optionPrice -= optionValue.price;

                                    if (optionValue.points_prefix === '+') optionPoints += optionValue.points;
                                    else if (optionValue.points_prefix === '-') optionPoints -= optionValue.points;

                                    if (optionValue.weight_prefix === '+') optionWeight += optionValue.weight;
                                    else if (optionValue.weight_prefix === '-') optionWeight -= optionValue.weight;

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

                    let price = productQuery[0][0].price;
                    const discountQuantity = cartQuery[0].reduce((sum, item) => sum + (item.product_id === cart.product_id ? item.quantity : 0), 0);

                    const productDiscountQuery = await this.db.query(
                        `SELECT price FROM ${DB_PREFIX}product_discount
                 WHERE product_id = ? AND customer_group_id = ? AND quantity <= ?
                 AND (date_start = '0000-00-00' OR date_start < NOW())
                 AND (date_end = '0000-00-00' OR date_end > NOW())
                 ORDER BY quantity DESC, priority ASC, price ASC LIMIT 1`,
                        [cart.product_id, this.config.config_customer_group_id, discountQuantity]
                    );

                    if (productDiscountQuery[0].length) {
                        price = productDiscountQuery[0][0].price;
                    }

                    const productSpecialQuery = await this.db.query(
                        `SELECT price FROM ${DB_PREFIX}product_special
                 WHERE product_id = ? AND customer_group_id = ?
                 AND (date_start = '0000-00-00' OR date_start < NOW())
                 AND (date_end = '0000-00-00' OR date_end > NOW())
                 ORDER BY priority ASC, price ASC LIMIT 1`,
                        [cart.product_id, this.config.config_customer_group_id]
                    );

                    if (productSpecialQuery[0].length) {
                        price = productSpecialQuery[0][0].price;
                    }

                    // Calculate total product quantities and other relevant data...

                    this.data[cart.cart_id] = {
                        cart_id: cart.cart_id,
                        product_id: productQuery[0][0].product_id,
                        master_id: productQuery[0][0].master_id,
                        name: productQuery[0][0].name,
                        model: productQuery[0][0].model,
                        shipping: productQuery[0][0].shipping,
                        image: productQuery[0][0].image,
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
        const query = await this.db.query(
            "SELECT COUNT(*) AS `total` FROM "+DB_PREFIX+"`cart` WHERE `api_id` = ? AND `customer_id` = ? AND `session_id` = ? AND `product_id` = ? AND `subscription_plan_id` = ? AND `option` = ?",
            [
                this.session.data.api_id || 0,
                this.customer.getId(),
                this.session.getId(),
                product_id,
                subscription_plan_id,
                JSON.stringify(option)
            ]
        );

        if (!query[0][0].total) {
            await this.db.query(
                "INSERT INTO `cart` SET `api_id` = ?, `customer_id` = ?, `session_id` = ?, `product_id` = ?, `subscription_plan_id` = ?, `option` = ?, `quantity` = ?, `override` = ?, `price` = ?, `date_added` = NOW()",
                [
                    this.session.data.api_id || 0,
                    this.customer.getId(),
                    this.session.getId(),
                    product_id,
                    subscription_plan_id,
                    JSON.stringify(option),
                    quantity,
                    override,
                    override ? price : 0
                ]
            );
        } else {
            await this.db.query(
                "UPDATE `cart` SET `quantity` = (`quantity` + ?) WHERE `api_id` = ? AND `customer_id` = ? AND `session_id` = ? AND `product_id` = ? AND `subscription_plan_id` = ? AND `option` = ?",
                [
                    quantity,
                    this.session.data.api_id || 0,
                    this.customer.getId(),
                    this.session.getId(),
                    product_id,
                    subscription_plan_id,
                    JSON.stringify(option)
                ]
            );
        }

        this.data = await this.getProducts();
    }

    async update(cart_id, quantity) {
        await this.db.query(
            "UPDATE `cart` SET `quantity` = ? WHERE `cart_id` = ? AND `api_id` = ? AND `customer_id` = ? AND `session_id` = ?",
            [quantity, cart_id, this.session.data.api_id || 0, this.customer.getId(), this.session.getId()]
        );
        this.data = await this.getProducts();
    }

    has(cart_id) {
        return !!this.data[cart_id];
    }

    async remove(cart_id) {
        await this.db.query("DELETE FROM "+DB_PREFIX+"`cart` WHERE `cart_id` = ? AND `api_id` = ? AND `customer_id` = ? AND `session_id` = ?", [cart_id, this.session.data.api_id || 0, this.customer.getId(), this.session.getId()]);
        delete this.data[cart_id];
    }

    async clear() {
        await this.db.query("DELETE FROM ${DB_PREFIX}`cart` WHERE `api_id` = ? AND `customer_id` = ? AND `session_id` = ?", [this.session.data.api_id || 0, this.customer.getId(), this.session.getId()]);
        this.data = [];
    }

    async getSubscriptions() {
        const productData = [];
        const products = await this.getProducts();
        for (const product of products) {
            if (product.subscription) {
                productData.push(product);
            }
        }
        return productData;
    }

    async getWeight() {
        let totalWeight = 0;
        const products = await this.getProducts();
        for (const product of products) {
            if (product.shipping) {
                totalWeight += this.weight.convert(product.weight, product.weight_class_id, this.config.get('config_weight_class_id'));
            }
        }
        return totalWeight;
    }

    async getSubTotal() {
        let total = 0;
        const products = await this.getProducts();
        for (const product of products) {
            total += product.total;
        }
        return total;
    }

    async getTaxes() {
        const taxData = {};
        const products = await this.getProducts();
        for (const product of products) {
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
        for (const product of products) {
            total += this.tax.calculate(product.price, product.tax_class_id, this.config.get('config_tax')) * product.quantity;
        }
        return total;
    }

    async countProducts() {
        let totalProducts = 0;
        const products = await this.getProducts();
        for (const product of products) {
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
        for (const product of products) {
            if (!product.stock) {
                return false;
            }
        }
        return true;
    }

    async hasShipping() {
        const products = await this.getProducts();
        for (const product of products) {
            if (product.shipping) {
                return true;
            }
        }
        return false;
    }

    async hasDownload() {
        const products = await this.getProducts();
        for (const product of products) {
            if (product.download) {
                return true;
            }
        }
        return false;
    }
}
