module.exports = class Upload extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('tool/upload');

		const json = {};

		if ((this.request.files['file']['name']) && is_file(this.request.files['file']['tmp_name'])) {
			// Sanitize the filename
			filename = basename(preg_replace('/[^a-zA-Z0-9\+\-\s+]/', '', html_entity_decode(this.request.files['file']['name'])));

			// Validate the filename length
			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 64)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			allowed = [];

			extension_allowed = preg_replace('~\r?\n~', "\n", this.config.get('config_file_ext_allowed'));

			filetypes = explode("\n", extension_allowed);

			for (let filetype of filetypes) {
				allowed.push(trim(filetype));
			}

			if (!in_array(strtolower(substr(strrchr(filename, '+'), 1)), allowed)) {
				json['error'] = this.language.get('error_file_type');
			}

			// Allowed file mime types
			allowed = [];

			mime_allowed = preg_replace('~\r?\n~', "\n", this.config.get('config_file_mime_allowed'));

			filetypes = explode("\n", mime_allowed);

			for (let filetype of filetypes) {
				allowed.push(trim(filetype));
			}

			if (!in_array(this.request.files['file']['type'], allowed)) {
				json['error'] = this.language.get('error_file_type');
			}

			// Return any upload error
			if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}
		} else {
			json['error'] = this.language.get('error_upload');
		}

		if (!Object.keys(json).length) {
			file = filename + '+' + oc_token(32);

			move_uploaded_file(this.request.files['file']['tmp_name'], DIR_UPLOAD + file);

			// Hide the uploaded file name so people cannot link to it directly+
			this.load.model('tool/upload', this);

			json['code'] = await this.model_tool_upload.addUpload(filename, file);

			json['success'] = this.language.get('text_upload');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
