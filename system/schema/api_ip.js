module.exports = {
    name: DB_PREFIX + 'api_ip',
    schema: {
        api_id: {
            type: global.ObjectId,
            default: null,
            required: [true, '`api_id` is required'],
            ref: DB_PREFIX + 'api'
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