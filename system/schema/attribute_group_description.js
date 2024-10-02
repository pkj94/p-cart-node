module.exports = {
    name: DB_PREFIX + 'attribute_group_description',
    schema: {
        attribute_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "attribute_group"
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