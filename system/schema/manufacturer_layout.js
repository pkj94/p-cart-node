
module.exports = {
    name: DB_PREFIX + 'manufacturer_to_layout',
    schema: {
        manufacturer_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "manufacturer"
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