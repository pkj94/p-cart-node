module.exports = {
    name: DB_PREFIX + 'user_group',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        permission: {
            type: Object,
            default: {},
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