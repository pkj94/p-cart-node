
module.exports = class ExtensionController extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}

	async index() {
		// Add extension paths from the DB
		this.load.model('setting/extension', this);
		const results = await this.model_setting_extension.getInstalls();

		results.forEach(async result => {
			const extension = result.code.replace(/[_/]/g, '').replace(/(?:^|\s)\S/g, a => a.toUpperCase());

			// Register controllers, models and system extension folders
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/controller/`))
				await this.autoloader.register(`Opencart\Admin\Controller\Extension${extension}`, `${DIR_EXTENSION}${result.code}/admin/controller/`);
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/model/`))
				await this.autoloader.register(`Opencart\Admin\Model\Extension${extension}`, `${DIR_EXTENSION}${result.code}/admin/model/`);
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/system/library/`))
				await this.autoloader.register(`Opencart\System\Library\Extension${extension}`, `${DIR_EXTENSION}${result.code}/system/library/`);

			// Template directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/view/template/`))
				this.template.addPath(`extension/${result.code}`, `${DIR_EXTENSION}${result.code}/admin/view/template/`);

			// Language directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/admin/language/`))
				this.language.addPath(`extension/${result.code}`, `${DIR_EXTENSION}${result.code}/admin/language/`);

			// Config directory
			if (fs.existsSync(`${DIR_EXTENSION}${result.code}/system/config/`))
				this.config.addPath(`extension/${result.code}`, `${DIR_EXTENSION}${result.code}/system/config/`);
		});
	}
}

