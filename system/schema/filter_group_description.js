module.exports = {
    name: DB_PREFIX + 'filter_group_description',
    schema: {
        filter_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "filter_group"
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