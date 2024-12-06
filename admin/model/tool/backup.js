module.exports = class ModelToolBackup extends Model {
	async getTables() {
		const table_data = [];

		const query = await this.db.query("SHOW TABLES FROM `" + DB_DATABASE + "`");
		for (let result of query.rows) {
			let table = Object.values(result).length > 0 ? Object.values(result)[0] : undefined;
			if (table && oc_substr(table, 0, (DB_PREFIX).length) == DB_PREFIX) {
				table_data.push(table);
			}
		}

		return table_data;
	}

	async backup(tables) {
		let output = '';

		for (let table of tables) {
			let status = false;
			if (DB_PREFIX) {
				if (table.indexOf(DB_PREFIX) === -1) {
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

				for (let result of query.rows) {
					let fields = '';

					for (let value of Object.keys(result)) {
						fields += '`' + value + '`, ';
					}

					let values = '';
					for (let value of Object.values(result)) {
						if (value !== null) {
							let fr = {
								'\\': '\\\\',
								"\x00": '\0',
								"\n": '\n',
								"\r": '\r',
								"\x1a": '\Z',
								'\'': '\\\'',
								'"': '\"'
							}
							for (let [k, v] of Object.entries(fr)) {
								value = value.toString().replaceAll(k, v);
							}
							values += '\'' + value + '\', ';
						} else {
							values += 'NULL, ';
						}
					}

					output += 'INSERT INTO `' + table + '` (' + fields.replace(/, $/, '') + ') VALUES (' + values.replace(/, $/, '') + ');' + "\n";
				}

				output += "\n\n";
			}
		}

		return output;
	}
}