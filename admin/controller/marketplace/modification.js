module.exports = /**
 * Modifcation XML Documentation can be found here:
 *
 * https://github.com/opencart/opencart/wiki/Modification-System
 */
class ControllerMarketplaceModification extends Controller {
	error = {};

	async index() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification');

		await this.getList();
	}

	async delete() {
		await this.load.language('marketplace/modification');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/modification');

		if ((this.request.post['selected']) && await this.validate()) {
			for (this.request.post['selected'] of modification_id) {
				await this.model_setting_modification.deleteModification(modification_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

		this.load.model('setting/modification');

		if (this.validate()) {
			// Just before files are deleted, if config settings say maintenance mode is off then turn it on
			maintenance = this.config.get('config_maintenance');

			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSettingValue('config', 'config_maintenance', true);

			//Log
			log = {};

			// Clear all modification files
			files = {};

			// Make path into an array
			path = array(DIR_MODIFICATION + '*');

			// While the path array is still populated keep looping through
			while (count(path) != 0) {
				next = array_shift(path);

				for (glob(next) of file) {
					// If directory add to path array
					if (is_dir(file)) {
						path.push(file + '/*';
					}

					// Add the file to the files to be deleted array
					files.push(file;
				}
			}

			// Reverse sort the file array
			rsort(files);

			// Clear all modification files
			for (let file of files) {
				if (file != DIR_MODIFICATION + 'index.html') {
					// If file just delete
					if (is_file(file)) {
						unlink(file);

					// If directory use the remove directory function
					} else if (is_dir(file)) {
						rmdir(file);
					}
				}
			}

			// Begin
			xml = {};

			// Load the default modification XML
			xml.push(file_get_contents(DIR_SYSTEM + 'modification.xml');

			// This is purly for developers so they can run mods directly and have them run without upload after each change.
			files = glob(DIR_SYSTEM + '*.ocmod.xml');

			if (files) {
				for (let file of files) {
					xml.push(file_get_contents(file);
				}
			}

			// Get the default modification file
			results = await this.model_setting_modification.getModifications();

			for (let result of results) {
				if (result['status']) {
					xml.push(result['xml'];
				}
			}

			modification = {};

			for (xml of xml) {
				if (empty(xml)){
					continue;
				}
				
				dom = new DOMDocument('1.0', 'UTF-8');
				dom.preserveWhiteSpace = false;
				dom.loadXml(xml);

				// Log
				log.push('MOD: ' + dom.getElementsByTagName('name').item(0).textContent;

				// Wipe the past modification store in the backup array
				recovery = {};

				// Set the a recovery of the modification code in case we need to use it if an abort attribute is used.
				if (modification) {
					recovery = modification;
				}

				files = dom.getElementsByTagName('modification').item(0).getElementsByTagName('file');

				for (let file of files) {
					operations = file.getElementsByTagName('operation');

					files = explode('|', str_replace("\\", '/', file.getAttribute('path')));

					for (let file of files) {
						path = '';

						// Get the full path of the files that are going to be used for modification
						if ((substr(file, 0, 7) == 'catalog')) {
							path = DIR_CATALOG + substr(file, 8);
						}

						if ((substr(file, 0, 5) == 'admin')) {
							path = DIR_APPLICATION + substr(file, 6);
						}

						if ((substr(file, 0, 6) == 'system')) {
							path = DIR_SYSTEM + substr(file, 7);
						}

						if (path) {
							files = glob(path, GLOB_BRACE);

							if (files) {
								for (let file of files) {
									// Get the key to be used for the modification cache filename.
									if (substr(file, 0, strlen(DIR_CATALOG)) == DIR_CATALOG) {
										key = 'catalog/' + substr(file, strlen(DIR_CATALOG));
									}

									if (substr(file, 0, strlen(DIR_APPLICATION)) == DIR_APPLICATION) {
										key = 'admin/' + substr(file, strlen(DIR_APPLICATION));
									}

									if (substr(file, 0, strlen(DIR_SYSTEM)) == DIR_SYSTEM) {
										key = 'system/' + substr(file, strlen(DIR_SYSTEM));
									}

									// If file contents is not already in the modification array we need to load it.
									if (!(modification[key])) {
										content = file_get_contents(file);

										modification[key] = preg_replace('~\r?\n~', "\n", content);
										original[key] = preg_replace('~\r?\n~', "\n", content);

										// Log
										log.push(PHP_EOL + 'FILE: ' + key;

									} else {
										// Log
										log.push(PHP_EOL + 'FILE: (sub modification) ' + key;
									
									}

									for (operations of operation) {
										error = operation.getAttribute('error');

										// Ignoreif
										ignoreif = operation.getElementsByTagName('ignoreif').item(0);

										if (ignoreif) {
											if (ignoreif.getAttribute('regex') != 'true') {
												if (strpos(modification[key], ignoreif.textContent) !== false) {
													continue;
												}
											} else {
												if (preg_match(ignoreif.textContent, modification[key])) {
													continue;
												}
											}
										}

										status = false;

										// Search and replace
										if (operation.getElementsByTagName('search').item(0).getAttribute('regex') != 'true') {
											// Search
											search = operation.getElementsByTagName('search').item(0).textContent;
											trim = operation.getElementsByTagName('search').item(0).getAttribute('trim');
											index = operation.getElementsByTagName('search').item(0).getAttribute('index');

											// Trim line if no trim attribute is set or is set to true.
											if (!trim || trim == 'true') {
												search = trim(search);
											}

											// Add
											add = operation.getElementsByTagName('add').item(0).textContent;
											trim = operation.getElementsByTagName('add').item(0).getAttribute('trim');
											position = operation.getElementsByTagName('add').item(0).getAttribute('position');
											offset = operation.getElementsByTagName('add').item(0).getAttribute('offset');

											if (offset == '') {
												offset = 0;
											}

											// Trim line if is set to true.
											if (trim == 'true') {
												add = trim(add);
											}

											// Log
											log.push('CODE: ' + search;

											// Check if using indexes
											if (index !== '') {
												indexes = explode(',', index);
											} else {
												indexes = {};
											}

											// Get all the matches
											i = 0;

											lines = explode("\n", modification[key]);

											for (line_id = 0; line_id < count(lines); line_id++) {
												line = lines[line_id];

												// Status
												match = false;

												// Check to see if the line matches the search code.
												if (stripos(line, search) !== false) {
													// If indexes are not used then just set the found status to true.
													if (!indexes) {
														match = true;
													} else if (in_array(i, indexes)) {
														match = true;
													}

													i++;
												}

												// Now for replacing or adding to the matched elements
												if (match) {
													switch (position) {
														default:
														case 'replace':
															new_lines = explode("\n", add);

															if (offset < 0) {
																array_splice(lines, line_id + offset, abs(offset) + 1, array(str_replace(search, add, line)));

																line_id -= offset;
															} else {
																array_splice(lines, line_id, offset + 1, array(str_replace(search, add, line)));
															}
															break;
														case 'before':
															new_lines = explode("\n", add);

															array_splice(lines, line_id - offset, 0, new_lines);

															line_id += count(new_lines);
															break;
														case 'after':
															new_lines = explode("\n", add);

															array_splice(lines, (line_id + 1) + offset, 0, new_lines);

															line_id += count(new_lines);
															break;
													}

													// Log
													log.push('LINE: ' + line_id;

													status = true;
												}
											}

											modification[key] = implode("\n", lines);
										} else {
											search = trim(operation.getElementsByTagName('search').item(0).textContent);
											limit = operation.getElementsByTagName('search').item(0).getAttribute('limit');
											replace = trim(operation.getElementsByTagName('add').item(0).textContent);

											// Limit
											if (!limit) {
												limit = -1;
											}

											// Log
											match = {};

											preg_match_all(search, modification[key], match, PREG_OFFSET_CAPTURE);

											// Remove part of the the result if a limit is set.
											if (limit > 0) {
												match[0] = array_slice(match[0], 0, limit);
											}

											if (match[0]) {
												log.push('REGEX: ' + search;

												for (i = 0; i < count(match[0]); i++) {
													log.push('LINE: ' + (substr_count(substr(modification[key], 0, match[0][i][1]), "\n") + 1);
												}

												status = true;
											}

											// Make the modification
											modification[key] = preg_replace(search, replace, modification[key], limit);
										}

										if (!status) {
											// Abort applying this modification completely.
											if (error == 'abort') {
												modification = recovery;
												// Log
												log.push('NOT FOUND - ABORTING!';
												break 5;
											}
											// Skip current operation or break
											else if (error == 'skip') {
												// Log
												log.push('NOT FOUND - OPERATION SKIPPED!';
												continue;
											}
											// Break current operations
											else {
												// Log
												log.push('NOT FOUND - OPERATIONS ABORTED!';
											 	break;
											}
										}
									}
								}
							}
						}
					}
				}

				// Log
				log.push('----------------------------------------------------------------';
			}

			// Log
			ocmod = new Log('ocmod.log');
			ocmod.write(implode("\n", log));

			// Write all modification files
			for (modification of key : value) {
				// Only create a file if there are changes
				if (original[key] != value) {
					path = '';

					directories = explode('/', dirname(key));

					for (directories of directory) {
						path = path + '/' + directory;

						if (!is_dir(DIR_MODIFICATION + path)) {
							@mkdir(DIR_MODIFICATION + path, 0777);
						}
					}

					handle = fopen(DIR_MODIFICATION + key, 'w');

					fwrite(handle, value);

					fclose(handle);
				}
			}

			// Maintance mode back to original settings
			await this.model_setting_setting.editSettingValue('config', 'config_maintenance', maintenance);

			// Do not return success message if refresh() was called with data
			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

		this.load.model('setting/modification');

		if (this.validate()) {
			files = {};

			// Make path into an array
			path = array(DIR_MODIFICATION + '*');

			// While the path array is still populated keep looping through
			while (count(path) != 0) {
				next = array_shift(path);

				for (glob(next) of file) {
					// If directory add to path array
					if (is_dir(file)) {
						path.push(file + '/*';
					}

					// Add the file to the files to be deleted array
					files.push(file;
				}
			}

			// Reverse sort the file array
			rsort(files);

			// Clear all modification files
			for (let file of files) {
				if (file != DIR_MODIFICATION + 'index.html') {
					// If file just delete
					if (is_file(file)) {
						unlink(file);

					// If directory use the remove directory function
					} else if (is_dir(file)) {
						rmdir(file);
					}
				}
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

		this.load.model('setting/modification');

		if ((this.request.get['modification_id']) && await this.validate()) {
			await this.model_setting_modification.enableModification(this.request.get['modification_id']);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

		this.load.model('setting/modification');

		if ((this.request.get['modification_id']) && await this.validate()) {
			await this.model_setting_modification.disableModification(this.request.get['modification_id']);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

		this.load.model('setting/modification');
		
		if (this.validate()) {
			handle = fopen(DIR_LOGS + 'ocmod.log', 'w+');

			fclose(handle);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		url = '';

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
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'], true)
		});

		data['refresh'] = await this.url.link('marketplace/modification/refresh', 'user_token=' + this.session.data['user_token'] + url, true);
		data['clear'] = await this.url.link('marketplace/modification/clear', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('marketplace/modification/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['modifications'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		modification_total = await this.model_setting_modification.getTotalModifications();

		results = await this.model_setting_modification.getModifications(filter_data);

		for (let result of results) {
			data['modifications'].push({
				'modification_id' : result['modification_id'],
				'name'            : result['name'],
				'author'          : result['author'],
				'version'         : result['version'],
				'status'          : result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled'),
				'date_added'      : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'link'            : result['link'],
				'enable'          : await this.url.link('marketplace/modification/enable', 'user_token=' + this.session.data['user_token'] + '&modification_id=' + result['modification_id'], true),
				'disable'         : await this.url.link('marketplace/modification/disable', 'user_token=' + this.session.data['user_token'] + '&modification_id=' + result['modification_id'], true),
				'enabled'         : result['status']
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

			delete this.session.data['success']);
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

		pagination = new Pagination();
		pagination.total = modification_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (modification_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (modification_total - Number(this.config.get('config_limit_admin')))) ? modification_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), modification_total, Math.ceil(modification_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		// Log
		file = DIR_LOGS + 'ocmod.log';

		if (file_exists(file)) {
			data['log'] = htmlentities(file_get_contents(file, FILE_USE_INCLUDE_PATH, null));
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

		return Object.keys(this.error).length?false:true
	}
}
