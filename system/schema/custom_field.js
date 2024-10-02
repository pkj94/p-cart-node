module.exports = {
    name: DB_PREFIX + 'custom_field',
    schema: {
        type: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        },
        validation: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        sort_order: {
            type: Number,
            default: 1
        },
        status: {
            type: Boolean,
            default: true
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