module.exports = {
    name: DB_PREFIX + 'return_history',
    schema: {
        return_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'return'
        },
        return_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'return_status'
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