
module.exports = {
    name: DB_PREFIX + 'article_description',
    schema: {
        article_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "article"
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "language"
        },
        image: {
            type: String,
            default: '',
            trim: true
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
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
        status: {
            type: Boolean,
            default: false
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