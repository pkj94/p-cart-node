module.exports = {
    name: DB_PREFIX + 'setting',
    schema: {
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'store'
        },
        code: {
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
        stringify: {
            type: Boolean,
            default: false
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