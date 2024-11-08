module.exports = class ControllerCommonFileManager extends Controller {
	async index() {
		await this.load.language('common/filemanager');

		// Find which protocol to use to pass the full image link back
		if (this.request.server['HTTPS']) {
			server = HTTPS_CATALOG;
		} else {
			server = HTTP_CATALOG;
		}

		if ((this.request.get['filter_name'])) {
			filter_name = rtrim(str_replace(array('*', '/', '\\'), '', this.request.get['filter_name']), '/');
		} else {
			filter_name = '';
		}

		// Make sure we have the correct directory
		if ((this.request.get['directory'])) {
			directory = rtrim(DIR_IMAGE + 'catalog/' + str_replace('*', '', this.request.get['directory']), '/');
		} else {
			directory = DIR_IMAGE + 'catalog';
		}

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		directories = {};
		files = {};

		data['images'] = {};

		this.load.model('tool/image',this);

		if (substr(str_replace('\\', '/', realpath(directory) + '/' + filter_name), 0, strlen(DIR_IMAGE + 'catalog')) == str_replace('\\', '/', DIR_IMAGE + 'catalog')) {
			// Get directories
			directories = glob(directory + '/' + filter_name + '*', GLOB_ONLYDIR);

			if (!directories) {
				directories = {};
			}

			// Get files
			files = glob(directory + '/' + filter_name + '*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}', GLOB_BRACE);

			if (!files) {
				files = {};
			}
		}

		// Merge directories and files
		images = array_merge(directories, files);

		// Get total number of files and directories
		image_total = count(images);

		// Split the array based on current page number and max number of items per page of 10
		images = array_splice(images, (page - 1) * 16, 16);

		for (images of image) {
			name = str_split(basename(image), 14);

			if (is_dir(image)) {
				url = '';

				if ((this.request.get['target'])) {
					url += '&target=' + this.request.get['target'];
				}

				if ((this.request.get['thumb'])) {
					url += '&thumb=' + this.request.get['thumb'];
				}

				data['images'].push({
					'thumb' : '',
					'name'  : implode(' ', name),
					'type'  : 'directory',
					'path'  : oc_substr(image, oc_strlen(DIR_IMAGE)),
					'href'  : await this.url.link('common/filemanager', 'user_token=' + this.session.data['user_token'] + '&directory=' + urlencode(oc_substr(image, oc_strlen(DIR_IMAGE + 'catalog/'))) + url, true)
				);
			} else if (is_file(image)) {
				data['images'].push({
					'thumb' : await this.model_tool_image.resize(oc_substr(image, oc_strlen(DIR_IMAGE)), 100, 100),
					'name'  : implode(' ', name),
					'type'  : 'image',
					'path'  : oc_substr(image, oc_strlen(DIR_IMAGE)),
					'href'  : server + 'image/' + oc_substr(image, oc_strlen(DIR_IMAGE))
				);
			}
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['directory'])) {
			data['directory'] = urlencode(this.request.get['directory']);
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
		url = '';

		if ((this.request.get['directory'])) {
			pos = strrpos(this.request.get['directory'], '/');

			if (pos) {
				url += '&directory=' + urlencode(substr(this.request.get['directory'], 0, pos));
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
			url += '&directory=' + urlencode(this.request.get['directory']);
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
			url += '&directory=' + urlencode(html_entity_decode(this.request.get['directory']));
		}

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['target'])) {
			url += '&target=' + this.request.get['target'];
		}

		if ((this.request.get['thumb'])) {
			url += '&thumb=' + this.request.get['thumb'];
		}

		pagination = new Pagination();
		pagination.total = image_total;
		pagination.page = page;
		pagination.limit = 16;
		pagination.url = await this.url.link('common/filemanager', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		this.response.setOutput(await this.load.view('common/filemanager', data));
	}

	async upload() {
		await this.load.language('common/filemanager');

		json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'common/filemanager')) {
			json['error'] = this.language.get('error_permission');
		}

		// Make sure we have the correct directory
		if ((this.request.get['directory'])) {
			directory = rtrim(DIR_IMAGE + 'catalog/' + this.request.get['directory'], '/');
		} else {
			directory = DIR_IMAGE + 'catalog';
		}

		// Check its a directory
		if (!is_dir(directory) || substr(str_replace('\\', '/', realpath(directory)), 0, strlen(DIR_IMAGE + 'catalog')) != str_replace('\\', '/', DIR_IMAGE + 'catalog')) {
			json['error'] = this.language.get('error_directory');
		}

		if (!json) {
			// Check if multiple files are uploaded or just one
			files = {};

			if ((this.request.files['file']['name']) && Array.isArray(this.request.files['file']['name'])) {
				for (array_keys(this.request.files['file']['name']) of key) {
					files.push({
						'name'     : this.request.files['file']['name'][key],
						'type'     : this.request.files['file']['type'][key],
						'tmp_name' : this.request.files['file']['tmp_name'][key],
						'error'    : this.request.files['file']['error'][key],
						'size'     : this.request.files['file']['size'][key]
					);
				}
			}

			for (let file of files) {
				if (is_file(file['tmp_name'])) {
					// Sanitize the filename
					filename = basename(html_entity_decode(file['name']));

					// Validate the filename length
					if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 255)) {
						json['error'] = this.language.get('error_filename');
					}

					// Allowed file extension types
					allowed = array(
						'jpg',
						'jpeg',
						'gif',
						'png',
						'webp'
					);

					if (!in_array(oc_strtolower(oc_substr(strrchr(filename, '.'), 1)), allowed)) {
						json['error'] = this.language.get('error_filetype');
					}

					// Allowed file mime types
					allowed = array(
						'image/jpeg',
						'image/pjpeg',
						'image/png',
						'image/x-png',
						'image/gif',
						'image/webp'
					);

					if (!in_array(file['type'], allowed)) {
						json['error'] = this.language.get('error_filetype');
					}

					if (file['size'] > this.config.get('config_file_max_size')) {
						json['error'] = this.language.get('error_filesize');
					}

					// Return any upload error
					if (file['error'] != UPLOAD_ERR_OK) {
						json['error'] = this.language.get('error_upload_' + file['error']);
					}
				} else {
					json['error'] = this.language.get('error_upload');
				}

				if (!json) {
					move_uploaded_file(file['tmp_name'], directory + '/' + filename);
				}
			}
		}

		if (!json) {
			json['success'] = this.language.get('text_uploaded');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async folder() {
		await this.load.language('common/filemanager');

		json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'common/filemanager')) {
			json['error'] = this.language.get('error_permission');
		}

		// Make sure we have the correct directory
		if ((this.request.get['directory'])) {
			directory = rtrim(DIR_IMAGE + 'catalog/' + this.request.get['directory'], '/');
		} else {
			directory = DIR_IMAGE + 'catalog';
		}

		// Check its a directory
		if (!is_dir(directory) || substr(str_replace('\\', '/', realpath(directory)), 0, strlen(DIR_IMAGE + 'catalog')) != str_replace('\\', '/', DIR_IMAGE + 'catalog')) {
			json['error'] = this.language.get('error_directory');
		}

		if (this.request.server['method'] == 'POST') {
			// Sanitize the folder name
			folder = basename(html_entity_decode(this.request.post['folder']));

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
			mkdir(directory + '/' + folder, 0777);
			chmod(directory + '/' + folder, 0777);

			@touch(directory + '/' + folder + '/' + 'index.html');

			json['success'] = this.language.get('text_directory');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async delete() {
		await this.load.language('common/filemanager');

		json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'common/filemanager')) {
			json['error'] = this.language.get('error_permission');
		}

		if ((this.request.post['path'])) {
			paths = this.request.post['path'];
		} else {
			paths = {};
		}

		// Loop through each path to run validations
		for (paths of path) {
			// Check path exists
			if (path == DIR_IMAGE + 'catalog' || substr(str_replace('\\', '/', realpath(DIR_IMAGE + path)), 0, strlen(DIR_IMAGE + 'catalog')) != str_replace('\\', '/', DIR_IMAGE + 'catalog')) {
				json['error'] = this.language.get('error_delete');

				break;
			}
		}

		if (!json) {
			// Loop through each path
			for (paths of path) {
				path = rtrim(DIR_IMAGE + path, '/');

				// If path is just a file delete it
				if (is_file(path)) {
					unlink(path);

				// If path is a directory beging deleting each file and sub folder
				} else if (is_dir(path)) {
					files = {};

					// Make path into an array
					path = array(path);

					// While the path array is still populated keep looping through
					while (count(path) != 0) {
						next = array_shift(path);

						for (glob(next) of file) {
							// If directory add to path array
							if (is_dir(file)) {
								path[] = file + '/*';
							}

							// Add the file to the files to be deleted array
							files[] = file;
						}
					}

					// Reverse sort the file array
					rsort(files);

					for (let file of files) {
						// If file just delete
						if (is_file(file)) {
							unlink(file);

						// If directory use the remove directory function
						} else if (is_dir(file)) {
							rmdir(file);
						}
					}
				}
			}

			json['success'] = this.language.get('text_delete');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}
}
