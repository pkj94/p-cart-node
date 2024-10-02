module.exports = {
    name: DB_PREFIX + 'product_discount',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        customer_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer_group'
        },
        quantity: {
            type: Number,
            default: 1
        },
        priority: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            default: 0
        },
        date_start: {
            type: Date,
            default: new Date()
        },
        dateEnd: {
            type: Date,
            default: new Date()
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