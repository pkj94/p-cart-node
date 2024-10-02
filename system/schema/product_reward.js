module.exports = {
    name: DB_PREFIX + 'product_reward',
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
        points: {
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