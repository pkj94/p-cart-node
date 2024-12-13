const ksort = require("locutus/php/array/ksort");
const reset = require("locutus/php/array/reset");
const rtrim = require("locutus/php/strings/rtrim");

module.exports = class ModelExtensionPaymentAlipayCross extends Model {
	https_verify_url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&';
	https_verify_url_test = 'https://openapi.alipaydev.com/gateway.do?service=notify_verify&';
	alipay_config;

	async getMethod(address, total) {
		await this.load.language('extension/payment/alipay_cross');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_alipay_cross_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (this.config.get('payment_alipay_cross_total') > 0 && this.config.get('payment_alipay_cross_total') > total) {
			status = false;
		} else if (!this.config.get('payment_alipay_cross_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code': 'alipay_cross',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_alipay_cross_sort_order')
			};
		}

		return method_data;
	}

	async buildRequestMysign(para_sort) {
		const prestr = await this.createLinkstring(para_sort);

		let mysign = "";
		switch (this.alipay_config['sign_type'].trim().toUpperCase()) {
			case "MD5":
				mysign = await this.md5Sign(prestr, this.alipay_config['key']);
				break;
			default:
				mysign = "";
		}

		return mysign;
	}


	async buildRequestPara(alipay_config, para_temp) {
		this.alipay_config = alipay_config;

		const para_filter = await this.paraFilter(para_temp);

		const para_sort = await this.argSort(para_filter);

		const mysign = await this.buildRequestMysign(para_sort);

		para_sort['sign'] = mysign;
		para_sort['sign_type'] = this.alipay_config['sign_type'].trim().toUpperCase();

		return para_sort;
	}

	async verifyNotify(alipay_config) {
		this.alipay_config = alipay_config;

		if ((this.request.server.method != 'POST')) {
			return false;
		}
		else {
			const isSign = awaitthis.getSignVeryfy(this.request.post, this.request.post["sign"]);

			let responseTxt = 'false';
			if ((this.request.post["notify_id"])) {
				responseTxt = await this.getResponse(this.request.post["notify_id"]);
			}

			//Veryfy
			if (/true$/i.test(responseTxt) && isSign) {
				return true;
			} else {
				await this.log.write(responseTxt);
				return false;
			}
		}
	}

	async getSignVeryfy(para_temp, sign) {
		const para_filter = await this.paraFilter(para_temp);

		const para_sort = await this.argSort(para_filter);

		const prestr = await this.createLinkstring(para_sort);

		switch (this.alipay_config['sign_type'].trim().toUpperCase()) {
			case "MD5":
				isSgin = await this.md5Verify(prestr, sign, this.alipay_config['key']);
				break;
			default:
				isSgin = false;
		}

		return isSgin;
	}

	async getResponse(notify_id) {
		const partner = this.alipay_config['partner'].trim();
		let veryfy_url = this.config.get('payment_alipay_cross_test') == "sandbox" ? this.https_verify_url_test : this.https_verify_url;
		veryfy_url += "partner=" + partner + "&notify_id=" + notify_id;
		const responseTxt = await this.getHttpResponseGET(veryfy_url, this.alipay_config['cacert']);

		return responseTxt;
	}

	async createLinkstring(para) {
		let arg = "";
		for (let [key, val] of Object.entries(para)) {
			arg += key + "=" + val + "&";
		}

		// Remove the last char '&'
		return rtrim(arg, '&');
	}

	async paraFilter(para) {
		const para_filter = {};
		for (let [key, val] of Object.entries(para)) {
			if (key == "sign" || key == "sign_type" || val == "") {
				continue;
			} else {
				para_filter[key] = para[key];
			}
		}

		return para_filter;
	}

	async argSort(para) {
		ksort(para);
		reset(para);
		return para;
	}

	async getHttpResponseGET(url, cacertUrl) {
		try {
			const agent = new require('https').Agent({
				ca: fs.readFileSync(cacertUrl),
				rejectUnauthorized: true // Equivalent to CURLOPT_SSL_VERIFYPEER = true
			});

			const response = await require('axios').get(url, {
				headers: { 'User-Agent': 'Mozilla/5.0' }, // Add your user agent here if necessary
				httpsAgent: agent,
				timeout: 30000 // Optional timeout
			});

			this.log("SUCCESS", response.data);
			return response.data;
		} catch (error) {
			this.log("ALIPAY NOTIFY CURL_ERROR", error.message);
			return null;
		}
	}


	async md5Sign(prestr, key) {
		prestr = prestr + key;
		return md5(prestr);
	}

	async md5Verify(prestr, sign, key) {
		prestr = prestr + key;
		const mysgin = md5(prestr);

		if (mysgin == sign) {
			return true;
		} else {
			return false;
		}
	}
}

