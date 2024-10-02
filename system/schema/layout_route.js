module.exports = {
    name: DB_PREFIX + 'layout_route',
    schema: {
        layout_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'layout'
        },
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'store'
        },
        route: {
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