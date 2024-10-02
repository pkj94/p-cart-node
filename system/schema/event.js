
module.exports = {
    name: DB_PREFIX + 'event',
    schema: {
        code: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        trigger: {
            type: String,
            default: '',
            trim: true
        },
        action: {
            type: String,
            default: '',
            trim: true
        },
        status: {
            type: Boolean,
            default: false
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