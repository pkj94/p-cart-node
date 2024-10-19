module.exports = {
    name: DB_PREFIX + 'coupon_history',
    schema: {
        coupon_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'coupony'
        },
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order'
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
        },
        amount: {
            type: Number,
            default: 0
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