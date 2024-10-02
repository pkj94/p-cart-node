module.exports = {
    name: DB_PREFIX + 'api_session',
    schema: {
        api_id: {
            type: global.ObjectId,
            default: null,
            required:[true,'`api_id` is required']
        },
        session_id: {
            type: String,
            default: ''
        },
        ip: {
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