
module.exports = {
    name: DB_PREFIX + 'upload',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        filename: {
            type: String,
            default: '',
            trim: true
        },
        code: {
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