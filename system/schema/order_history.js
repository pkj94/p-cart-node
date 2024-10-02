module.exports = {
    name: DB_PREFIX + 'order_history',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order'
        },
        order_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order_status'
        },
        notify: {
            type: Boolean,
            default: false
        },
        comment: {
            type: String,
            default: ''
        },
        created_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
        updated_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
    }
}