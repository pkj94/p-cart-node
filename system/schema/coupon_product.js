module.exports = {
    name: DB_PREFIX + 'coupon_product',
    schema: {
        coupon_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'coupony'
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
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