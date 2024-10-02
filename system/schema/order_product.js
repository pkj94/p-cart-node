module.exports = {
    name: DB_PREFIX + 'order_product',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order'
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        master_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        name: {
            type: String,
            default: ''
        },
        model: {
            type: String,
            default: ''
        },
        quantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        reward: {
            type: Number,
            default: 0
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