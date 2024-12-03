const htmlentities = require('locutus/php/strings/htmlentities');
const { DOMParser } = require('xmldom');
/**
* Modifcation XML Documentation can be found here:
*
* https://github.com/opencart/opencart/wiki/Modification-System
*/
module.exports = class ControllerMarketplaceModification extends Controller {
	error = {};

	async index() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		await this.getList();
	}

	async delete() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		if ((this.request.post['selected']) && await this.validate()) {
			for (let modification_id of this.request.post['selected'] ) {
				await this.model_setting_modification.deleteModification(modification_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async refresh(data = {}) {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		if (await this.validate()) {
			// Just before files are deleted, if config settings say maintenance mode is off then turn it on
			const maintenance = this.config.get('config_maintenance');

			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSettingValue('config', 'config_maintenance', true);

			//Log
			let log = [];

			// Clear all modification files
			let files = [];

			// Make path into an array
			let path = [DIR_MODIFICATION + '*'];

			// While the path array is still populated keep looping through
			while (path.length != 0) {
				let next = path.shift();

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

			// Clear all modification files
			for (let file of files) {
				if (file != DIR_MODIFICATION + 'index.html') {
					// If file just delete
					if (is_file(file)) {
						fs.unlinkSync(file);

						// If directory use the remove directory function
					} else if (is_dir(file)) {
						fs.rmdirSync(file);
					}
				}
			}

			// Begin
			let xmls = [];

			// Load the default modification XML
			xmls.push(fs.readFileSync(DIR_SYSTEM + 'modification.xml').toString());

			// This is purly for developers so they can run mods directly and have them run without upload after each change.
			files = require('glob').sync(DIR_SYSTEM + '*.ocmod.xml');

			if (files.length) {
				for (let file of files) {
					xmls.push(fs.readFileSync(file).toString());
				}
			}

			// Get the default modification file
			const results = await this.model_setting_modification.getModifications();

			for (let result of results) {
				if (result['status']) {
					xmls.push(result['xml']);
				}
			}

			let modification = {};

			let original = {};

			xmls.forEach(xmlString => {
				if (!xmlString) return;

				const dom = new DOMParser().parseFromString(xmlString, 'text/xml');
				log.push('MOD: ' + dom.getElementsByTagName('name')[0].textContent);

				let recovery = modification ? { ...modification } : {};

				const files = dom.getElementsByTagName('modification')[0].getElementsByTagName('file');

				Array.from(files).forEach(file => {
					const operations = file.getElementsByTagName('operation');
					const paths = file.getAttribute('path').replace(/\\/g, '/').split('|');

					paths.forEach(filePath => {
						let fullPath = '';

						if (filePath.startsWith('catalog')) {
							fullPath = DIR_CATALOG + filePath.substr(8);
						} else if (filePath.startsWith('admin')) {
							fullPath = DIR_APPLICATION + filePath.substr(6);
						} else if (filePath.startsWith('system')) {
							fullPath = DIR_SYSTEM + filePath.substr(7);
						}

						if (fullPath) {
							const matchedFiles = require('glob').sync(fullPath);

							matchedFiles.forEach(file => {
								let key = '';

								if (file.startsWith(DIR_CATALOG)) {
									key = 'catalog/' + file.substr(DIR_CATALOG.length);
								} else if (file.startsWith(DIR_APPLICATION)) {
									key = 'admin/' + file.substr(DIR_APPLICATION.length);
								} else if (file.startsWith(DIR_SYSTEM)) {
									key = 'system/' + file.substr(DIR_SYSTEM.length);
								}

								if (!modification[key]) {
									const content = fs.readFileSync(file, 'utf8');
									modification[key] = content.replace(/\r?\n/g, "\n");
									original[key] = content.replace(/\r?\n/g, "\n");

									log.push('\nFILE: ' + key);
								} else {
									log.push('\nFILE: (sub modification) ' + key);
								}

								Array.from(operations).forEach(operation => {
									const error = operation.getAttribute('error');
									const ignoreif = operation.getElementsByTagName('ignoreif')[0];

									if (ignoreif) {
										const ignoreifText = ignoreif.textContent;
										if (ignoreif.getAttribute('regex') !== 'true') {
											if (modification[key].includes(ignoreifText)) return;
										} else {
											const regex = new RegExp(ignoreifText);
											if (regex.test(modification[key])) return;
										}
									}

									let status = false;
									const search = operation.getElementsByTagName('search')[0].textContent;
									const trim = operation.getElementsByTagName('search')[0].getAttribute('trim');
									const index = operation.getElementsByTagName('search')[0].getAttribute('index');
									const add = operation.getElementsByTagName('add')[0].textContent;
									const addTrim = operation.getElementsByTagName('add')[0].getAttribute('trim');
									const position = operation.getElementsByTagName('add')[0].getAttribute('position');
									const offset = operation.getElementsByTagName('add')[0].getAttribute('offset') || 0;

									const searchString = trim !== 'false' ? search.trim() : search;
									const addString = addTrim === 'true' ? add.trim() : add;

									log.push('CODE: ' + searchString);

									const indexes = index ? index.split(',').map(i => parseInt(i, 10)) : [];

									const lines = modification[key].split('\n');
									let i = 0;

									for (let lineId = 0; lineId < lines.length; lineId++) {
										const line = lines[lineId];
										let match = false;

										if (line.includes(searchString)) {
											if (indexes.length === 0 || indexes.includes(i)) {
												match = true;
											}
											i++;
										}

										if (match) {
											let newLines;
											switch (position) {
												case 'before':
													newLines = addString.split('\n');
													lines.splice(lineId - offset, 0, ...newLines);
													lineId += newLines.length;
													break;
												case 'after':
													newLines = addString.split('\n');
													lines.splice((lineId + 1) + offset, 0, ...newLines);
													lineId += newLines.length;
													break;
												default:
												case 'replace':
													newLines = addString.split('\n');
													lines.splice(lineId, offset + 1, str.replace(searchString, addString));
													break;
											}

											log.push('LINE: ' + lineId);
											status = true;
										}
									}

									modification[key] = lines.join('\n');

									if (!status) {
										if (error === 'abort') {
											modification = recovery;
											log.push('NOT FOUND - ABORTING!');
											return;
										} else if (error === 'skip') {
											log.push('NOT FOUND - OPERATION SKIPPED!');
										} else {
											log.push('NOT FOUND - OPERATIONS ABORTED!');
										}
									}
								});
							});
						}
					});
				});

				log.push('----------------------------------------------------------------');
			});


			// Log
			let ocmod = new Log('ocmod.log');
			await ocmod.write(log.join("\n"));

			// Write all modification files
			for (let [key, value] of Object.entries(modification)) {
				// Only create a file if there are changes
				if (original[key] != value) {
					path = '';

					let directories = expressPath.dirname(key).split('/');

					for (let directory of directories) {
						path = path + '/' + directory;

						if (!is_dir(DIR_MODIFICATION + path)) {
							fs.mkdirSync(DIR_MODIFICATION + path);
						}
					}
					fs.writeFileSync(DIR_MODIFICATION + key, value)

				}
			}

			// Maintance mode back to original settings
			await this.model_setting_setting.editSettingValue('config', 'config_maintenance', maintenance);

			// Do not return success message if refresh() was called with data
			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link((data['redirect']) ? data['redirect'] : 'marketplace/modification', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async clear() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		if (await this.validate()) {
			let files = [];

			// Make path into an array
			let path = [DIR_MODIFICATION + '*'];

			// While the path array is still populated keep looping through
			while (path.length != 0) {
				let next = path.shift();

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

			// Clear all modification files
			for (let file of files) {
				if (file != DIR_MODIFICATION + 'index.html') {
					// If file just delete
					if (is_file(file)) {
						fs.unlinkSync(file);

						// If directory use the remove directory function
					} else if (is_dir(file)) {
						fs.rmdirSync(file);
					}
				}
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async enable() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		if ((this.request.get['modification_id']) && await this.validate()) {
			await this.model_setting_modification.enableModification(this.request.get['modification_id']);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async disable() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		if ((this.request.get['modification_id']) && await this.validate()) {
			await this.model_setting_modification.disableModification(this.request.get['modification_id']);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async clearlog() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification', this);

		if (await this.validate()) {
			fs.writeFileSync(DIR_LOGS + 'ocmod.log', '');

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		let sort = 'name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'], true)
		});

		data['refresh'] = await this.url.link('marketplace/modification/refresh', 'user_token=' + this.session.data['user_token'] + url, true);
		data['clear'] = await this.url.link('marketplace/modification/clear', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('marketplace/modification/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['modifications'] = {};

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const modification_total = await this.model_setting_modification.getTotalModifications();

		const results = await this.model_setting_modification.getModifications(filter_data);

		for (let result of results) {
			data['modifications'].push({
				'modification_id': result['modification_id'],
				'name': result['name'],
				'author': result['author'],
				'version': result['version'],
				'status': result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled'),
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'link': result['link'],
				'enable': await this.url.link('marketplace/modification/enable', 'user_token=' + this.session.data['user_token'] + '&modification_id=' + result['modification_id'], true),
				'disable': await this.url.link('marketplace/modification/disable', 'user_token=' + this.session.data['user_token'] + '&modification_id=' + result['modification_id'], true),
				'enabled': result['status']
			});
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_author'] = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + '&sort=author' + url, true);
		data['sort_version'] = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + '&sort=version' + url, true);
		data['sort_status'] = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);
		data['sort_date_added'] = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = modification_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (modification_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (modification_total - Number(this.config.get('config_limit_admin')))) ? modification_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), modification_total, Math.ceil(modification_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		// Log
		let file = DIR_LOGS + 'ocmod.log';

		if (is_file(file)) {
			data['log'] = htmlentities(fs.readFileSync(file));
		} else {
			data['log'] = '';
		}

		data['clear_log'] = await this.url.link('marketplace/modification/clearlog', 'user_token=' + this.session.data['user_token'], true);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/modification', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'marketplace/modification')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}
