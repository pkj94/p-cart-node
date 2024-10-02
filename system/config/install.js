module.exports = {
    // Site
    'site_url': HTTP_SERVER,
    // Language
    'language_code': 'en-gb',
    // Template
    'template_engine': 'twig',
    // Error
    'error_display': true,
    // Actions
    'action_default': 'install/step_1',
    'action_error': 'error/not_found',
    'action_pre_action': [
        'startup/install',
        'startup/upgrade',
        'startup/database'
    ],
    // Action Events
    'action_event': [],
}