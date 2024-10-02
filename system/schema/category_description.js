module.exports = {
    name: DB_PREFIX + 'category_description',
    schema: {
        category_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "category"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
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
            ref: DB_PREFIX + "user"
        },
        updated_by: {
            type: global.ObjectId,
            ref: DB_PREFIX + "user"
        },
    }
}