
module.exports = {
    name: DB_PREFIX + 'banner_image',
    schema: {
        banner_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "banner"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        title: {
            type: String,
            default: '',
            trim: true
        },
        link: {
            type: String,
            default: '',
            trim: true
        },
        image: {
            type: String,
            default: '',
            trim: true
        },
        sort_order: {
            type: Number,
            default: 1
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