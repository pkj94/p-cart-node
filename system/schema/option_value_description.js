module.exports = {
    name: DB_PREFIX + 'option_value_description',
    schema: {
        option_value_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "option_value"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        option_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "option"
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