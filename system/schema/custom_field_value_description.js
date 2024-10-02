module.exports = {
    name: DB_PREFIX + 'custom_field_value_description',
    schema: {
        custom_field_value_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "custom_field_value",
        },
        custom_field_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "custom_field",
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language",
        },
        name: {
            type: String,
            default: ''
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