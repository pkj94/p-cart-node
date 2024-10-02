module.exports = {
    name: DB_PREFIX + 'information',
    schema: {
        bottom: {
            type: Boolean,
            default: false
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