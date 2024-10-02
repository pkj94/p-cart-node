module.exports = {
    name: DB_PREFIX + 'product_report',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'store'
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