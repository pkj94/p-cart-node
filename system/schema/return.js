module.exports = {
    name: DB_PREFIX + 'return',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order'
        },
        subscription_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'subscription'
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
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
        product: {
            type: String,
            default: null,
            trim: true
        },
        model: {
            type: String,
            default: null,
            trim: true
        },
        quantity: {
            type: Number,
            default: 0.0000,
        },
        opened: {
            type: Boolean,
            default: false
        },
        returnReason_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'return_reason'
        },
        return_action_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'return_action'
        },
        return_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'return_status'
        },
        comment: {
            type: String,
            default: ''
        },
        dateOrdered: {
            type: Date,
            default: new Date(),
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