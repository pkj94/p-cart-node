
module.exports = {
    name: DB_PREFIX + 'voucher_history',
    schema: {
        voucher_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "voucher"
        },
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "order"
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