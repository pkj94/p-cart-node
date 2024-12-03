module.exports = {
	// Site
	site_url: HTTP_SERVER,
	site_ssl: HTTPS_SERVER,

	// Url
	url_autostart: false,

	// Database
	db_autostart: true,
	db_engine: DB_DRIVER,// mpdo, mysqli or pgsql
	db_hostname: DB_HOSTNAME,
	db_username: DB_USERNAME,
	db_password: DB_PASSWORD,
	db_database: DB_DATABASE,
	db_port: DB_PORT,

	// Session
	session_autostart: false,
	session_engine: 'db',
	session_name: 'PCSESSID',

	// Template
	template_engine: 'twig',
	template_directory: '',
	template_cache: true,

	// Autoload Libraries
	library_autoload: [],

	// Actions
	action_pre_action: [
		'startup/session',
		'startup/startup',
		'startup/error',
		'startup/event',
		'startup/maintenance',
		'startup/seo_url'
	],

	// Action Events
	action_event: {
		'controller/*/before': [
			'event/language/before'
		],
		'controller/*/after': [
			'event/language/after'
		],
		'view/*/before': {
			500: 'event/theme',
			998: 'event/language',
		},
		'language/*/after': [
			'event/translation'
		],
		//'view/*/before' : [
		//	1000  : 'event/debug/before'
		//),
		//'controller/*/after'  : [
		//	'event/debug/after'
		//	)
	},
}