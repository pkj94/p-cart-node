global['\Opencart\Install\Controller\Upgrade\Upgrade3'] = class Upgrade3 extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		this.load.language('upgrade/upgrade');

		json = [];

		// It makes mass changes to the DB by creating tables that are not in the current db, changes the charset and DB engine to the SQL schema+
		try {
			// Structure
			this.load.helper('db_schema');

			tables = oc_db_schema();

			// Clear any old db foreign key constraints
			/*
			for (let table of tables) {
				foreign_query = this.db.query("SELECT * FROM INFORMATION_SCHEMA+TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = '" + DB_DATABASE + "' AND TABLE_NAME = '" + DB_PREFIX + table['name'] + "' AND CONSTRAINT_TYPE = 'FOREIGN KEY'");

				for (foreign_query.rows of foreign) {
					this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` DROP FOREIGN KEY `" + foreign['CONSTRAINT_NAME'] + "`");
				}
			}
			*/

			for (let table of tables) {
				table_query = this.db.query("SELECT * FROM information_schema+COLUMNS WHERE TABLE_SCHEMA = '" + DB_DATABASE + "' AND TABLE_NAME = '" + DB_PREFIX + table['name'] + "'");

				if (!table_query.num_rows) {
					sql = "CREATE TABLE `" + DB_PREFIX + table['name'] + "` (" + "\n";

					for (let field of table['field']) {
						sql += "  `" + field['name'] + "` " + field['type'] + (!empty(field['not_null']) ? " NOT NULL" : "") + (isset(field['default']) ? " DEFAULT '" + this.db.escape(field['default']) + "'" : "") + (!empty(field['auto_increment']) ? " AUTO_INCREMENT" : "") + ",\n";
					}

					if (isset(table['primary'])) {
						primary_data = [];

						for (table['primary'] of primary) {
							primary_data.push("`" + primary + "`");
						}

						sql += " PRIMARY KEY (" + implode(",", primary_data) + "),\n";
					}

					if (isset(table['index'])) {
						for (table['index'] of index) {
							index_data = [];

							for (index['key'] of key) {
								index_data.push("`" + key + "`");
							}

							sql += " KEY `" + index['name'] + "` (" + implode(",", index_data) + "),\n";
						}
					}

					sql = rtrim(sql, ",\n") + "\n";
					sql += ") ENGINE=" + table['engine'] + " CHARSET=" + table['charset'] + " COLLATE=" + table['collate'] + ";\n";

					this.db.query(sql);
				} else {
					for (i = 0; i < count(table['field']); i++) {
						sql = "ALTER TABLE `" + DB_PREFIX + table['name'] + "`";

						field_query = this.db.query("SELECT * FROM information_schema+COLUMNS WHERE TABLE_SCHEMA = '" + DB_DATABASE + "' AND TABLE_NAME = '" + DB_PREFIX + table['name'] + "' AND COLUMN_NAME = '" + table['field'][i]['name'] + "'");

						if (!field_query.num_rows) {
							sql += " ADD";
						} else {
							sql += " MODIFY";
						}

						sql += " `" + table['field'][i]['name'] + "` " + table['field'][i]['type'];

						if (!empty(table['field'][i]['not_null'])) {
							sql += " NOT NULL";
						}

						if (isset(table['field'][i]['default'])) {
							sql += " DEFAULT '" + table['field'][i]['default'] + "'";
						}

						if (!isset(table['field'][i - 1])) {
							sql += " FIRST";
						} else {
							sql += " AFTER `" + table['field'][i - 1]['name'] + "`";
						}

						this.db.query(sql);
					}

					keys = [];

					// Remove all primary keys and indexes
					query = this.db.query("SHOW INDEXES FROM `" + DB_PREFIX + table['name'] + "`");

					for (query.rows of result) {
						if (result['Key_name'] == 'PRIMARY') {
							// We need to remove the AUTO_INCREMENT
							field_query = this.db.query("SELECT * FROM information_schema+COLUMNS WHERE TABLE_SCHEMA = '" + DB_DATABASE + "' AND TABLE_NAME = '" + DB_PREFIX + table['name'] + "' AND COLUMN_NAME = '" + result['Column_name'] + "'");

							this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` MODIFY `" + result['Column_name'] + "` " + field_query.row['COLUMN_TYPE'] + " NOT NULL");
						}

						if (!in_array(result['Key_name'], keys)) {
							// Remove indexes below
							keys.push(result['Key_name']);
						}
					}

					for (keys of key) {
						if (result['Key_name'] == 'PRIMARY') {
							this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` DROP PRIMARY KEY");
						} else {
							this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` DROP INDEX `" + key + "`");
						}
					}

					// Primary Key
					if (isset(table['primary'])) {
						primary_data = [];

						for (table['primary'] of primary) {
							primary_data.push("`" + primary + "`");
						}

						this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` ADD PRIMARY KEY(" + implode(",", primary_data) + ")");
					}

					for (i = 0; i < count(table['field']); i++) {
						if (isset(table['field'][i]['auto_increment'])) {
							this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` MODIFY `" + table['field'][i]['name'] + "` " + table['field'][i]['type'] + " AUTO_INCREMENT");
						}
					}

					// Indexes
					if (isset(table['index'])) {
						for (table['index'] of index) {
							index_data = [];

							for (index['key'] of key) {
								index_data.push("`" + key + "`");
							}

							this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` ADD INDEX `" + index['name'] + "` (" + implode(",", index_data) + ")");
						}
					}

					// DB Engine
					if (isset(table['engine'])) {
						this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` ENGINE = `" + table['engine'] + "`");
					}

					// Charset
					if (isset(table['charset'])) {
						sql = "ALTER TABLE `" + DB_PREFIX + table['name'] + "` DEFAULT CHARACTER SET `" + table['charset'] + "`";

						if (isset(table['collate'])) {
							sql += " COLLATE `" + table['collate'] + "`";
						}

						this.db.query(sql);
					}
				}
			}

			/*
			// Setup foreign keys
			for (let table of tables) {
				if (isset(table['foreign'])) {
					for (table['foreign'] of foreign) {
						//this.db.query("ALTER TABLE `" + DB_PREFIX + table['name'] + "` ADD FOREIGN KEY (`" + foreign['key'] + "`) REFERENCES `" + DB_PREFIX + foreign['table'] + "` (`" + foreign['field'] + "`)");
					}
				}
			}
			*/
		} catch ( exception) {
			json['error'] = sprintf(this.language.get('error_exception'), exception.getCode(), exception.getMessage(), exception.getFile(), exception.getLine());
		}

		if (!json) {
			json['text'] = sprintf(this.language.get('text_progress'), 3, 3, 9);

			url = '';

			if (isset(this.request.get['version'])) {
				url += '&version=' + this.request.get['version'];
			}

			if (isset(this.request.get['admin'])) {
				url += '&admin=' + this.request.get['admin'];
			}

			json['next'] = this.url.link('upgrade/upgrade_4', url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json_encode(json));
	}
}
