module.exports = {
    name: DB_PREFIX + 'product_filter',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        filter_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'filter'
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