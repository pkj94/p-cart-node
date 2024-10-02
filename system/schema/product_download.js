module.exports = {
    name: DB_PREFIX + 'product_to_download',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        download_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'download'
        },
        created_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
        updated_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
    }
}