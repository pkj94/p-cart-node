
module.exports = {
    name: DB_PREFIX + 'country',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        iso_code_2: {
            type: String,
            default: ''
        },
        iso_code3: {
            type: String,
            default: ''
        },
        addressFormat_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "address_format"
        },
        postcodeRequired: {
            type: Boolean,
            default: false
        },
        status: {
            type: Boolean,
            default: true
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