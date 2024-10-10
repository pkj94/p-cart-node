<?php
namespace Opencart\Admin\Controller\Tool;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Tool
 */
class BackupController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('tool/backup');

		this.document.setTitle(this.language.get('heading_title'));

		// Use the ini_get('upload_max_filesize') for the max file size
		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), ini_get('upload_max_filesize'));

		data['config_file_max_size'] = (preg_filter('/[^0-9]/', '', ini_get('upload_max_filesize')) * 1024 * 1024);

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'])
		});

		data['upload'] = this.url.link('tool/backup.upload', 'user_token=' + this.session.data['user_token']);

		this.load.model('tool/backup');

		ignore = [
			DB_PREFIX + 'user',
			DB_PREFIX + 'user_group'
		});

		data['tables'] = [];

		const results = await this.model_tool_backup.getTables();

		for (let result of results) {
			if (!in_array(result, ignore)) {
				data['tables'][] = result;
			}
		}

		data['history'] = this.getHistory();

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

		this.response.setOutput(this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		await this.load.language('tool/backup');

		data['histories'] = [];

		files = glob(DIR_STORAGE + 'backup/*.sql');

		for (files of file) {
			size = filesize(file);

			i = 0;

			suffix = [
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
				'filename'   : basename(file),
				'size'       : round(substr(size, 0, strpos(size, '.') + 4), 2) + suffix[i],
				'date_added' : date(this.language.get('datetime_format'), filemtime(file)),
				'download'   : this.url.link('tool/backup.download', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(basename(file))),
			];
		}

		return await this.load.view('tool/backup_history', data);
	}

	/**
	 * @return void
	 */
	async backup() {
		await this.load.language('tool/backup');

		const json = {};

		if ((this.request.get['filename'])) {
			filename = basename(html_entity_decode(this.request.get['filename']));
		} else {
			filename = date('Y-m-d H.i.s') + '.sql';
		}

		if ((this.request.get['table'])) {
			table = this.request.get['table'];
		} else {
			table = '';
		}

		if ((this.request.post['backup'])) {
			backup = this.request.post['backup'];
		} else {
			backup = [];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('tool/backup');

		allowed await this.model_tool_backup.getTables();

		if (!in_array(table, allowed)) {
			json['error'] = sprintf(this.language.get('error_table'), table);
		}

		if (!Object.keys(json).length) {
			output = '';

			if (page == 1) {
				output += 'TRUNCATE TABLE `' + this.db.escape(table) + '`;' + "\n\n";
			}

			record_total await this.model_tool_backup.getTotalRecords(table);

			const results = await this.model_tool_backup.getRecords(table, (page - 1) * 200, 200);

			for (let result of results) {
				fields = '';

				for (array_keys(result) of value) {
					fields += '`' + value + '`, ';
				}

				values = '';

				for (array_values(result) of value) {
					if (value !== null) {
						value = str_replace(["\x00", "\x0a", "\x0d", "\x1a"], ['\0', '\n', '\r', '\Z'], value);
						value = str_replace(["\n", "\r", "\t"], ['\n', '\r', '\t'], value);
						value = str_replace('\\', '\\\\', value);
						value = str_replace('\'', '\\\'', value);
						value = str_replace('\\\n', '\n', value);
						value = str_replace('\\\r', '\r', value);
						value = str_replace('\\\t', '\t', value);

						values += '\'' + value + '\', ';
					} else {
						values += 'NULL, ';
					}
				}

				output += 'INSERT INTO `' + table + '` (' + preg_replace('/, /', '', fields) + ') VALUES (' + preg_replace('/, /', '', values) + ');' + "\n";
			}

			position = array_search(table, backup);

			if ((page * 200) >= record_total) {
				output += "\n";

				if ((backup[position + 1])) {
					table = backup[position + 1];
				} else {
					table = '';
				}
			}

			if (position !== false) {
				json['progress'] = round((position / count(backup)) * 100);
			} else {
				json['progress'] = 0;
			}

			handle = fopen(DIR_STORAGE + 'backup/' + filename, 'a');

			fwrite(handle, output);

			fclose(handle);

			if (!table) {
				json['success'] = this.language.get('text_success');
			} else if ((page * 200) >= record_total) {
				json['text'] = sprintf(this.language.get('text_backup'), table, (page - 1) * 200, record_total);

				json['next'] = this.url.link('tool/backup.backup', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(filename) + '&table=' + table + '&page=1', true);
			} else {
				json['text'] = sprintf(this.language.get('text_backup'), table, (page - 1) * 200, page * 200);

				json['next'] = this.url.link('tool/backup.backup', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(filename) + '&table=' + table + '&page=' + (page + 1), true);
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

		if ((this.request.get['filename'])) {
			filename = basename(html_entity_decode(this.request.get['filename']));
		} else {
			filename = '';
		}

		if ((this.request.get['position'])) {
			position = this.request.get['position'];
		} else {
			position = 0;
		}

		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		file = DIR_STORAGE + 'backup/' + filename;

		if (!fs.lstatSync(file).isFile()) {
			json['error'] = this.language.get('error_file');
		}

		if (!Object.keys(json).length) {
			// We set i so we can batch execute the queries rather than do them all at once.
			i = 0;
			start = false;

			handle = fopen(file, 'r');

			fseek(handle, position, SEEK_SET);

			while (!feof(handle) && (i < 100)) {
				position = ftell(handle);

				line = fgets(handle, 1000000);

				if (substr(line, 0, 14) == 'TRUNCATE TABLE' || substr(line, 0, 11) == 'INSERT INTO') {
					sql = '';

					start = true;
				}

				if (i > 0 && (substr(line, 0, strlen('TRUNCATE TABLE `' + DB_PREFIX + 'user`')) == 'TRUNCATE TABLE `' + DB_PREFIX + 'user`' || substr(line, 0, strlen('TRUNCATE TABLE `' + DB_PREFIX + 'user_group`')) == 'TRUNCATE TABLE `' + DB_PREFIX + 'user_group`')) {
					fseek(handle, position, SEEK_SET);

					break;
				}

				if (start) {
					sql += line;
				}

				if (start && substr(line, -2) == ";\n") {
					this.db.query(substr(sql, 0, strlen(sql) -2));

					start = false;
				}

				i++;
			}

			position = ftell(handle);

			size = filesize(file);

			if (position) {
				json['progress'] = round((position / size) * 100);
			} else {
				json['progress'] = 0;
			}

			if (position && !feof(handle)) {
				json['text'] = sprintf(this.language.get('text_restore'), position, size);

				json['next'] = this.url.link('tool/backup.restore', 'user_token=' + this.session.data['user_token'] + '&filename=' + encodeURIComponent(filename) + '&position=' + position, true);
			} else {
				json['success'] = this.language.get('text_success');

				this.cache.delete('*');
			}

			fclose(handle);
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

		if (!(this.request.files['upload']['name']) || !is_file(this.request.files['upload']['tmp_name'])) {
			json['error'] = this.language.get('error_upload');
		}

		if (!Object.keys(json).length) {
			// Sanitize the filename
			filename = basename(html_entity_decode(this.request.files['upload']['name']));

			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			if (strtolower(substr(strrchr(filename, '.'), 1)) != 'sql') {
				json['error'] = this.language.get('error_file_type');
			}
		}

		if (!Object.keys(json).length) {
			move_uploaded_file(this.request.files['upload']['tmp_name'], DIR_STORAGE + 'backup/' + filename);

			json['success'] = this.language.get('text_success');
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

		if ((this.request.get['filename'])) {
			filename = basename(html_entity_decode(this.request.get['filename']));
		} else {
			filename = '';
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			this.response.setRedirect(this.url.link('error/permission', 'user_token=' + this.session.data['user_token'], true));
		}

		file = DIR_STORAGE + 'backup/' + filename;

		if (!fs.lstatSync(file).isFile()) {
			this.response.setRedirect(this.url.link('error/not_found', 'user_token=' + this.session.data['user_token'], true));
		}

		if (!headers_sent()) {
			header('Content-Type: application/octet-stream');
			header('Content-Disposition: attachment; filename="' + filename + '"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header('Pragma: public');
			header('Content-Length: ' + filesize(file));

			if (ob_get_level()) {
				ob_end_clean();
			}

			readfile(file, 'rb');

			exit();
		} else {
			exit(this.language.get('error_headers_sent'));
		}
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('tool/backup');

		const json = {};

		if ((this.request.get['filename'])) {
			filename = basename(html_entity_decode(this.request.get['filename']));
		} else {
			filename = '';
		}

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}

		file = DIR_STORAGE + 'backup/' + filename;

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
