
module.exports = {
    name: DB_PREFIX + 'gdpr',
    schema: {
        store_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "store"
        },
        language_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + "language"
        },
        code: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: '',
            trim: true
        },
        action: {
            type: String,
            default: ''
            
        },
        status: {
            type: Number,
            default: 0
        },
        /*
        *  Action _statuses
        *
        *	EXPORT
        *
        *  unverified = 0
        *	pending    = 1
        *	complete   = 3
        *
        *	REMOVE
        *
        *  unverified = 0
        *	pending    = 1
        *	processing = 2
        *	delete     = 3
        *
        *	DENY
        *
        *  unverified = 0
        *	pending    = 1
        *	processing = 2
        *	denied     = -1
        */
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