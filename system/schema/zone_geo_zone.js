module.exports = {
    name: DB_PREFIX + 'zone_to_geo_zone',
    schema: {
        country_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'country'
        },
        zone_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'zone'
        },
        geo_zone_id: {
            type: global.ObjectId,
            default: null,
            ref: DB_PREFIX + 'geo_zone'
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