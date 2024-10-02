module.exports = {
    name: DB_PREFIX + 'user_login',
    schema: {
        user_id: {
            type: global.ObjectId,
            default: '',
            ref: DB_PREFIX + "user"
        },
        ip: {
            type: String,
            default: '',
            trim: true
        },
        user_agent: {
            type: String,
            default: '',
            trim: true
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