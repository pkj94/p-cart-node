module.exports = {
    name: DB_PREFIX + 'article_to_store',
    schema: {
        article_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "article"
        },
        store_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "store"
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