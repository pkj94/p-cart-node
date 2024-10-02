
module.exports = {
    name: DB_PREFIX + 'customer_login',
    schema: {
        email: {
            type: String,
            default: '',
            trim: true
        },
        ip: {
            type: String,
            default: '',
            trim: true
        },
        total: {
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