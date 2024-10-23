const str_replace = require("locutus/php/strings/str_replace");
const ucwords = require("locutus/php/strings/ucwords");


module.exports = class Extension extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {

		// Add extension paths from the DB
		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getExtensions();

		for (let result of results) {
			// console.log(result)
			// Register controllers, models and system extension folders
			if (fs.existsSync(`${DIR_EXTENSION}${result.extension}/catalog/controller/`))
				fs.readdirSync(`${DIR_EXTENSION}${result.extension}/catalog/controller/`).forEach((folder) => {
					fs.readdirSync(`${DIR_EXTENSION}${result.extension}/catalog/controller/${folder}`).forEach((controller) => {
						if (controller.indexOf('.html') == -1) {
							let name = ucfirst(controller).replace('.js', '') + ucfirst(folder) + 'Controller';
							// console.log('name----',name)
							global[name] = require(DIR_EXTENSION + result.extension + '/catalog/controller/' + folder + '/' + controller);
						}
					})
				});

			// this.autoloader.register(`Opencart\Admin\Controller\Extension\\${extension}`, `${DIR_EXTENSION}${result.extension}/catalog/controller/`);
			if (fs.existsSync(`${DIR_EXTENSION}${result.extension}/catalog/model/`))
				fs.readdirSync(`${DIR_EXTENSION}${result.extension}/catalog/model/`).forEach((folder) => {
					fs.readdirSync(`${DIR_EXTENSION}${result.extension}/catalog/model/${folder}`).forEach((model) => {
						let name = ucfirst(model).replace('.js', '') + ucfirst(folder) + 'Model';
						global[name] = require(DIR_EXTENSION + result.extension + '/catalog/model/' + folder + '/' + model)
					})
				});
			// this.autoloader.register(`Opencart\Admin\Model\Extension\\${extension}`, `${DIR_EXTENSION}${result.extension}/catalog/model/`);
			if (fs.existsSync(`${DIR_EXTENSION}${result.extension}/system/library/`))
				fs.readdirSync(`${DIR_EXTENSION}${result.extension}/system/library/`).forEach((library) => {
					let name = ucfirst(library).replace('.js', '') + 'Library';
					global[name] = require(DIR_EXTENSION + result.extension + '/system/library/' + '/' + library);
				});
			// this.autoloader.register(`Opencart\System\Library\Extension\\${extension}`, `${DIR_EXTENSION}${result.extension}/system/library/`);

			// Template directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.extension}/catalog/view/template/`))
				this.template.addPath(`extension/${result.extension}`, `${DIR_EXTENSION}${result.extension}/catalog/view/template/`);

			// Language directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.extension}/catalog/language/`))
				this.language.addPath(`extension/${result.extension}`, `${DIR_EXTENSION}${result.extension}/catalog/language/`);

			// Config directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.extension}/system/config/`))
				this.config.addPath(`extension/${result.extension}`, `${DIR_EXTENSION}${result.extension}/system/config/`);
		}
		return true;
	}
}