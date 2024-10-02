
module.exports = {
    name: DB_PREFIX + 'marketing',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        code: {
            type: String,
            default: '',
            trim: true
        },
        clicks: {
            type: Number,
            default: 0
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