module.exports = {
    name: DB_PREFIX + 'length_class',
    schema: {
        value: {
            type: Number,
            default: 0
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