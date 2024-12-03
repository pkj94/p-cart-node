const sass = require('sass');

module.exports = class ControllerStartupSass {
	constructor(config) {
		this.config = config;
	}

	async index() {
const data = {};
		const DIR_APPLICATION = '/path/to/application'; // Adjust this to your actual path
		const files = require('glob').sync(`${DIR_APPLICATION}/view/stylesheet/*.scss`);

		if (files.length) {
			for (const file of files) {
				// Get the filename
				const filename = expressParh.basename(file, '.scss');

				const stylesheet = expressParh.join(DIR_APPLICATION, 'view/stylesheet', `${filename}.css`);

				if (!fs.existsSync(stylesheet) || !this.config.get('developer_sass')) {
					try {
						const result = sass.compile(file);

						fs.writeFileSync(stylesheet, result.css, { flag: 'w' });
					} catch (error) {
						console.error('Error compiling SCSS:', error);
					}
				}
			}
		}
	}

}
