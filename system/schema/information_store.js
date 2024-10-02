module.exports = {
    name: DB_PREFIX + 'information_to_store',
    schema: {
        information_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "information"
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