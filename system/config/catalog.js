module.exports = {
    // Site
    'site_url': HTTP_SERVER,
    // Database
    'db_autostart': true,
    'db_engine': DB_DRIVER, // mysqli, pdo or pgsql
    'db_hostname': DB_HOSTNAME,
    'db_username': DB_USERNAME,
    'db_password': DB_PASSWORD,
    'db_database': DB_DATABASE,
    'db_port': DB_PORT,
    // Session
    'session_autostart': false,
    'session_engine': 'db', // db or file
    // Actions
    'action_pre_action': [
        'startup/setting',
        'startup/seo_url',
        'startup/session',
        'startup/language',
        'startup/customer',
        'startup/currency',
        'startup/tax',
        'startup/application',
        'startup/extension',
        'startup/startup',
        'startup/marketing',
        'startup/error',
        'startup/event',
        'startup/sass',
        'startup/api',
        'startup/maintenance'
    ],
    // Action Events
    'action_event': {
        'controller/*/before': {
            0: 'event/language.before',
            //	1 : 'event/debug.before'
        },
        'controller/*/after': {
            0: 'event/language.after',
            //	2 : 'event/debug.after'
        },
        'view/*/before': {
            500: 'event/theme',
            998: 'event/language'
        },
        'language/*/after': {
            0: 'startup/language.after',
            1: 'event/translation'
        }
    }
}