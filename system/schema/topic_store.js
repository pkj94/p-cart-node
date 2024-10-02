module.exports = {
    name: DB_PREFIX + 'topic_to_store',
    schema: {
        topic_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "topic"
        },
        store_id: {
            type: global.ObjectId,
            default: null,
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