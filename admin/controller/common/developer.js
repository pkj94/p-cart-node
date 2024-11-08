module.exports = class ControllerCommonDeveloper extends Controller {
	async index() {
		await this.load.language('common/developer');

		data['user_token'] = this.session.data['user_token'];

		data['developer_theme'] = this.config.get('developer_theme');
		data['developer_sass'] = this.config.get('developer_sass');

		eval = false;

		eval = 'eval = true;';

		eval(eval);

		if (eval === true) {
			data['eval'] = true;
		} else {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('developer', array('developer_theme' : 1), 0);

			data['eval'] = false;
		}

		this.response.setOutput(await this.load.view('common/developer', data));
	}

	async edit() {
		await this.load.language('common/developer');

		json = {};

		if (!await this.user.hasPermission('modify', 'common/developer')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('developer', this.request.post, 0);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async theme() {
		await this.load.language('common/developer');

		json = {};

		if (!await this.user.hasPermission('modify', 'common/developer')) {
			json['error'] = this.language.get('error_permission');
		} else {
			directories = glob(DIR_CACHE + '/template/*', GLOB_ONLYDIR);

			if (directories) {
				for (directories of directory) {
					files = glob(directory + '/*');

					for (let file of files) { 
						if (is_file(file)) {
							unlink(file);
						}
					}

					if (is_dir(directory)) {
						rmdir(directory);
					}
				}
			}

			json['success'] = sprintf(this.language.get('text_cache'), this.language.get('text_theme'));
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async sass() {
		await this.load.language('common/developer');

		json = {};

		if (!await this.user.hasPermission('modify', 'common/developer')) {
			json['error'] = this.language.get('error_permission');
		} else {
			// Before we delete we need to make sure there is a sass file to regenerate the css
			file = DIR_APPLICATION  + 'view/stylesheet/bootstrap.css';

			if (is_file(file) && is_file(DIR_APPLICATION + 'view/stylesheet/sass/_bootstrap.scss')) {
				unlink(file);
			}
			 
			files = glob(DIR_CATALOG  + 'view/theme/*/stylesheet/sass/_bootstrap.scss');
			 
			for (let file of files) {
				file = substr(file, 0, -21) + '/bootstrap.css';

				if (is_file(file)) {
					unlink(file);
				}
			}

			json['success'] = sprintf(this.language.get('text_cache'), this.language.get('text_sass'));
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}
}
