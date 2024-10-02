
module.exports = {
    name: DB_PREFIX + 'download_description',
    schema: {
        download_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "download"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        name: {
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