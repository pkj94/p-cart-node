module.exports = class ModelExtensionFraudIp extends Model {
	async install() {
		await this.db.query(`
		CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}fraud_ip\` (
		  \`ip\` varchar(40) NOT NULL,
		  \`date_added\` datetime NOT NULL,
		  PRIMARY KEY (\`ip\`)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
		`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "fraud_ip`");
	}

    async addIp(ip) {
        await this.db.query("INSERT INTO `" + DB_PREFIX + "fraud_ip` SET `ip` = '" + this.db.escape(ip) + "', date_added = NOW()");
    }

    async removeIp(ip) {
        await this.db.query("DELETE FROM `" + DB_PREFIX + "fraud_ip` WHERE `ip` = '" + this.db.escape(ip) + "'");
    }

	async getIps(start = 0, limit = 10) {
        if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

        const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "fraud_ip` ORDER BY `ip` ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalIps() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "fraud_ip`");

		return query.row['total'];
	}

	async getTotalIpsByIp(ip) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "fraud_ip` WHERE ip = '" + this.db.escape(ip) + "'");

		return query.row['total'];
	}
}
