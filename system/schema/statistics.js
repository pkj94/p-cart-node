module.exports = {
    name: DB_PREFIX + 'statistics',
    schema: {
        code: {
            type: String,
            default: '',
            trim: true
        },
        value: {
            type: Number,
            default: 0
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