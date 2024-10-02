module.exports = {
    name: DB_PREFIX + 'topic_description',
    schema: {
        topic_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "topic"
        },
        language_id: {
            type: global.ObjectId,
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