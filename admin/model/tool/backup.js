module.exports = class ModelToolBackup extends Model {
	async getTables() {
		table_data = {};

		const query = await this.db.query("SHOW TABLES FROM `" + DB_DATABASE + "`");

		for (let result of query.rows ) {
			table = reset(result);
			if (table && oc_substr(table, 0, strlen(DB_PREFIX)) == DB_PREFIX) {
				table_data[] = table;
			}
		}

		return table_data;
	}

	async backup(tables) {
		output = '';

		for (tables of table) {
			if (DB_PREFIX) {
				if (strpos(table, DB_PREFIX) === false) {
					status = false;
				} else {
					status = true;
				}
			} else {
				status = true;
			}

			if (status) {
				output += 'TRUNCATE TABLE `' + table + '`;' + "\n\n";

				const query = await this.db.query("SELECT * FROM `" + table + "`");

				for (let result of query.rows ) {
					fields = '';

					for (array_keys(result) of value) {
						fields += '`' + value + '`, ';
					}

					values = '';

					for (array_values(result) of value) {
						if (value !== null) {
							value = str_replace(array('\\', "\x00", "\n", "\r", "\x1a", '\'', '"'), array('\\\\', '\0', '\n', '\r', '\Z', '\\\'', '\"'), value);
							values += '\'' + value + '\', ';
						} else {
							values += 'NULL, ';
						}
					}

					output += 'INSERT INTO `' + table + '` (' + preg_replace('/, /', '', fields) + ') VALUES (' + preg_replace('/, /', '', values) + ');' + "\n";
				}

				output += "\n\n";
			}
		}

		return output;
	}
}