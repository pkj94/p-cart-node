module.exports = class ErrorController extends Controller {
	constructor(registry) {
		super(registry)
	}

	async index() {
		this.registry.set('log', new LogLibrary(this.config.get('config_error_filename') || this.config.get('error_filename')));

		process.on('uncaughtException', this.exception.bind(this));
		process.on('unhandledRejection', this.exception.bind(this));
		process.on('warning', (warning) => {
			this.error('Warning', warning.message, warning.fileName, warning.lineNumber);
		});
	}

	error(code, message, file, line) {
		let errorType;

		switch (code) {
			case 'Notice':
			case 'UserNotice':
				errorType = 'Notice';
				break;
			case 'Warning':
			case 'UserWarning':
				errorType = 'Warning';
				break;
			case 'Error':
			case 'UserError':
				errorType = 'Fatal Error';
				break;
			default:
				errorType = 'Unknown';
				break;
		}

		if (this.config.get('config_error_log')) {
			const logMessage = `Node.js ${errorType}: ${message}\nFile: ${file}\nLine: ${line}\n`;
			this.registry.get('log').write(logMessage);
		}

		if (this.config.get('config_error_display')) {
			console.error(`${errorType}: ${message} in ${file} on line ${line}`);
		} else {
			// Redirect to error page
			console.error('Redirecting to error page');
		}

		return true;
	}

	exception(error) {
		if (this.config.get('config_error_log')) {
			const logMessage = `${error.code}: ${error.message}\nFile: ${error.fileName}\nLine: ${error.lineNumber}\n`;
			this.registry.get('log').write(logMessage);
		}

		if (this.config.get('config_error_display')) {
			console.error(`${error.message} in ${error.fileName} on line ${error.lineNumber}`);
		} else {
			// Redirect to error page
			console.error('Redirecting to error page');
			this.response.setRedicect(this.config.get('error_page'));
		}
	}
}

