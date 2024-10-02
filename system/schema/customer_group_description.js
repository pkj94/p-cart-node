
module.exports = {
    name: DB_PREFIX + 'customer_group_description',
    schema: {
        customer_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer_group'
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        description: {
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