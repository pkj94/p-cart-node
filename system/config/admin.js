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
    'session_autostart': true,
    'session_engine': 'db', // db or file
    // Error
    'error_display': true,
    // Actions
    'action_pre_action': [
        'startup/setting',
        'startup/session',
        'startup/language',
        'startup/application',
        'startup/extension',
        'startup/startup',
        'startup/error',
        'startup/event',
        'startup/sass',
        'startup/login',
        'startup/authorize',
        'startup/permission'
    ],
    // Actions
    'action_default': 'common/dashboard',
    // Action Events
    'action_event': {
        'controller/*/before': {
            0: 'event/language.before'
        },
        'controller/*/after': {
            0: 'event/language.after'
        },
        //'model/*/after' : {
        //	0 : 'event/debug.before'
        //},
        //'model/*/after' : {
        //	0 : 'event/debug.after'
        //},
        'view/*/before': {
            999: 'event/language'
        },
        'language/*/after': {
            0: 'startup/language.after'
        }
    }
}