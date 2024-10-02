module.exports = {
    name: DB_PREFIX + 'tax_class',
    schema: {
        title: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
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