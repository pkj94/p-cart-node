
module.exports = {
    name: DB_PREFIX + 'customer_wishlist',
    schema: {
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
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