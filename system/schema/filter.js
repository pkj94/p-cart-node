module.exports = {
    name: DB_PREFIX + 'filter',
    schema: {
        filter_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "filter_group"
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