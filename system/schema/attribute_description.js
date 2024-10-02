module.exports = {
    name: DB_PREFIX + 'attribute_description',
    schema: {
        attribute_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "attribute"
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "language"
        },
        name: {
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