
module.exports = {
    name: DB_PREFIX + 'currency',
    schema: {
        title: {
            type: String,
            default: '',
            trim: true
        },
        code: {
            type: String,
            default: '',
            trim: true
        },
        symbol_left: {
            type: String,
            default: ''
        },
        symbol_Right: {
            type: String,
            default: ''
        },
        decimalPlace: {
            type: Number,
            default: 0
        },
        value: {
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