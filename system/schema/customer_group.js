module.exports = {
    name: DB_PREFIX + 'customer_group',
    schema: {
        approval: {
            type: Boolean,
            default: false
        },
        sort_order: {
            type: Number,
            default: 1
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