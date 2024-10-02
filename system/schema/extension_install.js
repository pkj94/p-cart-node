module.exports = {
    name: DB_PREFIX + 'extension_install',
    schema: {
        extension_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'extension'
        },
        extensionDownload_id: {
            type: global.ObjectId,
            default: null,
            // ref: DB_PREFIX + 'extension'
        },
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
        version: {
            type: String,
            default: '',
            trim: true
        },
        author: {
            type: String,
            default: '',
            trim: true
        },
        link: {
            type: String,
            default: '',
            trim: true
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