module.exports = {
    name: DB_PREFIX + 'product_subscription',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        subscriptionPlan_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'subscription_plan'
        },
        customer_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer_group'
        },
        trialPrice: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: 0,
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