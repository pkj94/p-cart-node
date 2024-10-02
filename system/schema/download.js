
module.exports = {
    name: DB_PREFIX + 'download',
    schema: {
        filename: {
            type: String,
            default: '',
            trim: true
        },
        mask: {
            type: String,
            default: '',
            trim: true
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