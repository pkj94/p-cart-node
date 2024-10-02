module.exports = {
    name: DB_PREFIX + 'location',
    schema: {
        name: {
            type: String,
            default: '',
            trim: true
        },
        address: {
            type: String,
            default: ''
        },
        telephone: {
            type: String,
            default: '',
            trim: true
        },
        geocode: {
            type: String,
            default: '',
            trim: true
        },
        image: {
            type: String,
            default: ''
        },
        open: {
            type: String,
            default: ''
        },
        comment: {
            type: String,
            default: ''
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