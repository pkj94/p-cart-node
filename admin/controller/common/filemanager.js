const expressPath = require('path');
const fs = require('fs');
module.exports = class FileManagerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('common/filemanager');

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), this.config.get('config_file_max_size'));

		data['config_file_max_size'] = (this.config.get('config_file_max_size') * 1024 * 1024);

		// Return the target ID for the file manager to set the value
		if ((this.request.get['target'])) {
			data['target'] = this.request.get['target'];
		} else {
			data['target'] = '';
		}

		// Return the thumbnail for the file manager to show a thumbnail
		if ((this.request.get['thumb'])) {
			data['thumb'] = this.request.get['thumb'];
		} else {
			data['thumb'] = '';
		}

		// if ((this.request.get['ckeditor'])) {
		// 	data['ckeditor'] = this.request.get['ckeditor'];
		// } else {
		// 	data['ckeditor'] = '';
		// }

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('common/filemanager', data));
	}

	/**
	 * @return void
	 */
	async list() {
		const data = {};
		await this.load.language('common/filemanager');

		let base = DIR_IMAGE + 'catalog/';

		// Make sure we have the correct directory
		let directory = base;
		if ((this.request.get['directory'])) {
			directory = base + html_entity_decode(this.request.get['directory']) + '/';
		}
		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = basename(html_entity_decode(this.request.get['filter_name']));
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let allowed = [
			'.ico',
			'.jpg',
			'.jpeg',
			'.png',
			'.gif',
			'.webp',
			'.JPG',
			'.JPEG',
			'.PNG',
			'.GIF'
		];

		data['directories'] = [];
		data['images'] = [];

		this.load.model('tool/image', this);

		// Get directories and files
		let paths = fs.readdirSync(directory).filter(a => (a.indexOf('.') == -1 || allowed.indexOf('.' + (a.split('.')[a.split('.').length - 1])) != -1) && a.indexOf(filterName) != -1)


		let total = paths.length;
		let limit = 16;
		let start = (page - 1) * limit;

		if (paths) {
			// Split the array based on current page number and max number of items per page of 10
			for (let path of paths.slice(start, limit)) {
				path = fs.realpathSync(path).replaceAll('\\', '/');

				if (path.substring(0, path.length) == path) {
					let name = expressPath.basename(path);

					let url = '';

					if ((this.request.get['target'])) {
						url += '&target=' + this.request.get['target'];
					}

					if ((this.request.get['thumb'])) {
						url += '&thumb=' + this.request.get['thumb'];
					}

					if ((this.request.get['ckeditor'])) {
						url += '&ckeditor=' + this.request.get['ckeditor'];
					}

					if (fs.lstatSync(path).isDirectory()) {
						data['directories'].push({
							'name': name,
							'path': oc_substr(path, oc_strlen(base)) + '/',
							'href': this.url.link('common/filemanager.list', 'user_token=' + this.session.data['user_token'] + '&directory=' + encodeURIComponent(oc_substr(path, oc_strlen(base))) + url)
						});
					}

					if (fs.lstatSync(path).isFile() && allowed.includes(path.substring(path.indexOf('.')))) {
						data['images'].push({
							'name': name,
							'path': oc_substr(path, oc_strlen(base)),
							'href': HTTP_CATALOG + 'image/catalog/' + oc_substr(path, oc_strlen(base)),
							'thumb': this.model_tool_image.resize(oc_substr(path, oc_strlen(DIR_IMAGE)), 136, 136)
						});
					}
				}
			}
		}

		if ((this.request.get['directory'])) {
			data['directory'] = urldecode(this.request.get['directory']);
		} else {
			data['directory'] = '';
		}

		if ((this.request.get['filter_name'])) {
			data['filter_name'] = this.request.get['filter_name'];
		} else {
			data['filter_name'] = '';
		}

		// Parent
		url = '';

		if ((this.request.get['directory'])) {
			let pos = this.request.get['directory'].indexOf('/');

			if (pos) {
				url += '&directory=' + encodeURIComponent(this.request.get['directory'].substring(0, pos));
			}
		}

		if ((this.request.get['target'])) {
			url += '&target=' + this.request.get['target'];
		}

		if ((this.request.get['thumb'])) {
			url += '&thumb=' + this.request.get['thumb'];
		}

		if ((this.request.get['ckeditor'])) {
			url += '&ckeditor=' + this.request.get['ckeditor'];
		}

		data['parent'] = this.url.link('common/filemanager.list', 'user_token=' + this.session.data['user_token'] + url);

		// Refresh
		url = '';

		if ((this.request.get['directory'])) {
			url += '&directory=' + encodeURIComponent(html_entity_decode(this.request.get['directory']));
		}

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['target'])) {
			url += '&target=' + this.request.get['target'];
		}

		if ((this.request.get['thumb'])) {
			url += '&thumb=' + this.request.get['thumb'];
		}

		// if ((this.request.get['ckeditor'])) {
		// 	url += '&ckeditor=' + this.request.get['ckeditor'];
		// }

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['refresh'] = this.url.link('common/filemanager.list', 'user_token=' + this.session.data['user_token'] + url);

		let url = '';

		if ((this.request.get['directory'])) {
			url += '&directory=' + encodeURIComponent(html_entity_decode(this.request.get['directory']));
		}

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['target'])) {
			url += '&target=' + this.request.get['target'];
		}

		if ((this.request.get['thumb'])) {
			url += '&thumb=' + this.request.get['thumb'];
		}

		// if ((this.request.get['ckeditor'])) {
		// 	url += '&ckeditor=' + this.request.get['ckeditor'];
		// }

		// Get total number of files and directories
		data['pagination'] = await this.load.controller('common/pagination', {
			'total': total,
			'page': page,
			'limit': limit,
			'url': this.url.link('common/filemanager.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		this.response.setOutput(await this.load.view('common/filemanager_list', data));
	}

	/**
	 * @return void
	 */
	// async upload() {
	// 	await this.load.language('common/filemanager');

	// 	const json = {};

	// 	let base = DIR_IMAGE + 'catalog/';

	// 	// Check user has permission
	// 	if (!await this.user.hasPermission('modify', 'common/filemanager')) {
	// 		json['error'] = this.language.get('error_permission');
	// 	}

	// 	// Make sure we have the correct directory
	// 	let directory = base;
	// 	if ((this.request.get['directory'])) {
	// 		directory = base + html_entity_decode(this.request.get['directory']) + '/';
	// 	}

	// 	// Check it's a directory
	// 	if (!fs.lstatSync(directory).isDirectory() || (fs.realpathSync(directory).replaceAll('\\', '/') + '/').substring(0, base.length) != base) {
	// 		json['error'] = this.language.get('error_directory');
	// 	}

	// 	if (!json.error) {
	// 		// Check if multiple files are uploaded or just one
	// 		let files = [];

	// 		if ((this.request.files['file']['name']) && is_array(this.request.files['file']['name'])) {
	// 			for (array_keys(this.request.files['file']['name']) of key) {
	// 				files.push({
	// 					'name': this.request.files['file']['name'][key],
	// 					'type': this.request.files['file']['type'][key],
	// 					'tmp_name': this.request.files['file']['tmp_name'][key],
	// 					'error': this.request.files['file']['error'][key],
	// 					'size': this.request.files['file']['size'][key]
	// 				});
	// 			}
	// 		}

	// 		for (files of file) {
	// 			if (is_file(file['tmp_name'])) {
	// 				// Sanitize the filename
	// 				filename = preg_replace('[/\\?%*:|"<>]', '', basename(html_entity_decode(file['name'])));

	// 				// Validate the filename length
	// 				if ((oc_strlen(filename) < 4) || (oc_strlen(filename) > 255)) {
	// 					json['error'] = this.language.get('error_filename');
	// 				}

	// 				// Allowed file extension types
	// 				allowed = [
	// 					'ico',
	// 					'jpg',
	// 					'jpeg',
	// 					'png',
	// 					'gif',
	// 					'webp',
	// 					'JPG',
	// 					'JPEG',
	// 					'PNG',
	// 					'GIF'
	// 				];

	// 				if (!in_array(substr(filename, strrpos(filename, '.') + 1), allowed)) {
	// 					json['error'] = this.language.get('error_file_type');
	// 				}

	// 				// Allowed file mime types
	// 				allowed = [
	// 					'image/x-icon',
	// 					'image/jpeg',
	// 					'image/pjpeg',
	// 					'image/png',
	// 					'image/x-png',
	// 					'image/gif',
	// 					'image/webp'
	// 				];

	// 				if (!in_array(file['type'], allowed)) {
	// 					json['error'] = this.language.get('error_file_type');
	// 				}

	// 				// Return any upload error
	// 				if (file['error'] != UPLOAD_ERR_OK) {
	// 					json['error'] = this.language.get('error_upload_' + file['error']);
	// 				}
	// 			} else {
	// 				json['error'] = this.language.get('error_upload');
	// 			}

	// 			if (!Object.keys(json).length) {
	// 				move_uploaded_file(file['tmp_name'], directory + filename);
	// 			}
	// 		}
	// 	}

	// 	if (!Object.keys(json).length) {
	// 		json['success'] = this.language.get('text_uploaded');
	// 	}

	// 	this.response.addHeader('Content-Type: application/json');
	// 	this.response.setOutput(json);
	// }

	/**
	 * @return void
	 */
	// async folder() {
	// 	await this.load.language('common/filemanager');

	// 	const json = {};

	// 	base = DIR_IMAGE + 'catalog/';

	// 	// Check user has permission
	// 	if (!await this.user.hasPermission('modify', 'common/filemanager')) {
	// 		json['error'] = this.language.get('error_permission');
	// 	}

	// 	// Make sure we have the correct directory
	// 	if ((this.request.get['directory'])) {
	// 		directory = base + html_entity_decode(this.request.get['directory']) + '/';
	// 	} else {
	// 		directory = base;
	// 	}

	// 	// Check its a directory
	// 	if (!fs.lstatSync(directory).isDirectory() || substr(str_replace('\\', '/', realpath(directory)) + '/', 0, strlen(base)) != base) {
	// 		json['error'] = this.language.get('error_directory');
	// 	}

	// 	if (this.request.server['REQUEST_METHOD'] == 'POST') {
	// 		// Sanitize the folder name
	// 		folder = preg_replace('[/\\?%*&:|"<>]', '', basename(html_entity_decode(this.request.post['folder'])));

	// 		// Validate the filename length
	// 		if ((oc_strlen(folder) < 3) || (oc_strlen(folder) > 128)) {
	// 			json['error'] = this.language.get('error_folder');
	// 		}

	// 		// Check if directory already exists or not
	// 		if (is_dir(directory + folder)) {
	// 			json['error'] = this.language.get('error_exists');
	// 		}
	// 	}

	// 	if (!Object.keys(json).length) {
	// 		mkdir(directory + '/' + folder, 0777);

	// 		chmod(directory + '/' + folder, 0777);

	// 		@touch(directory + '/' + folder + '/' + 'index.html');

	// 		json['success'] = this.language.get('text_directory');
	// 	}

	// 	this.response.addHeader('Content-Type: application/json');
	// 	this.response.setOutput(json);
	// }

	/**
	 * @return void
	 */
	// async delete() {
	// 	await this.load.language('common/filemanager');

	// 	const json = {};

	// 	base = DIR_IMAGE + 'catalog/';

	// 	// Check user has permission
	// 	if (!await this.user.hasPermission('modify', 'common/filemanager')) {
	// 		json['error'] = this.language.get('error_permission');
	// 	}

	// 	if ((this.request.post['path'])) {
	// 		paths = this.request.post['path'];
	// 	} else {
	// 		paths = [];
	// 	}

	// 	// Loop through each path to run validations
	// 	for (paths of path) {
	// 		// Convert any html encoded characters.
	// 		path = html_entity_decode(path);

	// 		// Check path exists
	// 		if ((path == base) || (substr(str_replace('\\', '/', realpath(base + path)) + '/', 0, strlen(base)) != base)) {
	// 			json['error'] = this.language.get('error_delete');

	// 			break;
	// 		}
	// 	}

	// 	if (!Object.keys(json).length) {
	// 		// Loop through each path
	// 		for (paths of path) {
	// 			path = rtrim(base + html_entity_decode(path), '/');

	// 			files = [];

	// 			// Make path into an array
	// 			directory = [path];

	// 			// While the path array is still populated keep looping through
	// 			while (count(directory) != 0) {
	// 				next = array_shift(directory);

	// 				if (is_dir(next)) {
	// 					for (glob(trim(next, '/') + '/{*,.[!.]*,..?*}', GLOB_BRACE) of file) {
	// 						// If directory add to path array
	// 						directory[] = file;
	// 					}
	// 				}

	// 				// Add the file to the files to be deleted array
	// 				files[] = next;
	// 			}

	// 			// Reverse sort the file array
	// 			rsort(files);

	// 			for (files of file) {
	// 				// If file just delete
	// 				if (fs.lstatSync(file).isFile()) {
	// 					fs.unlinkSync(file);
	// 				}

	// 				// If directory use the remove directory function
	// 				if (is_dir(file)) {
	// 					fs.rmdirSync(file);
	// 				}
	// 			}
	// 		}

	// 		json['success'] = this.language.get('text_delete');
	// 	}

	// 	this.response.addHeader('Content-Type: application/json');
	// 	this.response.setOutput(json);
	// }
}
