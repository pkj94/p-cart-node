
module.exports = {
    name: DB_PREFIX + 'voucher',
    schema: {
        order_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "order"
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
        status: {
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