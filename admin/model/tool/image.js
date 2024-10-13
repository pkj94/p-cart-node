const fs = require('fs');
const sharp = require('sharp');
const ico = require("sharp-ico");
const expressPath = require('path');
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
	async resize(filename, width_new, height_new) {
		if (!fs.existsSync(DIR_IMAGE + filename) || fs.realpathSync(DIR_IMAGE + filename).substring(0, DIR_IMAGE.length).replaceAll('\\', '/') != DIR_IMAGE) {
			return '';
		}

		let extension = filename.split('.').pop();

		let image_old = filename;
		let image_new = 'cache/' + oc_substr(filename, 0, oc_strrpos(filename, '.')) + '-' + width_new + 'x' + height_new + '.' + extension;

		if (!fs.existsSync(DIR_IMAGE + image_new) || (fs.statSync(DIR_IMAGE + image_old).mtime > fs.statSync(DIR_IMAGE + image_new).mtime)) {
			let width = 0, height = 0, image_type = '';
			if (image_old.indexOf('.ico') >= 0) {
				const image = await ico.sharpsFromIco(DIR_IMAGE + image_old).forEach(async (icon, index) => {
					const metadata = await icon.metadata();
					width = metadata.width;
					height = metadata.height;
					image_type = metadata.format;
				})

			} else {
				const image = await sharp(DIR_IMAGE + image_old).metadata();
				width = image.width;
				height = image.height;
				image_type = image.format;
			}
			console.log(image_type)
			if (!['png', 'jpeg', 'gif', 'webp', 'jpg'].includes(image_type)) {
				return HTTP_CATALOG + 'image/' + image_old;
			}

			let path = '';

			let directories = expressPath.dirname(image_new).split('/');

			for (let directory of directories) {
				if (!path) {
					path = directory;
				} else {
					path = path + '/' + directory;
				}

				if (!fs.existsSync(DIR_IMAGE + path)) {
					fs.mkdirSync(DIR_IMAGE + path);
				}
			}

			if (width != width_new || height != height_new) {
				let image = new ImageLibrary(DIR_IMAGE + image_old);
				await image.load();
				await image.resize(width_new, height_new);
				await image.save(DIR_IMAGE + image_new);
			} else {
				fs.copyFileSync(DIR_IMAGE + image_old, DIR_IMAGE + image_new);
			}
		}

		return HTTP_CATALOG + 'image/' + image_new;
	}
}
