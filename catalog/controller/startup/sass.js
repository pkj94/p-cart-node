const sass = require('sass');

module.exports = class ControllerStartupSass extends Controller {
	async index() {
const data = {};
		const files = require('glob').sync(DIR_APPLICATION + 'view/theme/' + this.config.get('config_theme') + '/stylesheet/*.scss');

		if (files.length) {
			for (let file of files) {
				// Get the filename
				const filename = expressPath.basename(file, '.scss');

				const stylesheet = DIR_APPLICATION + 'view/theme/' + this.config.get('config_theme') + '/stylesheet/' + filename + '.css';

				if (!is_file(stylesheet) || !Number(this.config.get('developer_sass'))) {
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
