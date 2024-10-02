module.exports = {
    name: DB_PREFIX + 'subscription',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "order"
        },
        orderProduct_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "order_product"
        },
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "store"
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "customer"
        },
        payment_address_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "address"
        },
        payment_method: {
            type: String,
            default: null
        },
        shipping_address_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "address"
        },
        shipping_Method: {
            type: String,
            default: null
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "product"
        },
        quantity: {
            type: Number,
            default: null
        },
        subscriptionPlan_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "subscription_plan"
        },
        trialPrice: {
            type: Number,
            default: null
        },
        trialFrequency: {
            type: String,
            enum: ['day', 'week', 'semiMonth', 'month', 'year'
            ],
            default: null
        },
        trial_cycle: {
            type: Number,
            default: null
        },
        trialDuration: {
            type: Number,
            default: null
        },
        trial_Remaining: {
            type: Number,
            default: null
        },
        trial_status: {
            type: Boolean,
            default: false
        },
        price: {
            type: Number,
            default: null
        },
        frequency: {
            type: String,
            enum: ['day', 'week', 'semiMonth', 'month', 'year'
            ],
            default: null
        },
        cycle: {
            type: Number,
            default: null
        },
        duration: {
            type: Number,
            default: null
        },
        remaining: {
            type: Number,
            default: null
        },
        date_next: {
            type: Date,
            default: null
        },
        comment: {
            type: String,
            default: null
        },
        subscription_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "subscription_status"
        },
        affiliate_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "affiliate"
        },
        marketing_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "language"
        },
        tracking: {
            type: String,
            default: null
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "language"
        },
        currency_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "currency"
        },
        ip: {
            type: String,
            default: null
        },
        forwardedIp: {
            type: String,
            default: null
        },
        user_agent: {
            type: String,
            default: null
        },
        accept_language: {
            type: String,
            default: null
        },
        created_by: {
            type: global.ObjectId,
            ref: DB_PREFIX + "user"
        },
        updated_by: {
            type: global.ObjectId,
            ref: DB_PREFIX + "user"
        },
    }
}