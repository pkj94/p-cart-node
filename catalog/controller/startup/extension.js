const str_replace = require("locutus/php/strings/str_replace");
const ucwords = require("locutus/php/strings/ucwords");
const fs = require('fs');

module.exports = class ExtensionController extends Controller {
	/**
	 * @return void
	 */
	async index() {

		// Add extension paths from the DB
		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getExtensions();

		for (let result of results) {

			// Register controllers, models and system extension folders
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/controller/`))
				fs.readdirSync(`${DIR_EXTENSION}${result.code}/admin/controller/`).forEach((folder) => {
					fs.readdirSync(`${DIR_EXTENSION}${result.code}/admin/controller/${folder}`).forEach((controller) => {
						if (controller.indexOf('.html') == -1) {
							let name = ucfirst(controller).replace('.js', '') + ucfirst(folder) + 'Controller';
							global[name] = require(DIR_EXTENSION + result.code + '/admin/controller/' + folder + '/' + controller);
						}
					})
				});

			// this.autoloader.register(`Opencart\Admin\Controller\Extension\\${extension}`, `${DIR_EXTENSION}${result.code}/admin/controller/`);
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/model/`))
				fs.readdirSync(`${DIR_EXTENSION}${result.code}/admin/model/`).forEach((folder) => {
					fs.readdirSync(`${DIR_EXTENSION}${result.code}/admin/model/${folder}`).forEach((model) => {
						let name = ucfirst(model).replace('.js', '') + ucfirst(folder) + 'Model';
						global[name] = require(DIR_EXTENSION + result.code + '/admin/model/' + folder + '/' + model)
					})
				});
			// this.autoloader.register(`Opencart\Admin\Model\Extension\\${extension}`, `${DIR_EXTENSION}${result.code}/admin/model/`);
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/system/library/`))
				fs.readdirSync(`${DIR_EXTENSION}${result.code}/system/library/`).forEach((library) => {
					let name = ucfirst(library).replace('.js', '') + 'Library';
					global[name] = require(DIR_EXTENSION + result.code + '/system/library/' + '/' + library);
				});
			// this.autoloader.register(`Opencart\System\Library\Extension\\${extension}`, `${DIR_EXTENSION}${result.code}/system/library/`);

			// Template directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/view/template/`))
				this.template.addPath(`extension/${result.code}`, `${DIR_EXTENSION}${result.code}/admin/view/template/`);

			// Language directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/language/`))
				this.language.addPath(`extension/${result.code}`, `${DIR_EXTENSION}${result.code}/admin/language/`);

			// Config directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/system/config/`))
				this.config.addPath(`extension/${result.code}`, `${DIR_EXTENSION}${result.code}/system/config/`);
		}
	}
}