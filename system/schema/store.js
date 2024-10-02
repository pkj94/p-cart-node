module.exports = {
    name: DB_PREFIX + 'store',
    schema: {
        name: {
            type: String,
            default: ''
        },
        url: {
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