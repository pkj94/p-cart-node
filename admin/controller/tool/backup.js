
const sprintf = require('locutus/php/strings/sprintf');
const expressPath = require('path');
module.exports = class BackupController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('tool/backup');

		this.document.setTitle(this.language.get('heading_title'));

		// Use the ini_get('upload_max_filesize') for the max file size
		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), process.env.UPLOAD_MAX_FILESIZE || '2M');

		data['config_file_max_size'] = ((process.env.UPLOAD_MAX_FILESIZE || '2M').replace(/[^0-9]/g, '') * 1024 * 1024);


		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'])
		});

		data['upload'] = await this.url.link('tool/backup.upload', 'user_token=' + this.session.data['user_token']);

		this.load.model('tool/backup', this);

		let ignore = [
			DB_PREFIX + 'user',
			DB_PREFIX + 'user_group'
		];

		data['tables'] = [];

		const results = await this.model_tool_backup.getTables();

		for (let result of results) {
			if (!ignore.includes(result)) {
				data['tables'].push(result);
			}
		}

		data['history'] = await this.getHistory();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/backup', data));
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('tool/backup');

		this.response.setOutput(await this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		const data = {};
		await this.load.language('tool/backup');

		data['histories'] = [];

		let files = require('glob').sync(DIR_STORAGE + 'backup/*.sql');

		for (let file of files) {
			let size = fs.lstatSync(file).size;

			let i = 0;

			let suffix = [
				'B',
				'KB',
				'MB',
				'GB',
				'TB',
				'PB',
				'EB',
				'ZB',
				'YB'
			];

			while ((size / 1024) > 1) {
				size = size / 1024;

				i++;
			}

			data['histories'].push({
				'filename': expressPath.basename(file),
				'size': Math.round(size.toString().substring(0, size.toString().indexOf('.') + 4), 2) + suffix[i],
				'date_added': date(this.language.get('datetime_format'), fs.lstatSync(file).mtime),
				'download': await this.url.link('tool/backup.download', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(expressPath.basename(file))),
			});
		}

		return await this.load.view('tool/backup_history', data);
	}

	/**
	 * @return void
	 */
	async backup() {
		await this.load.language('tool/backup');

		const json = {};
		let filename = date('Y-m-d H.i.s') + '.sql';
		if ((this.request.get['filename'])) {
			filename = expressPath.basename(html_entity_decode(this.request.get['filename']));
		}
		let table = '';
		if ((this.request.get['table'])) {
			table = this.request.get['table'];
		}
		let backup = [];
		if ((this.request.post['backup'])) {
			backup = this.request.post['backup'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('tool/backup', this);

		const allowed = await this.model_tool_backup.getTables();

		if (!allowed.includes(table)) {
			json['error'] = sprintf(this.language.get('error_table'), table);
		}

		if (!Object.keys(json).length) {
			let output = '';

			if (page == 1) {
				output += `TRUNCATE TABLE \`${table}\`;\n\n`;
			}

			const record_total = await this.model_tool_backup.getTotalRecords(table);

			const results = await this.model_tool_backup.getRecords(table, (page - 1) * 200, 200);

			for (let result of results) {
				const fields = Object.keys(result).map(key => `\`${key}\``).join(', ');
				const values = Object.values(result).map(value => {
					if (value === null) return 'NULL';
					return `${this.db.escape(value)}`;
				}).join(', ');

				output += `INSERT INTO \`${table}\` (${fields.replace(/, $/, '')}) VALUES (${values.replace(/, $/, '')});\n`;
			}

			let position = backup.indexOf(table);

			if ((page * 200) >= record_total) {
				output += "\n";

				if ((backup[position + 1])) {
					table = backup[position + 1];
				} else {
					table = '';
				}
			}

			if (position !== false) {
				json['progress'] = Math.round((position / backup.length) * 100);
			} else {
				json['progress'] = 0;
			}
			fs.appendFileSync(DIR_STORAGE + 'backup/' + filename, output)


			if (!table) {
				json['success'] = this.language.get('text_success');
			} else if ((page * 200) >= record_total) {
				json['text'] = sprintf(this.language.get('text_backup'), table, (page - 1) * 200, record_total);

				json['next'] = await this.url.link('tool/backup.backup', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(filename) + '&table=' + table + '&page=1', true);
			} else {
				json['text'] = sprintf(this.language.get('text_backup'), table, (page - 1) * 200, page * 200);

				json['next'] = await this.url.link('tool/backup.backup', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(filename) + '&table=' + table + '&page=' + (page + 1), true);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async restore() {
		await this.load.language('tool/backup');

		const json = {};
		let filename = '';
		if ((this.request.get['filename'])) {
			filename = expressPath.basename(html_entity_decode(this.request.get['filename']));
		}
		let position = 0;
		if ((this.request.get['position'])) {
			position = Number(this.request.get['position']);
		}

		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		let file = DIR_STORAGE + 'backup/' + filename;

		if (!fs.lstatSync(file).isFile()) {
			json['error'] = this.language.get('error_file');
		}

		if (!Object.keys(json).length) {
			// We set i so we can batch execute the queries rather than do them all at once.
			let i = 0;
			let start = false;
			// console.log(this.request.get);
			const handle = await fs.readFileSync(file).toString();
			// console.log(handle)
			let sql = '';
			for (let line of handle.split('\n').splice(position, 100)) {
				if (line.startsWith('TRUNCATE TABLE') || line.startsWith('INSERT INTO')) {
					sql = '';
					start = true;
				}

				if (start) {
					sql += line + '\n';
				}

				if (start && line.trim().endsWith(';')) {
					try {
						await this.db.query(sql.trim());
						start = false;
					} catch (e) {
						console.log(e);
					}
				}

				i++
			}
			position = position + i;
			json.progress = (position / handle.split('\n').length) * 100;



			if (position < handle.split('\n').length) {
				json['text'] = sprintf(this.language.get('text_restore'), position, handle.split('\n').length);

				json['next'] = await this.url.link('tool/backup.restore', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(filename) + '&position=' + position, true);
			} else {
				json['success'] = this.language.get('text_success');

				await this.cache.delete('*');
			}

		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async upload() {
		await this.load.language('tool/backup');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!(this.request.files['upload']['name'])) {
			json['error'] = this.language.get('error_upload');
		}
		let filename = '';
		if (!Object.keys(json).length) {
			// Sanitize the filename
			filename = expressPath.basename(html_entity_decode(this.request.files['upload']['name']));

			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			if (filename.split('.').pop().toLowerCase() != 'sql') {
				json['error'] = this.language.get('error_file_type');
			}
		}

		if (!Object.keys(json).length) {
			try {
				await uploadFile(this.request.files['upload'], DIR_STORAGE + 'backup/' + filename);

				json['success'] = this.language.get('text_success');
			} catch (e) {
				console.log(e)
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async download() {
		await this.load.language('tool/backup');

		const json = {};
		let filename = '';
		if ((this.request.get['filename'])) {
			filename = expressPath.basename(html_entity_decode(this.request.get['filename']));
		}
		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			this.response.setRedirect(await this.url.link('error/permission', 'user_token=' + this.session.data['user_token'], true));
		} else {

			let file = DIR_STORAGE + 'backup/' + filename;

			if (!fs.lstatSync(file).isFile()) {
				this.response.setRedirect(await this.url.link('error/not_found', 'user_token=' + this.session.data['user_token'], true));
			} else {

				// if (!headers_sent()) {
				this.response.headers = [];
				this.response.addHeader('Content-Disposition: attachment; filename=' + filename);
				this.response.addHeader('Content-Transfer-Encoding :binary');
				this.response.addHeader('Content-Type :application/octet-stream');
				this.response.setFile(file)
				// } else {
				// 	this.response.setOutput(this.language.get('error_headers_sent'));
				// }
			}
		}
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('tool/backup');

		const json = {};
		let filename = '';
		if ((this.request.get['filename'])) {
			filename = expressPath.basename(html_entity_decode(this.request.get['filename']));
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		let file = DIR_STORAGE + 'backup/' + filename;

		if (!fs.lstatSync(file).isFile()) {
			json['error'] = this.language.get('error_file');
		}

		if (!Object.keys(json).length) {
			fs.unlinkSync(file);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
