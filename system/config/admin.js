module.exports = {
	// Site
	site_url: HTTP_SERVER,
	site_ssl: HTTPS_SERVER,

	// Database
	db_autostart: true,
	db_engine: DB_DRIVER,// mpdo, mysqli or pgsql
	db_hostname: DB_HOSTNAME,
	db_username: DB_USERNAME,
	db_password: DB_PASSWORD,
	db_database: DB_DATABASE,
	db_port: DB_PORT,

	// Session
	session_autostart: true,

	// Template
	template_cache: true,

	// Actions
	action_pre_action: [
		'startup/startup',
		'startup/error',
		'startup/event',
		'startup/sass',
		'startup/login',
		'startup/permission'
	],

	// Actions
	action_default: 'common/dashboard',

	// Action Events
	action_event: {
		'controller/*/before': [
			'event/language/before'
		],
		'controller/*/after': [
			'event/language/after'
		],
		'view/*/before': {
			999: 'event/language',
			1000: 'event/theme'
		}
	},
}