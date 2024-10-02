module.exports = {
    name: DB_PREFIX + 'category',
    schema: {
        image: {
            type: String,
            default: ''
        },
        parent_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'category'
        },
        top: {
            type: Boolean,
            default: false
        },
        column: {
            type: Number,
            default: null
        },
        sort_order: {
            type: Number,
            default: 1
        },
        status: {
            type: Boolean,
            default: true
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