module.exports = {
    // Site
    'site_url': '',
    // Language
    'language_code': 'en-gb',
    // Date
    'date_timezone': 'UTC',
    // Database
    'db_autostart': false,
    'db_engine': 'mysqli', // mysqli, pdo or pgsql
    'db_hostname': 'localhost',
    'db_username': 'root',
    'db_password': '',
    'db_database': '',
    'db_port': 3306,
    // Mail
    'mail_engine': 'mail', // mail or smtp
    'mail_from': '', // Your E-Mail
    'mail_sender': '', // Your name or company name
    'mail_reply_to': '', // Reply to E-Mail
    'mail_smtp_hostname': '',
    'mail_smtp_username': '',
    'mail_smtp_password': '',
    'mail_smtp_port': 25,
    'mail_smtp_timeout': 5,
    'mail_verp': false,
    'mail_parameter': '',
    // Cache
    'cache_engine': 'file', // apc, file, mem, memcached or redis
    'cache_expire': 3600,
    // Session
    'session_autostart': false,
    'session_engine': 'file', // db or file
    'session_name': 'OCSESSID',
    'session_domain': '',
    'session_path': '/',
    'session_expire': 86400,
    'session_probability': 1,
    'session_divisor': 5,
    'session_samesite': 'Strict',
    // Template
    'template_engine': 'twig',
    'template_extension': '.twig',
    // Error
    'error_display': true, // You need to change this to false on a live site.
    'error_log': true,
    'error_filename': 'error.log',
    'error_page': 'error.html',
    // Response
    'response_header': ['Content-Type: text/html'],
    'response_compression': 0,
    // Actions
    'action_default': 'common/home',
    'action_error': 'error/not_found',
    'action_pre_action': [],
    'action_post_action': [],
    'action_event': [],
}