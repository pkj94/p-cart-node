
const sass = require('sass');

module.exports = class SassController extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		const files = fs.readdirSync(expressPath.join(DIR_APPLICATION, 'view/stylesheet')).filter(file => file.endsWith('.scss'));

		for (const file of files) {
			const filename = expressPath.basename(file, '.scss');
			const stylesheet = expressPath.join(DIR_APPLICATION, 'view/stylesheet', `${filename}.css`);

			if (!fs.existsSync(stylesheet) || !this.config.get('developer_sass')) {
				const result = sass.compile(expressPath.join(DIR_APPLICATION, 'view/stylesheet', `${filename}.scss`));

				fs.writeFileSync(stylesheet, result.css);
			}
		}
	}
}

