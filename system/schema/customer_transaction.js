
module.exports = {
    name: DB_PREFIX + 'customer_transaction',
    schema: {
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
        },
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order'
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        amount: {
            type: Number,
            default: 0
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