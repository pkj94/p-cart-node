module.exports = {
    name: DB_PREFIX + 'notification',
    schema: {
        title: {
            type: String,
            default: ''
        },
        text: {
            type: String,
            default: '',
            trim: true
        },
        status: {
            type: Boolean,
            default: false,
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