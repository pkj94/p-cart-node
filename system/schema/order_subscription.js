module.exports = {
    name: DB_PREFIX + 'order_subscription',
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
            enum: ['day', 'week', 'semiMonth', 'month', 'year'],
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
            enum: ['day', 'week', 'semiMonth', 'month', 'year'],
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