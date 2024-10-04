const fs = require('fs');
const path = require('path');
const sass = require('sass');

module.exports = class SassController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		const files = fs.readdirSync(path.join(DIR_APPLICATION, 'view/stylesheet')).filter(file => file.endsWith('.scss'));

		for (const file of files) {
			const filename = path.basename(file, '.scss');
			const stylesheet = path.join(DIR_APPLICATION, 'view/stylesheet', `${filename}.css`);

			if (!fs.existsSync(stylesheet) || !this.config.get('developer_sass')) {
				const result = sass.compile(path.join(DIR_APPLICATION, 'view/stylesheet', `${filename}.scss`));

				fs.writeFileSync(stylesheet, result.css);
			}
		}
	}
}

