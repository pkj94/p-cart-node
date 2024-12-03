module.exports = class ControllerToolBackup extends Controller {
	async index() {
const data = {};
		await this.load.language('tool/backup');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete this.session.data['error']);
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		data['export'] = await this.url.link('tool/backup/export', 'user_token=' + this.session.data['user_token'], true);
		
		this.load.model('tool/backup');

		data['tables'] = await this.model_tool_backup.getTables();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/backup', data));
	}
	
	async import() {
		await this.load.language('tool/backup');
		
		json = {};
		
		if (!await this.user.hasPermission('modify', 'tool/backup')) {
			json['error'] = this.language.get('error_permission');
		}
		
		if ((this.request.files['import']['tmp_name']) && is_uploaded_file(this.request.files['import']['tmp_name'])) {
			filename = tempnam(DIR_UPLOAD, 'bac');
			
			move_uploaded_file(this.request.files['import']['tmp_name'], filename);
		} else if ((this.request.get['import'])) {
			filename = DIR_UPLOAD + basename(html_entity_decode(this.request.get['import']));
		} else {
			filename = '';
		}
		
		if (!is_file(filename)) {
			json['error'] = this.language.get('error_file');
		}	
		
		if ((this.request.get['position'])) {
			position = this.request.get['position'];
		} else {
			position = 0; 	
		}
				
		if (!json) {
			// We set i so we can batch execute the queries rather than do them all at once.
			i = 0;
			start = false;
			
			handle = fopen(filename, 'r');

			fseek(handle, position, SEEK_SET);
			
			while (!feof(handle) && (i < 100)) {
				position = ftell(handle);

				line = fgets(handle, 1000000);
				
				if (substr(line, 0, 14) == 'TRUNCATE TABLE' || substr(line, 0, 11) == 'INSERT INTO') {
					let sql = '';
					
					start = true;
				}

				if (i > 0 && (substr(line, 0, 24) == 'TRUNCATE TABLE `' + DB_PREFIX +  'user`' || substr(line, 0, 30) == 'TRUNCATE TABLE `' + DB_PREFIX + 'user_group`')) {
					fseek(handle, position, SEEK_SET);

					break;
				}

				if (start) {
					sql += line;
				}
				
				if (start && substr(line, -2) == ";\n") {
					await this.db.query(substr(sql, 0, strlen(sql) -2));

					start = false;
				} else if (start && substr(line, -3) == ";\r\n") {
					await this.db.query(substr(sql, 0, strlen(sql) -3));

					start = false;
				}
					
				i++;
			}

			position = ftell(handle);

			size = filesize(filename);

			json['total'] = Math.round((position / size) * 100);

			if (position && !feof(handle)) {
				json['next'] = str_replace('&amp;', '&', await this.url.link('tool/backup/import', 'user_token=' + this.session.data['user_token'] + '&import=' + filename + '&position=' + position, true));
			
				fclose(handle);
			} else {
				fclose(handle);
				
				unlink(filename);

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

			this.response.setRedirect(await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true));
		} else if (!await this.user.hasPermission('modify', 'tool/backup')) {
			this.session.data['error'] = this.language.get('error_permission');

			this.response.setRedirect(await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true));
		} else {
			this.response.addheader('Pragma: public');
			this.response.addheader('Expires: 0');
			this.response.addheader('Content-Description: File Transfer');
			this.response.addheader('Content-Type: application/octet-stream');
			this.response.addheader('Content-Disposition: attachment; filename="' + DB_DATABASE + '_' + date('Y-m-d_H-i-s', time()) + '_backup.sql"');
			this.response.addheader('Content-Transfer-Encoding: binary');

			this.load.model('tool/backup');

			this.response.setOutput(await this.model_tool_backup.backup(this.request.post['backup']));		
		}
	}	
}
