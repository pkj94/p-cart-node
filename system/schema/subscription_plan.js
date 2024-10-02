
module.exports = {
    name: DB_PREFIX + 'subscription_plan',
    schema: {
        trialFrequency: {
            type: String,
            default: 'month',
            enum: ['day', 'week', 'semi_month', 'month', 'year'],
        },
        trialDuration: {
            type: Number,
            default: 0
        },
        trial_cycle: {
            type: Number,
            default: 0
        },
        trial_status: {
            type: Boolean,
            default: true
        },
        frequency: {
            type: String,
            default: 'month',
            enum: ['day', 'week', 'semi_month', 'month', 'year'],
        },
        duration: {
            type: Number,
            default: 0
        },
        cycle: {
            type: Number,
            default: 0
        },
        sort_order: {
            type: Number,
            default: 1
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