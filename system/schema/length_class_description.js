module.exports = {
    name: DB_PREFIX + 'length_class_description',
    schema: {
        language_id: { type: global.ObjectId, ref: DB_PREFIX + "language" },
        length_class_id: { type: global.ObjectId, ref: DB_PREFIX + "length_class" },
        title: {
            type: String,
            default: '',
            trim: true
        },
        unit: {
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