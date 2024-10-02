module.exports = {
    name: DB_PREFIX + 'category_path',
    schema: {
        category_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "category"
        },
        path_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "category"
        },
        level: {
            type: Number,
            default: 0
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