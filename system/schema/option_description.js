module.exports = {
    name: DB_PREFIX + 'option_description',
    schema: {
        option_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "option"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        name: {
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