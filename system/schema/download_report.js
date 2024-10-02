
module.exports = {
    name: DB_PREFIX + 'download_report',
    schema: {
        download_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "download"
        },
        store_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "store"
        },
        ip: {
            type: String,
            default: '',
            trim: true
        },
        country: {
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