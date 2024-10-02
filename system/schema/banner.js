
module.exports = {
    name: DB_PREFIX + 'banner',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
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