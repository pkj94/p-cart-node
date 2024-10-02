module.exports = {
    name: DB_PREFIX + 'product_option',
    schema: {
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
        value: {
            type: String,
            default: ''
        },
        required: {
            type: Boolean,
            default: false
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