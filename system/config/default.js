module.exports = {
    // Site
    site_url: '',
    site_ssl: false,

    // Url
    url_autostart: true,

    // Language
    language_directory: 'en-gb',
    language_autoload: ['en-gb'],

    // Date
    date_timezone: 'UTC',

    // Database
    db_engine: 'mysqli',// mpdo, mysqli or pgsql
    db_hostname: 'localhost',
    db_username: 'root',
    db_password: '',
    db_database: '',
    db_port: 3306,
    db_autostart: false,

    // Mail
    mail_engine: 'mail',// mail or smtp
    mail_from: '',// Your E-Mail
    mail_sender: '',// Your name or company name
    mail_reply_to: '',// Reply to E-Mail
    mail_smtp_hostname: '',
    mail_smtp_username: '',
    mail_smtp_password: '',
    mail_smtp_port: 25,
    mail_smtp_timeout: 5,
    mail_verp: false,
    mail_parameter: '',

    // Cache
    cache_engine: 'file',// apc, file, mem or memcached
    cache_expire: 3600,

    // Session
    session_engine: 'db',
    session_autostart: true,
    session_name: 'OCSESSID',

    // Template
    template_engine: 'twig',
    template_directory: '',
    template_cache: false,

    // Error
    error_display: true,
    error_log: true,
    error_filename: 'error.log',

    // Reponse
    response_header: ['Content-Type: text/html,charset=utf-8'],
    response_compression: 0,

    // Autoload Configs
    config_autoload: [],

    // Autoload Libraries
    library_autoload: [],

    // Autoload Libraries
    model_autoload: [],

    // Actions
    action_default: 'common/home',
    action_router: 'startup/router',
    action_error: 'error/not_found',
    action_pre_action: [],
    action_event: [],
}
