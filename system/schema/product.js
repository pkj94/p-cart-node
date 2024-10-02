module.exports = {
    name: DB_PREFIX + 'product',
    schema: {
        master_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'product'
        },
        model: {
            type: String,
            default: '',
            maxlength: 64
        },
        sku: {
            type: String,
            default: '',
            maxlength: 64
        },
        upc: {
            type: String,
            default: '',
            maxlength: 12
        },
        ean: {
            type: String,
            default: '',
            maxlength: 14
        },
        jan: {
            type: String,
            default: '',
            maxlength: 13
        },
        isbn: {
            type: String,
            default: '',
            maxlength: 17
        },
        mpn: {
            type: String,
            default: '',
            maxlength: 64
        },
        location: {
            type: String,
            default: ''
        },
        variant: {
            type: Object,
            default: ''
        },
        override: {
            type: Object,
            default: ''
        },
        quantity: {
            type: Number,
            default: 0,
        },
        stock_status_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'stock_status'
        },
        image: {
            type: String,
            default: ''
        },
        manufacturer_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'manufacturer'
        },
        shipping: {
            type: Boolean,
            default: true,
        },
        price: {
            type: Number,
            default: 0.0000,
        },
        points: {
            type: Number,
            default: 0,
        },
        tax_class_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'tax_class'
        },
        date_available: { type: Date, default: '' },
        weight: {
            type: Number,
            default: 0.00000000,
        },
        weight_class_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'weight_class'
        },
        length: {
            type: Number,
            default: 0.00000000,
        },
        width: {
            type: Number,
            default: 0.00000000,
        },
        height: {
            type: Number,
            default: 0.00000000,
        },
        length_class_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'length_class'
        },
        subtract: {
            type: Boolean,
            default: true
        },
        minimum: {
            type: Number,
            default: 1
        },
        rating: {
            type: Number,
            default: ''
        },
        sort_order: {
            type: Number,
            default: 1,
        },
        status: {
            type: Boolean,
            default: false,
        },
        created_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
        updated_by: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "user"
        },
    }
}