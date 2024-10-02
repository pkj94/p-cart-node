module.exports = {
    name: DB_PREFIX + 'option_value',
    schema: {
        option_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "option"
        },
        image: {
            type: String,
            default: ''
        },
        sort_order: {
            type: Number,
            default: 1
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