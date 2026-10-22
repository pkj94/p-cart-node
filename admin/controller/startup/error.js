module.exports = class ErrorController extends global['OpencartSystemEngineController'] {
	constructor(registry) {
		super(registry)
	}

	// Sets the request's error log. Process-wide handlers (uncaught errors, unhandled rejections,
	// warnings) are registered once in index.js: adding them here ran on every request, piled up
	// listeners (MaxListeners warnings), kept every request in memory and logged each error many times.
	async index() {
		this.registry.set('log', new global['OpencartSystemLibraryLog'](this.config.get('config_error_filename') || this.config.get('error_filename')));
	}
}
