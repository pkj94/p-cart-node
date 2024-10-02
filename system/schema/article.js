
module.exports = {
    name: DB_PREFIX + 'article',
    schema: {
        topic_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "topic"
        },
        author: {
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