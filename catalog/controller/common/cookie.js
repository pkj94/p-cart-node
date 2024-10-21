const sprintf = require("locutus/php/strings/sprintf");

module.exports = class CookieController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		if (this.config.get('config_cookie_id') && !(this.request.cookie['policy'])) {
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_cookie_id'));

			if (information_info.information_id) {
				await this.load.language('common/cookie');

				data['text_cookie'] = sprintf(this.language.get('text_cookie'), await this.url.link('information/information.info', 'language=' + this.config.get('config_language') + '&information_id=' + information_info['information_id']));

				data['agree'] = await this.url.link('common/cookie+confirm', 'language=' + this.config.get('config_language') + '&agree=1');
				data['disagree'] = await this.url.link('common/cookie+confirm', 'language=' + this.config.get('config_language') + '&agree=0');

				return await this.load.view('common/cookie', data);
			}
		}

		return '';
	}

	/**
	 * @return void
	 */
	async confirm() {
		const json = {};

		if (this.config.get('config_cookie_id') && !(this.request.cookie['policy'])) {
			await this.load.language('common/cookie');
			let agree = 0;
			if ((this.request.get['agree'])) {
				agree = this.request.get['agree'];
			}
			let dt = new Date();
			dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
			let option = {
				'expires': dt,
				'path': this.config.get('session_path'),
				'SameSite': this.config.get('config_session_samesite')
			};

			this.response.response.cookie('policy', agree, option);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
