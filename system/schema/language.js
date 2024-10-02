module.exports = {
    name: DB_PREFIX + 'language',
    schema: {
        name: {
            type: String,
            default: '',
            required: [true, `'name' field is missing`],
            trim: true
        },
        code: {
            type: String,
            default: '',
            unique: true,
            required: [true, `'code' field is missing`],
            trim: true
        },
        locale: {
            type: String,
            default: '',
            trim: true
        },
        extension: {
            type: String,
            default: '',
            trim: true
        },
        sort_order: {
            type: Number,
            default: 1
        },
        status: {
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