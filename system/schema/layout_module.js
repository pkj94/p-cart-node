module.exports = {
    name: DB_PREFIX + 'layout_module',
    schema: {
        layout_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'layout'
        },
        code: {
            type: String,
            default: '',
            trim: true
        },
        position: {
            type: String,
            default: '',
            trim: true
        },
        sort_order: {
            type: Number,
            default: 1
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