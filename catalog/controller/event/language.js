module.exports = class Language extends global['\Opencart\System\Engine\Controller'] {
	async index(route, args) {
		for (let [key, value] of Object.entries(this.language.all())) {
			if (!(args[key])) {
				args[key] = value;
			}
		}
	}

	// controller/*/before
	// 1+ Before controller load store all current loaded language data
	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 */
	async before(route, args) {
		let data = this.language.all();
		if (data) {
			this.language.set('backup', data);
		}
	}

	// controller/*/after
	// 2+ After controller load restore old language data
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async after(route, args, output) {
		let data = this.language.get('backup');

		if (Array.isArray(data)) {
			this.language.clear();

			for (let [key, value] of Object.keys(data)) {
				this.language.set(key, value);
			}
		}
	}
}