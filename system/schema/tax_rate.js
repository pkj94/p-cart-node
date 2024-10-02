module.exports = {
    name: DB_PREFIX + 'tax_rate',
    schema: {
        geo_zone_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'geo_zone'
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        rate: {
            type: Number,
            default: 0
        },
        type: {
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