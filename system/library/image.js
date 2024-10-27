
const sharp = require('sharp');

module.exports = class Image {
    constructor(file) {
        if (!fs.existsSync(file)) {
            throw new Error(`Error: Could not load image ${file}!`);
        }
        this.file = file;

        this.image = sharp(file);

    }
    async load() {
        let info = await this.image.metadata()
        this.width = info.width;
        this.height = info.height;
        this.mime = info.format;
    }
    async save(file, quality = 90) {
        await this.image.toFile(file, { quality });
        // console.log('The file was created.');
    }

    async resize(width, height, defaultScale = '') {
        let scale = 1;
        const scaleW = width / this.width;
        const scaleH = height / this.height;

        if (defaultScale === 'w') {
            scale = scaleW;
        } else if (defaultScale === 'h') {
            scale = scaleH;
        } else {
            scale = Math.min(scaleW, scaleH);
        }

        const newWidth = Math.round(this.width * scale);
        const newHeight = Math.round(this.height * scale);
        const xpos = Math.round((width - newWidth) / 2);
        const ypos = Math.round((height - newHeight) / 2);

        this.image = this.image.resize(newWidth, newHeight).extend({
            top: ypos,
            bottom: height - newHeight - ypos,
            left: xpos,
            right: width - newWidth - xpos,
            background: { r: 255, g: 255, b: 255, alpha: 127 }
        });
    }

    async watermark(watermarkFile, position = 'bottomright') {
        const watermark = sharp(watermarkFile);
        const watermarkMetadata = await watermark.metadata();

        const positions = {
            'topleft': { left: 0, top: 0 },
            'topcenter': { left: Math.floor((this.width - watermarkMetadata.width) / 2), top: 0 },
            'topright': { left: this.width - watermarkMetadata.width, top: 0 },
            'middleleft': { left: 0, top: Math.floor((this.height - watermarkMetadata.height) / 2) },
            'middlecenter': { left: Math.floor((this.width - watermarkMetadata.width) / 2), top: Math.floor((this.height - watermarkMetadata.height) / 2) },
            'middleright': { left: this.width - watermarkMetadata.width, top: Math.floor((this.height - watermarkMetadata.height) / 2) },
            'bottomleft': { left: 0, top: this.height - watermarkMetadata.height },
            'bottomcenter': { left: Math.floor((this.width - watermarkMetadata.width) / 2), top: this.height - watermarkMetadata.height },
            'bottomright': { left: this.width - watermarkMetadata.width, top: this.height - watermarkMetadata.height },
        };

        const { left, top } = positions[position];

        this.image = this.image.composite([{ input: await watermark.toBuffer(), blend: 'over', left, top }]);
    }

    async crop(topX, topY, bottomX, bottomY) {
        this.image = this.image.extract({ left: topX, top: topY, width: bottomX - topX, height: bottomY - topY });
    }

    async rotate(degree, color = 'FFFFFF') {
        const rgb = this.html2rgb(color);
        this.image = this.image.rotate(degree, { background: { r: rgb[0], g: rgb[1], b: rgb[2] } });
    }

    async text(text, x = 0, y = 0, size = 5, color = '000000') {
        // For adding text, you might need to use third-party libraries as sharp does not support text drawing.
        // Alternatively, you can pre-create an image with text and use sharp to composite it.
    }

    async merge(mergeFile, x = 0, y = 0, opacity = 100) {
        const merge = sharp(mergeFile);
        this.image = this.image.composite([{ input: await merge.toBuffer(), blend: 'over', left: x, top: y, opacity: opacity / 100 }]);
    }

    html2rgb(color) {
        if (color.startsWith('#')) {
            color = color.slice(1);
        }
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        return [
            parseInt(color.slice(0, 2), 16),
            parseInt(color.slice(2, 4), 16),
            parseInt(color.slice(4, 6), 16),
        ];
    }
}