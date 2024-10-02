module.exports = {
    name: DB_PREFIX + 'product_attribute',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        attribute_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'attribute'
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        text: {
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