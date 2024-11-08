module.exports = class ControllerStartupError extends Controller {
	async index() {
		this.registry.set('log', new Log(this.config.get('config_error_filename') ? this.config.get('config_error_filename') : this.config.get('error_filename')));

		process.on('uncaughtException', this.handler);
		process.on('unhandledRejection', this.handler);
	}

	async handler(code, message, file, line) {
		// error suppressed with @
		if (!(error_reporting() & code)) {
			return false;
		}

		switch (code) {
			case E_NOTICE:
			case E_USER_NOTICE:
				error = 'Notice';
				break;
			case E_WARNING:
			case E_USER_WARNING:
				error = 'Warning';
				break;
			case E_ERROR:
			case E_USER_ERROR:
				error = 'Fatal Error';
				break;
			default:
				error = 'Unknown';
				break;
		}

		if (this.config.get('config_error_display')) {
			new Error('<b>' + error + '</b>: ' + message + ' in <b>' + file + '</b> on line <b>' + line + '</b>');
		}

		if (this.config.get('config_error_log')) {
			this.log.write('JS ' + error + ':  ' + message + ' in ' + file + ' on line ' + line);
		}

		return true;
	}
} 
