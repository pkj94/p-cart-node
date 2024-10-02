
module.exports = {
    name: DB_PREFIX + 'order_voucher',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "order"
        },
        voucher_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "voucher"
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        code: {
            type: String,
            default: '',
            trim: true
        },
        from_name: {
            type: String,
            default: '',
            trim: true
        },
        fromEmail: {
            type: String,
            default: '',
            trim: true
        },
        to_name: {
            type: String,
            default: '',
            trim: true
        },
        toEmail: {
            type: String,
            default: '',
            trim: true
        },
        voucher_theme_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "voucher_theme"
        },
        message: {
            type: String,
            default: '',
            trim: true
        },
        amount: {
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