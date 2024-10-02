module.exports = {
    name: DB_PREFIX + 'category_to_layout',
    schema: {
        category_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "category"
        },
        store_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "store"
        },
        layout_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "layout"
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