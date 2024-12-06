module.exports = class ControllerToolBackup extends Controller {
	async index() {
		const data = {};
		await this.load.language('tool/backup');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete this.session.data['error'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		data['export'] = await this.url.link('tool/backup/export', 'user_token=' + this.session.data['user_token'], true);

		this.load.model('tool/backup', this);

		data['tables'] = await this.model_tool_backup.getTables();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/backup', data));
	}

	async import() {
		await this.load.language('tool/backup');

		const json = {};

		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}
		let filename = '';
		if ((this.request.files['import'])) {
			filename = expressPath.join(DIR_UPLOAD, `bac-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`);
			fs.closeSync(fs.openSync(filename, 'w'));
			await uploadFile(this.request.files['import'], filename);
		} else if ((this.request.get['import'])) {
			filename = DIR_UPLOAD + expressPath.basename(html_entity_decode(this.request.get['import']));
		} else {
			filename = '';
		}

		if (!is_file(filename)) {
			json['error'] = this.language.get('error_file');
		}
		let position = 0;
		if ((this.request.get['position'])) {
			position = this.request.get['position'];
		}

		if (!json.error) {
			// We set i so we can batch execute the queries rather than do them all at once.
			let i = 0;
			let start = false;

			const handle = fs.openSync(filename, 'r');
			const buffer = Buffer.alloc(1000000);
			fs.readSync(handle, buffer, 0, buffer.length, position);
			let sql = '';
			while ((i < 100)) {
				position = fs.fstatSync(handle).size;
				let line = buffer.toString('utf-8', position, position + 1000000).split('\n')[0];
				if (line.startsWith('TRUNCATE TABLE') || line.startsWith('INSERT INTO')) {
					sql = '';
					start = true;
				}

				if (i > 0 && (line.startsWith('TRUNCATE TABLE `user`') || line.startsWith('TRUNCATE TABLE `user_group`'))) {
					fs.seekSync(handle, position, 0);
					break;
				}

				if (start) {
					sql += line;
				}

				if (start && line.endsWith(';\n')) {
					await this.db.query(sql.slice(0, - 2));

					start = false;
				} else if (start && line.endsWith(';\r\n')) {
					await this.db.query(sql.slice(0, -3));

					start = false;
				}

				i++;
			}

			position = fs.fstatSync(handle).size;
			const size = fs.statSync(filename).size;

			json['total'] = Math.round((position / size) * 100);

			if (position && position < size) {
				json['next'] = (await this.url.link('tool/backup/import', 'user_token=' + this.session.data['user_token'] + '&import=' + filename + '&position=' + position, true)).replaceAll('&amp;', '&');
				fs.closeSync(handle);
			} else {
				fs.closeSync(handle);
				fs.unlinkSync(filename);

				json['success'] = this.language.get('text_success');

				await this.cache.delete('*');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async export() {
		await this.load.language('tool/backup');

		if (!(this.request.post['backup'])) {
			this.session.data['error'] = this.language.get('error_export');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true));
		} else if (!await this.user.hasPermission('modify', 'tool/backup')) {
			this.session.data['error'] = this.language.get('error_permission');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true));
		} else {
			this.response.addHeader('Pragma: public');
			this.response.addHeader('Expires: 0');
			this.response.addHeader('Content-Description: File Transfer');
			this.response.addHeader('Content-Type: application/octet-stream');
			this.response.addHeader('Content-Disposition: attachment; filename="' + DB_DATABASE + '_' + date('Y-m-d_H-i-s', new Date()) + '_backup.sql"');
			this.response.addHeader('Content-Transfer-Encoding: binary');

			this.load.model('tool/backup', this);

			this.response.setOutput(await this.model_tool_backup.backup(this.request.post['backup']));
		}
	}
}
