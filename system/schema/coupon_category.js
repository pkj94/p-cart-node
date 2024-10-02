module.exports = {
    name: DB_PREFIX + 'coupon_category',
    schema: {
        coupon_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'coupony'
        },
        category_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'category'
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