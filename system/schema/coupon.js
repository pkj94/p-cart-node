module.exports = {
    name: DB_PREFIX + 'coupon',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        code: {
            type: String,
            default: '',
            trim: true
        },
        type: {
            type: String,
            default: '',
            trim: true
        },
        discount: {
            type: Number,
            default: 0
        },
        logged: {
            type: Boolean,
            default: false
        },
        shipping: {
            type: Boolean,
            default: false
        },
        total: {
            type: Number,
            default: 0
        },
        date_start: {
            type: Date,
            default: null
        },
        dateEnd: {
            type: Date,
            default: null
        },
        uses_total: {
            type: Number,
            default: 0
        },
        uses_customer: {
            type: Number,
            default: 0
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