module.exports = class Language extends global['\Opencart\System\Engine\Controller'] {
	index(route, args) {
		const allLanguages = this.language.all();
		for (const [key, value] of Object.entries(allLanguages)) {
			if (!args[key]) {
				args[key] = value;
			}
		}
	}

	before(route, args) {
		const data = this.language.all();
		if (data) {
			this.language.set('backup', JSON.stringify(data));
		}
	}

	after(route, args, output) {
		const data = JSON.parse(this.language.get('backup'));
		if (typeof data == 'object') {
			this.language.clear();
			for (const [key, value] of Object.entries(data)) {
				this.language.set(key, value);
			}
		}
	}
}