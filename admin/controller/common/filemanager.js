const rtrim = require("locutus/php/strings/rtrim");
const str_replace = require("locutus/php/strings/str_replace");

module.exports = class ControllerCommonFileManager extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/filemanager');

		// Find which protocol to use to pass the full image link back
		let server = HTTP_CATALOG;
		if (this.request.server['HTTPS']) {
			server = HTTPS_CATALOG;
		}
		let filter_name = this.request.get.filter_name ? this.request.get.filter_name.replace(/[*\/\\]/g, '').replace(/\/$/, '') : ''

		// Make sure we have the correct directory
		let directory = DIR_IMAGE + 'catalog';
		if ((this.request.get['directory'])) {
			directory = rtrim(DIR_IMAGE + 'catalog/' + str_replace('*', '', this.request.get['directory']), '/');
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let directories = [];
		let files = [];

		data['images'] = [];

		this.load.model('tool/image', this);

		if (substr(str_replace('\\', '/', expressPath.resolve(directory) + '/' + filter_name), 0, (DIR_IMAGE + 'catalog').length) == str_replace('\\', '/', DIR_IMAGE + 'catalog')) {
			// Get directories
			directories = require('glob').sync(directory + '/' + filter_name + '*').sort().filter(a => a.split('.').pop() != 'html' && is_dir(a));

			if (!directories.length) {
				directories = [];
			}

			// Get files
			files = require('glob').sync(directory + '/' + filter_name + '*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}', { nodir: false }).sort().filter(a => a.split('.').pop() != 'html' && is_file(a));

			if (!files.length) {
				files = [];
			}
		}

		// Merge directories and files
		let images = [...directories, ...files];

		// Get total number of files and directories
		let image_total = images.length;

		// Split the array based on current page number and max number of items per page of 10
		images = images.splice((page - 1) * 16, 16);

		for (let image of images) {
			let name = expressPath.basename(image).split(14);

			if (is_dir(image)) {
				let url = '';

				if ((this.request.get['target'])) {
					url += '&target=' + this.request.get['target'];
				}

				if ((this.request.get['thumb'])) {
					url += '&thumb=' + this.request.get['thumb'];
				}

				data['images'].push({
					'thumb': '',
					'name': name.join(' '),
					'type': 'directory',
					'path': oc_substr(image, oc_strlen(DIR_IMAGE)),
					'href': await this.url.link('common/filemanager', 'user_token=' + this.session.data['user_token'] + '&directory=' + encodeURIComponent(oc_substr(image, oc_strlen(DIR_IMAGE + 'catalog/'))) + url, true)
				});
			} else if (is_file(image)) {
				data['images'].push({
					'thumb': await this.model_tool_image.resize(oc_substr(image, oc_strlen(DIR_IMAGE)), 100, 100),
					'name': name.join(' '),
					'type': 'image',
					'path': oc_substr(image, oc_strlen(DIR_IMAGE)).replaceAll('\\','/'),
					'href': server + 'image/' + oc_substr(image, oc_strlen(DIR_IMAGE))
				});
			}
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['directory'])) {
			data['directory'] = encodeURIComponent(this.request.get['directory']);
		} else {
			data['directory'] = '';
		}

		if ((this.request.get['filter_name'])) {
			data['filter_name'] = this.request.get['filter_name'];
		} else {
			data['filter_name'] = '';
		}

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

		// Parent
		let url = '';

		if ((this.request.get['directory'])) {
			let pos = this.request.get['directory'].indexOf('/');

			if (pos) {
				url += '&directory=' + encodeURIComponent(this.request.get['directory'].substr(0, pos));
			}
		}

		if ((this.request.get['target'])) {
			url += '&target=' + this.request.get['target'];
		}

		if ((this.request.get['thumb'])) {
			url += '&thumb=' + this.request.get['thumb'];
		}

		data['parent'] = await this.url.link('common/filemanager', 'user_token=' + this.session.data['user_token'] + url, true);

		// Refresh
		url = '';

		if ((this.request.get['directory'])) {
			url += '&directory=' + encodeURIComponent(this.request.get['directory']);
		}

		if ((this.request.get['target'])) {
			url += '&target=' + this.request.get['target'];
		}

		if ((this.request.get['thumb'])) {
			url += '&thumb=' + this.request.get['thumb'];
		}

		data['refresh'] = await this.url.link('common/filemanager', 'user_token=' + this.session.data['user_token'] + url, true);

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

		const pagination = new Pagination();
		pagination.total = image_total;
		pagination.page = page;
		pagination.limit = 16;
		pagination.url = await this.url.link('common/filemanager', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		this.response.setOutput(await this.load.view('common/filemanager', data));
	}

	async upload() {
		await this.load.language('common/filemanager');
		const json = {};

		let base = DIR_IMAGE + 'catalog/';

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'common/filemanager')) {
			json['error'] = this.language.get('error_permission');
		}

		// Make sure we have the correct directory
		let directory = base;
		if ((this.request.get['directory'])) {
			directory = base + html_entity_decode(this.request.get['directory']) + '/';
		}

		// Check it's a directory
		if (!fs.lstatSync(directory).isDirectory() || (expressPath.resolve(directory).replaceAll('\\', '/') + '/').substr(0, base.length) != base) {
			json['error'] = this.language.get('error_directory');
		}

		if (!json.error) {
			// Check if multiple files are uploaded or just one
			let files = [];
			if (this.request.files.file && !Array.isArray(this.request.files.file)) {
				files = [this.request.files.file];
			} else if (this.request.files.file) {
				files = this.request.files.file;
			}
			if (!files.length) {
				json['error'] = this.language.get('error_upload');
			}
			for (let file of files) {
				// Sanitize the filename
				// console.log('file--', file, file['name'])
				let filename = file['name'].replace(new RegExp('[/\\?%*:|"<>]'), '');
				// console.log('filename----', filename)

				// Validate the filename length
				if ((oc_strlen(filename) < 4) || (oc_strlen(filename) > 255)) {
					json['error'] = this.language.get('error_filename');
				}

				// Allowed file extension types
				let allowed = [
					'ico',
					'jpg',
					'jpeg',
					'png',
					'gif',
					'webp',
					'JPG',
					'JPEG',
					'PNG',
					'GIF'
				];
				// console.log('filename------', filename, filename.split('.').pop())
				if (!allowed.includes(filename.split('.').pop())) {
					json['error'] = this.language.get('error_file_type');
				}

				// Allowed file mime types
				allowed = [
					'image/x-icon',
					'image/jpeg',
					'image/pjpeg',
					'image/png',
					'image/x-png',
					'image/gif',
					'image/webp'
				];

				if (!allowed.includes(file['mimetype'])) {
					json['error'] = this.language.get('error_file_type');
				}

				// Return any upload error
				// if (file['error'] != UPLOAD_ERR_OK) {
				// 	json['error'] = this.language.get('error_upload_' + file['error']);
				// }


				if (!json.error) {
					try {
						await uploadFile(file, directory + filename);
					} catch (err) {
						json['error'] = this.language.get('error_upload_' + file['error']);
					}
				}
			}
		}

		if (!json.error) {
			json['success'] = this.language.get('text_uploaded');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async folder() {
		await this.load.language('common/filemanager');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'common/filemanager')) {
			json['error'] = this.language.get('error_permission');
		}

		// Make sure we have the correct directory
		let directory = DIR_IMAGE + 'catalog';
		if ((this.request.get['directory'])) {
			directory = rtrim(DIR_IMAGE + 'catalog/' + this.request.get['directory'], '/');
		}

		// Check its a directory
		if (!fs.lstatSync(directory).isDirectory() || (expressPath.resolve(directory).replaceAll('\\', '/') + '/').substr(0, (DIR_IMAGE + 'catalog').length) != DIR_IMAGE + 'catalog') {
			json['error'] = this.language.get('error_directory');
		}
		let folder = '';
		if (this.request.server['method'] == 'POST') {
			// Sanitize the folder name
			folder = expressPath.basename(html_entity_decode(this.request.post['folder']));

			// Validate the filename length
			if ((oc_strlen(folder) < 3) || (oc_strlen(folder) > 128)) {
				json['error'] = this.language.get('error_folder');
			}

			// Check if directory already exists or not
			if (is_dir(directory + '/' + folder)) {
				json['error'] = this.language.get('error_exists');
			}
		}

		if (!(json['error'])) {
			fs.mkdirSync(directory + '/' + folder);

			fs.writeFileSync(directory + '/' + folder + '/' + 'index.html', '');

			json['success'] = this.language.get('text_directory');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async delete() {
		await this.load.language('common/filemanager');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'common/filemanager')) {
			json['error'] = this.language.get('error_permission');
		}
		let paths = [];
		if ((this.request.post['path'])) {
			paths = this.request.post['path'];
		}
		// Loop through each path to run validations
		for (let path of paths) {
			// Check path exists
			if (path == DIR_IMAGE + 'catalog' || expressPath.resolve(DIR_IMAGE + path).replaceAll('\\', '/').substr(0, strlen(DIR_IMAGE + 'catalog')) != (DIR_IMAGE + 'catalog').replaceAll('\\', '/')) {
				json['error'] = this.language.get('error_delete');

				break;
			}
		}
		if (!json.error) {
			// Loop through each path
			for (let path of paths) {
				path = rtrim(DIR_IMAGE + path, '/');
				// If path is just a file delete it
				if (is_file(path)) {
					fs.unlinkSync(path);

					// If path is a directory beging deleting each file and sub folder
				} else if (is_dir(path)) {
					let files = [];

					// Make path into an array
					path = [path];

					// While the path array is still populated keep looping through
					while (path.length != 0) {
						let next = (path.shift()).replaceAll('\\', '/');
						for (let file of require('glob').sync(next)) {

							// If directory add to path array
							if (is_dir(file)) {
								path.push(file + '/*');
							}

							// Add the file to the files to be deleted array
							files.push(file);
						}
					}

					// Reverse sort the file array
					files = files.reverse();
					for (let file of files) {
						// If file just delete
						if (is_file(file)) {
							fs.unlinkSync(file);

							// If directory use the remove directory function
						} else if (is_dir(file)) {
							fs.rmdirSync(file);
						}
					}
				}
			}

			json['success'] = this.language.get('text_delete');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
