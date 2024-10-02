module.exports = {
    name: DB_PREFIX + 'custom_field_value',
    schema: {
        custom_field_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "custom_field",
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