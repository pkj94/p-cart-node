const sprintf = require('locutus/php/strings/sprintf');

module.exports = class DeveloperCommonController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('common/developer');

		data['developer_sass'] = this.config.get('developer_sass');

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('common/developer', data));
	}

	/**
	 * @return void
	 */
	async edit() {
		await this.load.language('common/developer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'common/developer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('developer', this.request.post, 0);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async theme() {
		await this.load.language('common/developer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'common/developer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			let directories = require('glob').sync(DIR_CACHE + 'template/');

			if (directories) {
				for (let directory of directories) {
					let files = require('glob').sync(directory + '/');

					for (let file of files) {
						if (fs.lstatSync(file).isFile()) {
							fs.unlinkSync(file);
						}
					}

					if (fs.lstatSync(directory).isDirectory()) {
						fs.rmdirSync(directory);
					}
				}
			}

			json['success'] = sprintf(this.language.get('text_cache'), this.language.get('text_theme'));
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async sass() {
		await this.load.language('common/developer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'common/developer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			// Before we delete we need to make sure there is a sass file to regenerate the css
			let file = DIR_APPLICATION + 'view/stylesheet/bootstrap.css';

			if (fs.lstatSync(file).isFile() && fs.lstatSync(DIR_APPLICATION + 'view/stylesheet/scss/bootstrap.scss').isFile()) {
				fs.unlinkSync(file);
			}

			let files = require('glob').sync(DIR_CATALOG + 'view/theme/*/stylesheet/scss/bootstrap.scss');

			for (let file of files) {
				file = file.substring(0, -20) + '/bootstrap.css';

				if (fs.lstatSync(file).isFile()) {
					fs.unlinkSync(file);
				}
			}

			files = require('glob').sync(DIR_CATALOG + 'view/theme/*/stylesheet/stylesheet.scss');

			for (let file of files) {
				console.log(file)
				file = file.substring(0, -16) + '/stylesheet.css';
				console.log(file)

				if (fs.lstatSync(file).isFile()) {
					fs.unlinkSync(file);
				}
			}

			json['success'] = sprintf(this.language.get('text_cache'), this.language.get('text_sass'));
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}