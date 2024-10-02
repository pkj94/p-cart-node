module.exports = {
    name: DB_PREFIX + 'product_to_category',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        category_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'category'
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