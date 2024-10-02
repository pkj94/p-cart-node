
module.exports = {
    name: DB_PREFIX + 'session',
    schema: {
        session: {
            type: String,
            default: '',
            trim: true
        },
        data: {
            type: Object,
            default: {}
        },
        expire: {
            type: Date,
            default: new Date()
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