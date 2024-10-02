module.exports = {
    name: DB_PREFIX + 'address_format',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        addressFormat: {
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