const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
module.exports = class ImageToolModel extends Model {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param filename
	 * @param    width
	 * @param    height
	 *
	 * @return string
	 * @throws \Exception
	 */
	async resize(filename, width, height) {
		if (!fs.existsSync(DIR_IMAGE + filename) || path.realpath(DIR_IMAGE + filename).substring(0, DIR_IMAGE.length) != DIR_IMAGE) {
			return '';
		}

		let extension = filename.split('.').pop();

		let image_old = filename;
		let image_new = 'cache/' + oc_substr(filename, 0, oc_strrpos(filename, '.')) + '-' + width + 'x' + height + '.' + extension;

		if (!fs.existsSync(DIR_IMAGE + image_new) || (fs.statSync(DIR_IMAGE + image_old).mtime > fs.statSync(DIR_IMAGE + image_new).mtime)) {
			const { width, height, format: image_type } = await sharp(DIR_IMAGE + image_old)
				.metadata();
			console.log(image_type)
			// if (!in_array(image_type, [IMAGETYPE_PNG, IMAGETYPE_JPEG, IMAGETYPE_GIF, IMAGETYPE_WEBP])) {
			// 	return HTTP_CATALOG + 'image/' + image_old;
			// }

			// path = '';

			// directories = explode('/', dirname(image_new));

			// for (directories of directory) {
			// 	if (!path) {
			// 		path = directory;
			// 	} else {
			// 		path = path + '/' + directory;
			// 	}

			// 	if (!is_dir(DIR_IMAGE + path)) {
			// 		@mkdir(DIR_IMAGE + path, 0777);
			// 	}
			// }

			// if (width_orig != width || height_orig != height) {
			// 	image = new \Opencart\System\Library\Image(DIR_IMAGE + image_old);
			// 	image.resize(width, height);
			// 	image.save(DIR_IMAGE + image_new);
			// } else {
			// 	copy(DIR_IMAGE + image_old, DIR_IMAGE + image_new);
			// }
		}

		return HTTP_CATALOG + 'image/' + image_new;
	}
}
