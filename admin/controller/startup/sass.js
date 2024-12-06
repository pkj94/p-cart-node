const sass = require('sass');

module.exports = class ControllerStartupSass extends Controller {

	async index() {
		const files = require('glob').sync(`${DIR_APPLICATION}/view/stylesheet/*.scss`);

		if (files.length) {
			for (const file of files) {
				// Get the filename
				const filename = expressPath.basename(file, '.scss');

				const stylesheet = expressPath.join(DIR_APPLICATION, 'view/stylesheet', `${filename}.css`);
				if (!fs.existsSync(stylesheet) || !Number(this.config.get('developer_sass'))) {
					try {
						const result = sass.compile(file, { verbose: true });

						fs.writeFileSync(stylesheet, result.css, { flag: 'w' });
					} catch (error) {
						console.error('Error compiling SCSS:', error);
					}
				}
			}
		}
	}

}
