
module.exports = {
    name: DB_PREFIX + 'cart',
    schema: {
        api_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "api"
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "customer"
        },
        session_id: {
            type: String,
            default: '',
            trim: true
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "product"
        },
        subscription_plan_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "subscription_plan"
        },
        option: {
            type: String,
            default: '',
            trim: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        override: {
            type: Boolean,
            default: false
        },
        price: {
            type: Number,
            default: 0
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