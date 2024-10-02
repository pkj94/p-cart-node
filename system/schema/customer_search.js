
module.exports = {
    name: DB_PREFIX + 'customer_search',
    schema: {
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'store'
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer'
        },
        keyword: {
            type: String,
            default: '',
            trim: true
        },
        category_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'category'
        },
        sub_category_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'category'
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        products: {
            type: Number,
            default: 0
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