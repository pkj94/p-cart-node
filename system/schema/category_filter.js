module.exports = {
    name: DB_PREFIX + 'category_filter',
    schema: {
        category_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "category"
        },
        filter_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "filter"
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