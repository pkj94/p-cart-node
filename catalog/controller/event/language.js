module.exports = class ControllerEventLanguage extends Controller {
	async index(route, args, template_code = '') {
		const allLanguages = this.language.all();
		for (const [key, value] of Object.entries(allLanguages)) {
			if (!args[key]) {
				args[key] = value;
			}
		}
	}

	// 1. Before controller load store all current loaded language data
	async before(route, output) {
		const data = this.language.all();
		if (data) {
			this.language.set('backup', JSON.stringify(data));
		}
	}

	// 2. After contoller load restore old language data
	async after(route, args, output) {
		let data = {};
		try {
			data = this.language.get('backup') ? JSON.parse(this.language.get('backup')) : {};
		} catch (e) {
			data = {};
		}
		if (typeof data == 'object') {
			for (const [key, value] of Object.entries(data)) {
				this.language.set(key, value);
			}
		}
	}
}
