module.exports = {
    name: DB_PREFIX + 'category_to_store',
    schema: {
        category_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "category"
        },
        store_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "store"
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