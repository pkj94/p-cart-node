module.exports = {
    name: DB_PREFIX + 'order',
    schema: {
        subscription_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'subscription'
        },
        invoice_no: {
            type: Number,
            default: 1,
        },
        invoicePrefix: {
            type: String,
            default: null,
        },
        transaction_id: {
            type: String,
            default: null,
        },
        store_id: {
            type: global.ObjectId,
            default: null,
            res: DB_PREFIX + 'store'
        },
        store_name: {
            type: String,
            default: null,
        },
        store_url: {
            type: String,
            default: null,
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
        },
        customer_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer_group'
        },
        firstname: {
            type: String,
            default: null,
        },
        lastname: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        telephone: {
            type: String,
            default: null,
        },
        custom_field: {
            type: Object,
            default: {}
        },
        payment_address_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'address'
        },
        paymentFirstname: {
            type: String,
            default: null,
        },
        payment_lastname: {
            type: String,
            default: null,
        },
        payment_company: {
            type: String,
            default: null,
        },
        payment_address_1: {
            type: String,
            default: null,
        },
        payment_address_2: {
            type: String,
            default: null,
        },
        payment_city: {
            type: String,
            default: null,
        },
        paymentPostcode: {
            type: String,
            default: null,
        },
        payment_country: {
            type: String,
            default: null,
        },
        payment_country_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'country'
        },
        payment_zone: {
            type: String,
            default: null,
        },
        payment_zone_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'zone'
        },
        payment_addressFormat: {
            type: String,
            default: null,
        },
        payment_custom_field: {
            type: String,
            default: null,
        },
        payment_method: {
            type: Object,
            default: {},
        },
        shipping_address_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'address'
        },
        shippingFirstname: {
            type: String,
            default: null,
        },
        shipping_lastname: {
            type: String,
            default: null,
        },
        shipping_company: {
            type: String,
            default: null,
        },
        shipping_address_1: {
            type: String,
            default: null,
        },
        shipping_address_2: {
            type: String,
            default: null,
        },
        shipping_city: {
            type: String,
            default: null,
        },
        shippingPostcode: {
            type: String,
            default: null,
        },
        shipping_country: {
            type: String,
            default: null,
        },
        shipping_country_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'country'
        },
        shipping_zone: {
            type: String,
            default: null,
        },
        shipping_zone_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'zone'
        },
        shipping_addressFormat: {
            type: String,
            default: null,
        },
        shipping_custom_field: {
            type: Object,
            default: {},
        },
        shipping_Method: {
            type: Object,
            default: {},
        },
        comment: {
            type: String,
            default: null,
        },
        total: {
            type: Number,
            default: 0.0000,
        },
        order_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order_status'
        },
        affiliate_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'afffiliate'
        },
        commission: {
            type: Number,
            default: null,
        },
        marketing_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'marketing'
        },
        tracking: {
            type: String,
            default: null,
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        language_code: {
            type: String,
            default: null,
        },
        currency_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'currency'
        },
        currency_code: {
            type: String,
            default: null,
        },
        currency_value: {
            type: Number,
            default: 1.00000000,
        },
        ip: {
            type: String,
            default: null,
        },
        forwardedIp: {
            type: String,
            default: null,
        },
        user_agent: {
            type: String,
            default: null,
        },
        accept_language: {
            type: String,
            default: null
        },
        created_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
        updated_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
    }
}