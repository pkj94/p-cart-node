module.exports = {
    name: DB_PREFIX + 'translation',
    schema: {
        store_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "store"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        route: {
            type: String,
            default: '',
            trim: true
        },
        key: {
            type: String,
            default: '',
            trim: true
        },
        value: {
            type: String,
            default: ''
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