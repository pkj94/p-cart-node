
module.exports = {
    name: DB_PREFIX + 'article_comment',
    schema: {
        article_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "article"
        },
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "customer"
        },
        comment: {
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