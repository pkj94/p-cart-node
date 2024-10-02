module.exports = {
    name: DB_PREFIX + 'information_to_layout',
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
        layout_id: {
            type: global.ObjectId,
            default: null,
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