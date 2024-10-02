module.exports = {
    name: DB_PREFIX + 'customer_approval',
    schema: {
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "customer"
        },
        type: {
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