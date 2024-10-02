module.exports = {
    name: DB_PREFIX + 'api',
    schema: {
        username: {
            type: String,
            default: ''
        },
        key: {
            type: String,
            default: ''
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