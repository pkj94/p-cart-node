module.exports = {
    name: DB_PREFIX + 'subscription_history',
    schema: {
        subscription_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'subscription'
        },
        subscription_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'subscription_status'
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