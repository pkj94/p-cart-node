module.exports = {
    name: DB_PREFIX + 'custom_field_customer_group',
    schema: {
        custom_field_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "custom_field",
        },
        customer_group_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "customer_group",
        },
        required: {
            type: Boolean,
            default: false
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