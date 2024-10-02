module.exports = {
    name: DB_PREFIX + 'tax_rate_to_customer_group',
    schema: {
        taxRate_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'tax_rate',
            required: [true, `'taxRate_id' field is missing`]
        },
        customer_group_id: {
            type: String,
            default: null,
            ref: DB_PREFIX + 'customer_group',
            required: [true, `'customer_group_id' field is missing`]
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