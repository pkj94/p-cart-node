module.exports = class ControllerEventLanguage extends Controller {
	async index(route, args, template_code = '') {
		for (let [key, value] of Object.entries(this.language.all())) {
			if (typeof (args[key]) == 'undefined') {
				args[key] = value;
			}
		}
	}

	// 1. Before controller load store all current loaded language data
	async before(route, output) {
		this.language.set('backup', this.language.all());
	}

	// 2. After contoller load restore old language data
	async after(route, args, output) {
		let data = this.language.get('backup');

		if (typeof data == 'object') {
			for (let [key, value] of Object.entries(data)) {
				this.language.set(key, value);
			}
		}
	}
}
