module.exports = {
    name: DB_PREFIX + 'information_description',
    schema: {
        information_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "information"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        title: {
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