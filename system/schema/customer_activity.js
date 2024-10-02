
module.exports = {
    name: DB_PREFIX + 'customer_activity',
    schema: {
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
        },
        key: {
            type: String,
            default: '',
            trim: true
        },
        data: {
            type: Object,
            default: {}
        },
        ip: {
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