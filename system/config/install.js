module.exports = {
	// Site
	site_base: HTTP_SERVER,
	site_ssl: HTTP_SERVER,

	// Language
	language_default: 'en-gb',
	language_autoload: ['en-gb'],

	// Session
	session_engine: 'file',
	session_autostart: true,
	session_name: 'PCSESSID',

	// Template
	template_engine: 'twig',
	template_cache: true,

	// Actions
	action_default: 'install/step_1',
	action_router: 'startup/router',
	action_error: 'error/not_found',
	action_pre_action: [
		'startup/language',
		'startup/upgrade',
		'startup/database'
	],

	// Action Events
	action_event: {
		'view/*/before': [
			'event/theme'
		]
	},
}
