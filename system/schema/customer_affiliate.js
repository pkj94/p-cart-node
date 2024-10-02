
module.exports = {
    name: DB_PREFIX + 'customer_affiliate',
    schema: {
        customer_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "customer"
        },
        company: {
            type: String,
            default: '',
            trim: true
        },
        website: {
            type: String,
            default: '',
            trim: true
        },
        tracking: {
            type: String,
            default: '',
            trim: true
        },
        balance: {
            type: Number,
            default: 0
        },
        commission: {
            type: Number,
            default: 0
        },
        tax: {
            type: String,
            default: '',
            trim: true
        },
        payment_method: {
            type: String,
            default: '',
            trim: true
        },
        cheque: {
            type: String,
            default: '',
            trim: true
        },
        paypal: {
            type: String,
            default: '',
            trim: true
        },
        bank_name: {
            type: String,
            default: '',
            trim: true
        },
        bank_branch_number: {
            type: String,
            default: '',
            trim: true
        },
        bank_swift_code: {
            type: String,
            default: '',
            trim: true
        },
        bank_account_name: {
            type: String,
            default: '',
            trim: true
        },
        bank_account_number: {
            type: String,
            default: '',
            trim: true
        },
        custom_field: {
            type: Object,
            default: {}
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