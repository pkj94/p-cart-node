
module.exports = {
    name: DB_PREFIX + 'address',
    schema: {
        customer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "customer"
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
        company: {
            type: String,
            default: '',
            trim: true
        },
        address_1: {
            type: String,
            default: '',
            trim: true
        },
        address_2: {
            type: String,
            default: '',
            trim: true
        },
        city: {
            type: String,
            default: '',
            trim: true
        },
        postcode: {
            type: String,
            default: '',
            trim: true
        },
        country_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "country"
        },
        zone_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "zone"
        }, 
        custom_field: {
            type: Object,
            default: {}
        },
        default: {
            type: Boolean,
            default: false
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