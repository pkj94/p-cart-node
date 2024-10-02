module.exports = {
    name: DB_PREFIX + 'article_to_layout',
    schema: {
        article_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "article"
        },
        store_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "store"
        },
        layout_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "layout"
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