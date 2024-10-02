module.exports = {
    name: DB_PREFIX + 'extension_path',
    schema: {
        extensionInstall_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'extension_install'
        },
        path: {
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