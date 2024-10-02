module.exports = {
    name: DB_PREFIX + 'product_to_layout',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'store'
        },
        layout_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'layout'
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