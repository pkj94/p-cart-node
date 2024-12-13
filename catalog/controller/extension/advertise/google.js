module.exports = class ControllerExtensionAdvertiseGoogle extends Controller {
    store_id = 0;

    constructor(registry) {
        super(registry);

        if (typeof ADVERTISE_GOOGLE_STORE_ID != 'undefined') {
            this.store_id = ADVERTISE_GOOGLE_STORE_ID;
        } else {
            this.store_id = this.config.get('config_store_id');
        }

        this.loadStore(this.store_id);
    }

    async google_global_site_tag(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If there is no tracker, do nothing
        if (!this.setting.has('advertise_google_conversion_tracker')) {
            return;
        }

        const tracker = this.setting.get('advertise_google_conversion_tracker');

        // Insert the tags before the closing <head> tag
        output = output.replace('</head>', tracker['google_global_site_tag'] + '</head>');
    }

    async before_checkout_success(route, data) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If there is no tracker, do nothing
        if (!this.setting.has('advertise_google_conversion_tracker')) {
            return;
        }

        // In case there is no order, do nothing
        if (!(this.session.data['order_id'])) {
            return;
        }

        if (!this.registry.has('googleshopping')) {
            await this.loadLibrary(this.store_id);
        }

        this.load.model('checkout/order', this);
        this.load.model('extension/advertise/google', this);

        const order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

        const tracker = this.setting.get('advertise_google_conversion_tracker');
        constcurrency = order_info['currency_code'];

        const total = await this.googleshopping.convertAndFormat(order_info['total'], currency);

        const snippet = tracker['google_event_snippet'].replace('{VALUE}', total).replace('{CURRENCY}', currency);

        // Store the snippet to display it in the order success view
        let tax = 0;
        let shipping = 0;
        const coupon = await this.model_extension_advertise_google.getCoupon(order_info['order_id']);

        for (let order_total of await this.model_checkout_order.getOrderTotals(order_info['order_id'])) {
            if (order_total['code'] == 'shipping') {
                shipping += this.googleshopping.convertAndFormat(order_total['value'], currency);
            }

            if (order_total['code'] == 'tax') {
                tax += this.googleshopping.convertAndFormat(order_total['value'], currency);
            }
        }

        const order_products = await this.model_checkout_order.getOrderProducts(order_info['order_id']);

        for (let order_product of order_products) {
            order_product['option'] = await this.model_checkout_order.getOrderOptions(order_info['order_id'], order_product['order_product_id']);
        }

        const purchase_data = {
            'transaction_id': order_info['order_id'],
            'value': total,
            'currency': currency,
            'tax': tax,
            'shipping': shipping,
            'items': await this.model_extension_advertise_google.getRemarketingItems(order_products, order_info['store_id']),
            'ecomm_prodid': await this.model_extension_advertise_google.getRemarketingProductIds(order_products, order_info['store_id'])
        };

        if (coupon !== null) {
            purchase_data['coupon'] = coupon;
        }

        await this.googleshopping.setEventSnippet(snippet);
        await this.googleshopping.setPurchaseData(purchase_data);
    }

    async google_dynamic_remarketing_purchase(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If the library has not been loaded, or if there is no snippet, do nothing
        if (!this.registry.has('googleshopping') || await this.googleshopping.getEventSnippet() === null || await this.googleshopping.getPurchaseData() === null) {
            return;
        }

        data['send_to'] = await this.googleshopping.getEventSnippetSendTo();

        const purchase_data = await this.googleshopping.getPurchaseData();

        data['transaction_id'] = purchase_data['transaction_id'];
        data['value'] = purchase_data['value'];
        data['currency'] = purchase_data['currency'];
        data['tax'] = purchase_data['tax'];
        data['shipping'] = purchase_data['shipping'];
        data['items'] = JSON.parse(purchase_data['items']);
        data['ecomm_prodid'] = JSON.parse(purchase_data['ecomm_prodid']);
        data['ecomm_totalvalue'] = purchase_data['value'];

        const purchase_snippet = await this.load.view('extension/advertise/google_dynamic_remarketing_purchase', data);

        // Insert the snippet after the output
        output = output.replace('</body>', await this.googleshopping.getEventSnippet() + purchase_snippet + '</body>');
    }

    async google_dynamic_remarketing_home(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If we are not on the home page, do nothing
        if ((this.request.get['route']) && this.request.get['route'] != this.config.get('action_default')) {
            return;
        }

        if (!this.registry.has('googleshopping')) {
            await this.loadLibrary(this.store_id);
        }

        if (null === this.googleshopping.getEventSnippetSendTo()) {
            return;
        }

        data = {};
        data['send_to'] = await this.googleshopping.getEventSnippetSendTo();

        const snippet = await this.load.view('extension/advertise/google_dynamic_remarketing_home', data);

        // Insert the snippet after the output
        output = output.replace('</body>', snippet + '</body>');
    }

    async google_dynamic_remarketing_searchresults(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If we are not on the search page, do nothing
        if (!(this.request.get['route']) || this.request.get['route'] != 'product/search' || !(this.request.get['search'])) {
            return;
        }

        if (!this.registry.has('googleshopping')) {
            await this.loadLibrary(this.store_id);
        }

        if (null === await this.googleshopping.getEventSnippetSendTo()) {
            return;
        }

        data = {};
        data['send_to'] = await this.googleshopping.getEventSnippetSendTo();
        data['search_term'] = this.request.get['search'];

        const snippet = await this.load.view('extension/advertise/google_dynamic_remarketing_searchresults', data);

        // Insert the snippet after the output
        output = output.replace('</body>', snippet + '</body>');
    }

    async google_dynamic_remarketing_category(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If we are not on the search page, do nothing
        if (!(this.request.get['route']) || this.request.get['route'] != 'product/category') {
            return;
        }

        if (!this.registry.has('googleshopping')) {
            await this.loadLibrary(this.store_id);
        }

        if (null === await this.googleshopping.getEventSnippetSendTo()) {
            return;
        }
        let category_id = 0;
        if ((this.request.get['path'])) {
            const parts = this.request.get['path'].split('_');
            category_id = parts[parts.length - 1];
        } else if ((this.request.get['category_id'])) {
            category_id = this.request.get['category_id'];
        } else {
            category_id = 0;
        }

        this.load.model('extension/advertise/google', this);

        data = {};
        data['send_to'] = await this.googleshopping.getEventSnippetSendTo();
        data['description'] = (await this.model_extension_advertise_google.getHumanReadableOpenCartCategory(category_id)).replaceAll('"', '\\"');

        const snippet = await this.load.view('extension/advertise/google_dynamic_remarketing_category', data);

        // Insert the snippet after the output
        output = output.replace('</body>', snippet + '</body>');
    }

    async google_dynamic_remarketing_product(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If we do not know the viewed product, do nothing
        if (!(this.request.get['product_id']) || !(this.request.get['route']) || this.request.get['route'] != 'product/product') {
            return;
        }

        this.load.model('catalog/product', this);

        const product_info = await this.model_catalog_product.getProduct(this.request.get['product_id']);

        // If product does not exist, do nothing
        if (!product_info.product_id) {
            return;
        }

        if (!this.registry.has('googleshopping')) {
            await this.loadLibrary(this.store_id);
        }

        if (null === await this.googleshopping.getEventSnippetSendTo()) {
            return;
        }

        this.load.model('extension/advertise/google', this);

        const category_name = await this.model_extension_advertise_google.getHumanReadableCategory(product_info['product_id'], this.store_id);

        const option_map = await this.model_extension_advertise_google.getSizeAndColorOptionMap(product_info['product_id'], this.store_id);

        data = {};
        data['send_to'] = await this.googleshopping.getEventSnippetSendTo();
        data['option_map'] = JSON.parse(option_map);
        data['brand'] = product_info['manufacturer'];
        data['name'] = product_info['name'];
        data['category'] = category_name.replaceAll('"', '\\"');

        const snippet = await this.load.view('extension/advertise/google_dynamic_remarketing_product', data);

        // Insert the snippet after the output
        output = output.replace('</body>', snippet + '</body>');
    }

    async google_dynamic_remarketing_cart(route, data, output) {
        // In case the extension is disabled, do nothing
        if (!this.setting.get('advertise_google_status')) {
            return;
        }

        // If we are not on the cart page, do nothing
        if (!(this.request.get['route']) || this.request.get['route'] != 'checkout/cart') {
            return;
        }

        if (!this.registry.has('googleshopping')) {
            await this.loadLibrary(this.store_id);
        }

        if (null === await this.googleshopping.getEventSnippetSendTo()) {
            return;
        }

        this.load.model('catalog/product', this);
        this.load.model('extension/advertise/google', this);

        data = {};
        data['send_to'] = await this.googleshopping.getEventSnippetSendTo();
        data['ecomm_totalvalue'] = await this.cart.getTotal();
        data['ecomm_prodid'] = JSON.stringify(await this.model_extension_advertise_google.getRemarketingProductIds(await this.cart.getProducts(), this.store_id));
        data['items'] = JSON.stringify(await this.model_extension_advertise_google.getRemarketingItems(await this.cart.getProducts(), this.store_id));

        const snippet = await this.load.view('extension/advertise/google_dynamic_remarketing_cart', data);

        // Insert the snippet after the output
        output = output.replace('</body>', snippet + '</body>');
    }

    async cron(cron_id = null, code = null, cycle = null, date_added = null, date_modified = null) {
        await this.loadLibrary(this.store_id);

        if (!await this.validateCRON()) {
            // In case this is not a CRON task
            return;
        }

        await this.load.language('extension/advertise/google');

        // Reset taxes to use the store address and zone
        await this.tax.setShippingAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
        await this.tax.setPaymentAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));
        await this.tax.setStoreAddress(this.config.get('config_country_id'), this.config.get('config_zone_id'));

        await this.googleshopping.cron();
    }

    async validateCRON() {
        if (!this.setting.get('advertise_google_status')) {
            // In case the extension is disabled, do nothing
            return false;
        }

        if (!this.setting.get('advertise_google_gmc_account_selected')) {
            return false;
        }

        if (!this.setting.get('advertise_google_gmc_shipping_taxes_configured')) {
            return false;
        }

        try {
            if (this.googleshopping.getTargets(this.store_id).length === 0) {
                return false;
            }
        } catch (e) {
            return false;
        }

        if ((this.request.get['cron_token']) && this.request.get['cron_token'] == this.config.get('advertise_google_cron_token')) {
            return true;
        }

        if (ADVERTISE_GOOGLE_ROUTE) {
            return true;
        }

        return false;
    }
    async loadStore(store_id) {
        this.registry.set('setting', new Config());

        this.load.model('setting/setting', this);
        let settings = await this.model_setting_setting.getSetting('advertise_google', store_id);
        if (settings)
            for (let [key, value] of Object.entries(settings)) {
                this.setting.set(key, value);
            }
    }
}