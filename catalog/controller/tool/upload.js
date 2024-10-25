module.exports = class Upload extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('tool/upload');

		const json = {};
		let filename;
		if ((this.request.files['file']['name'])) {
			// Sanitize the filename
			filename = expressPath.basename(html_entity_decode(this.request.files['file']['name'].replace(/[^a-zA-Z0-9.\-\s+]/g, '')));

			// Validate the filename length
			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 64)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			let allowed = [];

			let extension_allowed = this.config.get('config_file_ext_allowed').replace(/\r?\n/g, '\n');

			let filetypes = extension_allowed.split("\n");

			for (let filetype of filetypes) {
				allowed.push(filetype.trim());
			}

			if (!allowed.includes(filename.split('.').pop().toLowerCase())) {
				json['error'] = this.language.get('error_file_type');
			}

			// Allowed file mime types
			allowed = [];

			let mime_allowed = this.config.get('config_file_mime_allowed').replace(/\r?\n/g, '\n');

			filetypes = mime_allowed.split("\n");

			for (let filetype of filetypes) {
				allowed.push(filetype.trim());
			}

			if (!allowed.includes(this.request.files['file']['mimetype'])) {
				json['error'] = this.language.get('error_file_type');
			}

			// Return any upload error
			// if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
			// 	json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			// }
		} else {
			json['error'] = this.language.get('error_upload');
		}

		if (!Object.keys(json).length) {
			let file = filename + '+' + oc_token(32);
			try {
				await uploadFile(this.request.files['file'], DIR_UPLOAD + file);
				// Hide the uploaded file name so people cannot link to it directly.
				this.load.model('tool/upload', this);

				json['code'] = await this.model_tool_upload.addUpload(filename, file);

				json['success'] = this.language.get('text_upload');
			} catch (e) {
				console.log('----', e)
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
