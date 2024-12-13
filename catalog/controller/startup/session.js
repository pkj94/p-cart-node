const setcookie = require("locutus/php/network/setcookie");

module.exports = class ControllerStartupSession extends Controller {
	async index() {
const data = {};
		if ((this.request.get['api_token']) && (this.request.get['route']) && this.request.get['route'].substr(0, 4) == 'api/') {
			await this.db.query("DELETE FROM `" + DB_PREFIX + "api_session` WHERE TIMESTAMPADD(HOUR, 1, date_modified) < NOW()");

			// Make sure the IP is allowed
			const api_query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "api` `a` LEFT JOIN `" + DB_PREFIX + "api_session` `as` ON (a.api_id = as.api_id) LEFT JOIN " + DB_PREFIX + "api_ip `ai` ON (a.api_id = ai.api_id) WHERE a+status = '1' AND `as`.`session_id` = '" + this.db.escape(this.request.get['api_token']) + "' AND ai.ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : '')) + "'");

			if (api_query.num_rows) {
				// await this.session.start(this.request.get['api_token']);

				// keep the session alive
				await this.db.query("UPDATE `" + DB_PREFIX + "api_session` SET `date_modified` = NOW() WHERE `api_session_id` = '" + api_query.row['api_session_id'] + "'");
			}
		} else {
			let session_id = '';
			if ((this.request.cookie[this.config.get('session_name')])) {
				session_id = this.request.cookie[this.config.get('session_name')];
			}

			// await this.session.start(session_id);
			let options = {
				'expires': new Date(new Date().getTime() + (parseInt(this.config.get('config_session_expire') || 1) * 1000)),
				'path': this.config.get('session_path')||'/',
				'secure': this.request.server['protocol'].toLowerCase() == 'https' ? true : false,
				'httponly': false,
				'SameSite': this.config.get('session_samesite')||''
			};
			// console.log(options)
			this.response.response.cookie(this.config.get('session_name'), this.session.getId(), options);
		}
	}
}