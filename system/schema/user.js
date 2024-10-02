module.exports = {
    name: DB_PREFIX + 'user',
    schema: {
        user_group_id: {
            type: global.ObjectId,
            default:null,
            ref: DB_PREFIX + "user_group",
            required: [true, `'user_group_id' field is missing`]
        },
        username: {
            type: String,
            default: '',
            unique: true,
            required: [true, `'username' field is missing`]
        },
        password: {
            type: String,
        },
        firstname: {
            type: String,
            default: ''
        },
        lastname: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            unique: true,
            required: [true, `'email' field is missing`]
        },
        image: {
            type: String,
            default: '',
        },
        code: {
            type: String,
            default: '',
        },
        ip: {
            type: String,
            default: '',
        },
        status: {
            type: Boolean,
            default: false,
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