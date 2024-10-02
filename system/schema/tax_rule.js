module.exports = {
    name: DB_PREFIX + 'tax_rule',
    schema: {
        tax_class_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'tax_class',
            required: [true, `'tax_class_id' field is missing`]
        },
        taxRate_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'tax_rate',
            required: [true, `'taxRate_id' field is missing`]
        },
        based: {
            type: String,
            default: ''
        },
        priority: {
            type: Number,
            default: 1
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