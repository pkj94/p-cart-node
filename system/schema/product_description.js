module.exports = {
    name: DB_PREFIX + 'product_description',
    schema: {
        product_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        tag: {
            type: String,
            default: '',
            trim: true
        },
        meta_title: {
            type: String,
            default: '',
            trim: true
        },
        meta_description: {
            type: String,
            default: '',
            trim: true
        },
        meta_keyword: {
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