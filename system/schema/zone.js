module.exports = {
    name: DB_PREFIX + 'zone',
    schema: {
        country_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'country'
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        code: {
            type: String,
            default: '',
            trim: true
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