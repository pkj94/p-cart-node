module.exports = {
    name: DB_PREFIX + 'product_option_value',
    schema: {
        productOption_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product_option'
        },
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        option_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'option'
        },
        option_value_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'option_value'
        },
        quantity: {
            type: Number,
            default: 1
        },
        subtract: {
            type: Boolean,
            default: true
        },
        price: {
            type: Number,
            default: 0
        },
        pricePrefix: {
            type: String,
            default: '',
            trim: true
        },
        points: {
            type: Number,
            default: 0
        },
        pointsPrefix: {
            type: String,
            default: '',
            trim: true
        },
        weight: {
            type: Number,
            default: 0
        },
        weightPrefix: {
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