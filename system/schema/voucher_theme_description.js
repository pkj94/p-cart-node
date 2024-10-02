
module.exports = {
    name: DB_PREFIX + 'voucher_theme_description',
    schema: {
        voucher_theme_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "voucher_theme"
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "language"
        },
        name: {
            type: String,
            default: '',
            trim: true
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