
module.exports = {
    name: DB_PREFIX + 'subscription_plan_description',
    schema: {
        subscriptionPlan_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "subscription_plan"
        },
        language_id: {
            type: global.ObjectId,
            ref: DB_PREFIX + "language"
        },
        name: {
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