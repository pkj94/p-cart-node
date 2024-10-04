const Jimp = require('jimp');

module.exports =class ImageLibrary {
    /**
     * Constructor
     * @param {string} file - The image file path
     */
    constructor(file) {
        this.file = file;
        this.image = null;
    }

    /**
     * Load the image
     */
    async load() {
        try {
            this.image = await Jimp.read(this.file);
            this.width = this.image.bitmap.width;
            this.height = this.image.bitmap.height;
            this.mime = this.image.getMIME();
        } catch (err) {
            throw new Error(`Error: Could not load image ${this.file}!`);
        }
    }

    /**
     * Save the image to a file
     * @param {string} file - The destination file path
     * @param {number} quality - JPEG quality (1-100)
     */
    async save(file, quality = 90) {
        if (this.mime === Jimp.MIME_JPEG) {
            await this.image.quality(quality).writeAsync(file);
        } else {
            await this.image.writeAsync(file);
        }
    }

    /**
     * Resize the image
     * @param {number} width - The target width
     * @param {number} height - The target height
     * @param {string} defaultOption - Default aspect ratio handling ('w' or 'h')
     */
    async resize(width = 0, height = 0, defaultOption = '') {
        if (!this.width || !this.height) return;

        let scale;
        const scaleW = width / this.width;
        const scaleH = height / this.height;

        if (defaultOption === 'w') {
            scale = scaleW;
        } else if (defaultOption === 'h') {
            scale = scaleH;
        } else {
            scale = Math.min(scaleW, scaleH);
        }

        await this.image.scale(scale);
    }

    /**
     * Apply a watermark
     * @param {Image} watermark - The watermark image
     * @param {string} position - Position of the watermark ('bottomright', 'topleft', etc.)
     */
    async watermark(watermark, position = 'bottomright') {
        let xpos, ypos;

        switch (position) {
            case 'topleft':
                xpos = 0;
                ypos = 0;
                break;
            case 'topcenter':
                xpos = (this.width - watermark.width) / 2;
                ypos = 0;
                break;
            case 'topright':
                xpos = this.width - watermark.width;
                ypos = 0;
                break;
            case 'middleleft':
                xpos = 0;
                ypos = (this.height - watermark.height) / 2;
                break;
            case 'middlecenter':
                xpos = (this.width - watermark.width) / 2;
                ypos = (this.height - watermark.height) / 2;
                break;
            case 'middleright':
                xpos = this.width - watermark.width;
                ypos = (this.height - watermark.height) / 2;
                break;
            case 'bottomleft':
                xpos = 0;
                ypos = this.height - watermark.height;
                break;
            case 'bottomcenter':
                xpos = (this.width - watermark.width) / 2;
                ypos = this.height - watermark.height;
                break;
            case 'bottomright':
                xpos = this.width - watermark.width;
                ypos = this.height - watermark.height;
                break;
        }

        this.image.composite(watermark.image, xpos, ypos, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1,
        });
    }

    /**
     * Crop the image
     * @param {number} topX - Top-left x-coordinate
     * @param {number} topY - Top-left y-coordinate
     * @param {number} bottomX - Bottom-right x-coordinate
     * @param {number} bottomY - Bottom-right y-coordinate
     */
    async crop(topX, topY, bottomX, bottomY) {
        await this.image.crop(topX, topY, bottomX - topX, bottomY - topY);
    }

    /**
     * Rotate the image
     * @param {number} degree - The degree to rotate the image
     * @param {string} color - Background color in hex format (e.g., 'FFFFFF')
     */
    async rotate(degree, color = 'FFFFFF') {
        const hexColor = Jimp.cssColorToHex(`#${color}`);
        await this.image.rotate(degree, hexColor);
    }

    /**
     * Add text to the image
     * @param {string} text - The text to add
     * @param {number} x - x-coordinate
     * @param {number} y - y-coordinate
     * @param {number} size - Font size
     * @param {string} color - Text color in hex format
     */
    async text(text, x = 0, y = 0, size = 32, color = '000000') {
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        await this.image.print(font, x, y, {
            text: text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP,
        }, this.width, this.height);
    }

    /**
     * Merge another image
     * @param {Image} mergeImage - The image to merge
     * @param {number} x - x-coordinate
     * @param {number} y - y-coordinate
     * @param {number} opacity - Opacity of the merged image (0-100)
     */
    async merge(mergeImage, x = 0, y = 0, opacity = 100) {
        this.image.composite(mergeImage.image, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: opacity / 100,
            opacityDest: 1,
        });
    }

    /**
     * Helper to convert HTML color code to RGB
     * @param {string} color - The color in HTML format
     * @return {Array} - Array of RGB values
     */
    html2rgb(color) {
        return Jimp.cssColorToHex(color);
    }
}

