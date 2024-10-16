const fs = require('fs');
module.exports = class Upgrade1Controller extends Controller {
	constructor(registry) {
		super(registry);
	}
	async index() {
		await this.load.language('upgrade/upgrade');

		let json = {};

		let version = this.request.get['version'] ? this.request.get['version'] : '';
		let admin = this.request.get['admin'] ? basename(this.request.get['admin']) : 'admin';

		// Config and file structure changes
		const file = DIR_OPENCART + 'config.json';
		let config = {};
		if (fs.existsSync(file)) {

			// Catalog
			config = require(file);

			if (!config['HTTP_SERVER']) {
				json['error'] = this.language.get('error_server');
			}

			if (!DB_DRIVER) {
				json['error'] = this.language.get('error_db_driver');
			}

			if (!DB_HOSTNAME) {
				json['error'] = this.language.get('error_db_hostname');
			}

			if (!DB_USERNAME) {
				json['error'] = this.language.get('error_db_username');
			}

			if (!DB_PASSWORD) {
				json['error'] = this.language.get('error_db_password');
			}

			if (!DB_DATABASE) {
				json['error'] = this.language.get('error_db_database');
			}

			if (!DB_PREFIX) {
				json['error'] = this.language.get('error_db_prefix');
			}

			if (!isWritable(file)) {
				json['error'] = sprintf(this.language.get('error_writable'), file);
			}
		} else {
			json['error'] = sprintf(this.language.get('error_file'), file);
		}

		if (!Object.keys(json).length) {
			// Catalog config.json
			let output = {};

			output.APPLICATION = 'Catalog';
			if (config['HOST_NAME']) {
				output.HTTP_SERVER = HOST_NAME;
				output.HTTP_SERVER = HOST_NAME;
			} else {
				if (config['HTTPS_SERVER']) {
					output.HTTP_SERVER = config['HTTPS_SERVER'];
				} else {
					output.HTTP_SERVER = config['HTTP_SERVER'];
				}
			}
			output.DIR_OPENCART = DIR_OPENCART;
			output.DIR_APPLICATION = DIR_OPENCART + 'catalog/';
			output.DIR_EXTENSION = DIR_OPENCART + 'extension/';
			output.DIR_IMAGE = DIR_OPENCART + 'image/';
			output.DIR_SYSTEM = DIR_OPENCART + 'system/';
			if (config['DIR_STORAGE']) {
				output.DIR_STORAGE = config['DIR_STORAGE'];
			} else {
				output.DIR_STORAGE = output.DIR_SYSTEM + 'storage/';
			}
			output.DIR_STORAGE = output.DIR_SYSTEM + 'storage/';
			output.DIR_LANGUAGE = output.DIR_APPLICATION + 'language/';
			output.DIR_TEMPLATE = output.DIR_APPLICATION + 'view/template/';
			output.DIR_CONFIG = output.DIR_SYSTEM + 'config/';
			output.DIR_CACHE = output.DIR_STORAGE + 'cache/';
			output.DIR_DOWNLOAD = output.DIR_STORAGE + 'download/';
			output.DIR_LOGS = output.DIR_STORAGE + 'logs/';
			output.DIR_SESSION = output.DIR_STORAGE + 'session/';
			output.DIR_UPLOAD = output.DIR_STORAGE + 'upload/';
			output.DB_DRIVER = DB_DRIVER;
			output.DB_HOSTNAME = DB_HOSTNAME;
			output.DB_USERNAME = DB_USERNAME;
			output.DB_PASSWORD = DB_PASSWORD;
			output.DB_DATABASE = DB_DATABASE;
			if (DB_PORT) {
				output.DB_PORT = DB_PORT;
			} else {
				output.DB_PORT = 3306;
			}

			output.DB_PREFIX = DB_PREFIX;
			output.DB_DEBUG = DB_DEBUG || true;
			output.SERVER_PORT = SERVER_PORT || 8080;
			// Save file
			fs.writeFileSync(DIR_OPENCART + 'config.json', JSON.stringify(output, null, "\t"));
		}

		//*************************************

		// Admin
		const adminFile = DIR_OPENCART + admin + '/config.json';
		config = {};

		if (fs.existsSync(adminFile)) {
			// Capture values
			config = require(file);

			if (!config['HTTP_SERVER']) {
				json['error'] = this.language.get('error_server');
			}

			if (!config['HTTP_CATALOG']) {
				json['error'] = this.language.get('error_catalog');
			}

			if (!DB_DRIVER) {
				json['error'] = this.language.get('error_db_driver');
			}

			if (!DB_HOSTNAME) {
				json['error'] = this.language.get('error_db_hostname');
			}

			if (!DB_USERNAME) {
				json['error'] = this.language.get('error_db_username');
			}

			if (!DB_PASSWORD) {
				json['error'] = this.language.get('error_db_password');
			}

			if (!DB_DATABASE) {
				json['error'] = this.language.get('error_db_database');
			}

			if (!DB_PREFIX) {
				json['error'] = this.language.get('error_db_prefix');
			}

			if (!isWritable(adminFile)) {
				json['error'] = sprintf(this.language.get('error_writable'), adminFile);
			}
		} else {
			json['error'] = sprintf(this.language.get('error_file'), adminFile);
		}

		if (!Object.keys(json).length) {
			const path_old = DIR_OPENCART + 'admin/';
			const path_new = DIR_OPENCART + admin + '/';

			// 1. Check if default admin directory exists
			if (fs.existsSync(path_old) && path_old !== path_new) {
				// 2. Move current config file to default admin directory.
				fs.renameSync(adminFile, path_old + 'config.json');

				// 3. Remove the current directory
				let files = [];

				// Make path into an array
				let directory = [path_new];

				// While the path array is still populated keep looping through
				while (directory.length) {
					const next = directory.shift();

					if (fs.lstatSync(next).isDirectory()) {
						console.log(next.trim('/'))
						fs.readdirSync(next.trim('/')).forEach((deletePath) => {
							// If directory add to path array
							directory.push(next.trim('/') + deletePath);
						});
					}

					// Add the file to the files to be deleted array
					files.push(next);
				}

				// Reverse sort the file array
				files.sort().reverse();

				files.forEach((deletePath) => {
					// If file just delete
					if (fs.lstatSync(deletePath).isFile()) {
						fs.unlinkSync(deletePath);
					}

					// If directory use the remove directory function
					if (fs.lstatSync(deletePath).isDirectory()) {
						fs.rmdirSync(deletePath);
					}
				});

				// 4. Rename folder to the old directory
				fs.renameSync(DIR_OPENCART + 'admin/', path_new);
			}

			// Admin config.json
			let output = {};

			output.APPLICATION = 'Admin';
			if (config['HOST_NAME']) {
				output.HTTP_SERVER = HOST_NAME;
				output.HTTP_SERVER = HOST_NAME;
			} else {
				if (config['HTTPS_SERVER']) {
					output.HTTP_SERVER = config['HTTPS_SERVER'];
				} else {
					output.HTTP_SERVER = config['HTTP_SERVER'];
				}
			}
			if (config['HTTPS_CATALOG']) {
				output.HTTP_CATALOG = config['HTTPS_CATALOG'];
			} else {
				output.HTTPS_CATALOG = config['HTTP_CATALOG'];
			}
			output.DIR_OPENCART = DIR_OPENCART;
			output.DIR_APPLICATION = DIR_OPENCART + 'catalog/';
			output.DIR_EXTENSION = DIR_OPENCART + 'extension/';
			output.DIR_IMAGE = DIR_OPENCART + 'image/';
			output.DIR_SYSTEM = DIR_OPENCART + 'system/';
			if (config['DIR_STORAGE']) {
				output.DIR_STORAGE = config['DIR_STORAGE'];
			} else {
				output.DIR_STORAGE = output.DIR_SYSTEM + 'storage/';
			}
			output.DIR_STORAGE = output.DIR_SYSTEM + 'storage/';
			output.DIR_LANGUAGE = output.DIR_APPLICATION + 'language/';
			output.DIR_TEMPLATE = output.DIR_APPLICATION + 'view/template/';
			output.DIR_CONFIG = output.DIR_SYSTEM + 'config/';
			output.DIR_CACHE = output.DIR_STORAGE + 'cache/';
			output.DIR_DOWNLOAD = output.DIR_STORAGE + 'download/';
			output.DIR_LOGS = output.DIR_STORAGE + 'logs/';
			output.DIR_SESSION = output.DIR_STORAGE + 'session/';
			output.DIR_UPLOAD = output.DIR_STORAGE + 'upload/';
			output.DB_DRIVER = DB_DRIVER;
			output.DB_HOSTNAME = DB_HOSTNAME;
			output.DB_USERNAME = DB_USERNAME;
			output.DB_PASSWORD = DB_PASSWORD;
			output.DB_DATABASE = DB_DATABASE;
			if (DB_PORT) {
				output.DB_PORT = DB_PORT;
			} else {
				output.DB_PORT = 3306;
			}

			output.DB_PREFIX = DB_PREFIX;
			output.DB_DEBUG = DB_DEBUG || true;
			output.SERVER_PORT = SERVER_PORT || 8080;
			output.OPENCART_SERVER = OPENCART_SERVER || 'https://www.opencart.com/';
			// Save file
			fs.writeFileSync(adminFile, JSON.stringify(output, null, "\t"));
		}

		// If create any missing storage directories
		const directories = [
			'backup',
			'cache',
			'download',
			'logs',
			'marketplace',
			'session',
			'upload'
		];

		const storage = config['DIR_STORAGE'] ? config['DIR_STORAGE'] : DIR_SYSTEM + 'storage/';

		directories.forEach((directory) => {
			if (!fs.existsSync(storage + directory)) {
				fs.mkdirSync(storage + directory, '0644');
				fs.writeFileSync(storage + directory + '/index.html', '');
			}
		});

		// Move files from old directories to new ones.
		const move = {
			[DIR_IMAGE + 'data/']: DIR_IMAGE + 'catalog/', // Merge image/data to image/catalog
			[DIR_SYSTEM + 'upload/']: storage + 'upload/', // Merge system/upload to system/storage/upload
			[DIR_SYSTEM + 'download/']: storage + 'download/' // Merge system/download to system/storage/download
		};

		for (const [source, destination] of Object.entries(move)) {
			let files = [];
			let directory = [source];

			while (directory.length) {
				const next = directory.shift();

				fs.readdirSync((next)).forEach((file) => {
					// If directory add to path array
					if (fs.lstatSync(file).isDirectory()) {
						directory.push(next + file);
					}

					// Add the file to the files to be deleted array
					files.push(file);
				});
			}

			files.forEach((file) => {
				const path = file.substring(source.length);

				if (fs.existsSync(source + path) && !fs.existsSync(destination + path)) {
					fs.mkdirSync(destination + path, '0777');
				}

				if (fs.existsSync(source + path) && !fs.existsSync(destination + path)) {
					fs.copyFileSync(source + path, destination + path);
				}
			});

			// Start deleting old storage location files.
			files.sort().reverse();

			files.forEach((file) => {
				// If file just delete
				if (fs.existsSync(file)) {
					fs.unlinkSync(file);
				}

				// If directory use the remove directory function
				if (fs.existsSync(file)) {
					fs.rmdirSync(file);
				}
			});
		}

		// Remove files in old directories
		const remove = [
			DIR_SYSTEM + 'logs/',
			DIR_SYSTEM + 'cache/',
		];

		let files = [];

		remove.forEach((directory) => {
			if (fs.existsSync(directory)) {
				// Make path into an array
				let path = [directory + '*'];

				// While the path array is still populated keep looping through
				while (path.length) {
					const next = path.shift();

					glob(next).forEach((file) => {
						// If directory add to path array
						if (fs.existsSync(file)) {
							path.push(file + '/*');
						}

						// Add the file to the files to be deleted array
						files.push(file);
					});

					// Reverse sort the file array
					files.sort().reverse();

					// Clear all modification files
					files.forEach((file) => {
						if (file !== directory + 'index.html') {
							// If file just delete
							if (fs.existsSync(file)) {
								fs.unlinkSync(file);
							}

							// If directory use the remove directory function
							if (fs.existsSync(file)) {
								fs.rmdirSync(file);
							}
						}
					});
				}
			}
		});

		if (!Object.keys(json).length) {
			json['text'] = sprintf(this.language.get('text_progress'), 1, 1, 9);

			let url = '';

			if (this.request.get['version']) {
				url += '&version=' + this.request.get['version'];
			}

			if (this.request.get['admin']) {
				url += '&admin=' + this.request.get['admin'];
			}

			json['next'] = await this.url.link('upgrade/upgrade_2', url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

