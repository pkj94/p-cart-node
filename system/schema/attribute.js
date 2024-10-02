module.exports = {
    name: DB_PREFIX + 'attribute',
    schema: {
        attribute_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "attribute_group"
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