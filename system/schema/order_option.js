module.exports = {
    name: DB_PREFIX + 'order_option',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order'
        },
        orderProduct_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'order_product'
        },
        productOption_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product_option'
        },
        productOption_value_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product_option_value'
        },
        name: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
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