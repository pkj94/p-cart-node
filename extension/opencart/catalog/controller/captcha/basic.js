const substr = require("locutus/php/strings/substr");
const { createCanvas } = require('canvas');
module.exports = class BasicController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {}
		await this.load.language('extension/opencart/captcha/basic');

		data['route'] = this.request.get['route'];

		this.session.data['captcha'] = substr(oc_token(100), Math.rand(0, 94), 6);

		return await this.load.view('extension/opencart/captcha/basic', data);
	}

	/**
	 * @return string
	 */
	async validate() {
		await this.load.language('extension/opencart/captcha/basic');

		if (!(this.session.data['captcha']) || !(this.request.post['captcha']) || (this.session.data['captcha'] != this.request.post['captcha'])) {
			return this.language.get('error_captcha');
		} else {
			return '';
		}
	}

	/**
	 * @return void
	 */
	async captcha() {
		const width = 150;
		const height = 35;

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');

		// Set up colors
		const black = '#000000';
		const white = '#FFFFFF';
		const red = 'rgba(255, 0, 0, 0.75)';
		const green = 'rgba(0, 255, 0, 0.75)';
		const blue = 'rgba(0, 0, 255, 0.75)';

		// Fill the background with white
		ctx.fillStyle = white;
		ctx.fillRect(0, 0, width, height);

		// Draw random colored ellipses
		ctx.fillStyle = red;
		ctx.beginPath();
		ctx.ellipse(Math.random() * width, Math.random() * height, 30, 30, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = green;
		ctx.beginPath();
		ctx.ellipse(Math.random() * width, Math.random() * height, 30, 30, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = blue;
		ctx.beginPath();
		ctx.ellipse(Math.random() * width, Math.random() * height, 30, 30, 0, 0, Math.PI * 2);
		ctx.fill();

		// Add the black border
		ctx.strokeStyle = black;
		ctx.lineWidth = 2;
		ctx.strokeRect(0, 0, width, height);

		// Draw the captcha text
		ctx.fillStyle = black;
		ctx.font = '20px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(session.captcha, width / 2, height / 2);
		this.response.addHeader('Content-Type: image/jpeg');
		this.response.addHeader('Cache-Control: no-cache');
		this.response.setOuput(canvas.toBuffer('image/jpeg'));
	}
}
