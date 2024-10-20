const fs = require('fs');
const expressPath = require('path');
const sass = require('sass');
module.exports = class SassController extends Controller {
	/**
	 * @return void
	 * @throws \ScssPhp\ScssPhp\Exception\SassException
	 */
	async index() {
		let files = require('glob').sync(DIR_APPLICATION + 'view/stylesheet/*.scss');
		if (files.length) {
			for (let file of files) {
				// Get the filename
				let filename = expressPath.basename(file, '.scss');

				let stylesheet = DIR_APPLICATION + 'view/stylesheet/' + filename + '.css';
				if (!fs.existsSync(stylesheet) || !this.config.get('developer_sass')) {
					const result = await sass.compileAsync(`${file}`);
					fs.writeFileSync(stylesheet, result.css);
				}
			}
		}
		return true;
	}
}
