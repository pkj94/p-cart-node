module.exports = {
    name: DB_PREFIX + 'user_authorize',
    schema: {
        user_id: {
            type: global.ObjectId,
            default: '',
            ref: DB_PREFIX + "user"
        },
        token: {
            type: String,
            default: ''
        },
        total: {
            type: Number,
            default: 0
        },
        ip: {
            type: String,
            default: ''
        },
        user_agent: {
            type: String,
            default: ''
        },
        status: {
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