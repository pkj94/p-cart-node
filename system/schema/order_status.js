module.exports = {
    name: DB_PREFIX + 'order_status',
    schema: {
        order_status_id: {
            type: global.ObjectId,
            default: ''
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        name: {
            type: String,
            default: '',
            trim: true
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