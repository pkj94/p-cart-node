
module.exports = {
    name: DB_PREFIX + 'customer',
    schema: {
        customer_group_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'customer_group'
        },
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'store'
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'language'
        },
        firstname: {
            type: String,
            default: '',
            trim: true
        },
        lastname: {
            type: String,
            default: '',
            trim: true
        },
        email: {
            type: String,
            default: '',
            trim: true
        },
        telephone: {
            type: String,
            default: '',
            trim: true
        },
        password: {
            type: String,
            default: ''
        },
        custom_field: {
            type: Object,
            default: {}
        },
        newsletter: {
            type: Boolean,
            default: false
        },
        ip: {
            type: String,
            default: '',
            trim: true
        },
        safe: {
            type: Boolean,
            default: true
        },
        token: {
            type: String,
            default: '',
            trim: true
        },
        code: {
            type: String,
            default: '',
            trim: true
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