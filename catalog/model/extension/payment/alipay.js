const ksort = require("locutus/php/array/ksort");
const trim = require("locutus/php/strings/trim");

module.exports = class ModelExtensionPaymentAlipay extends Model {
	apiMethodName = "alipay.trade.page.pay";
	postCharset = "UTF-8";
	alipaySdkVersion = "alipay-sdk-php-20161101";
	apiVersion = "1.0";
	logFileName = "alipay.log";
	gateway_url = "https://openapi.alipay.com/gateway.do";
	format = "json";
	signtype = "RSA2";

	apiParas = {};

	async getMethod(address, total) {
		await this.load.language('extension/payment/alipay');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_alipay_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (this.config.get('payment_alipay_total') > 0 && this.config.get('payment_alipay_total') > total) {
			status = false;
		} else if (!this.config.get('payment_alipay_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code': 'alipay',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_alipay_sort_order')
			};
		}

		return method_data;
	}

	async setParams(alipay_config) {
		this.gateway_url = alipay_config['gateway_url'];
		this.appid = alipay_config['app_id'];
		this.private_key = alipay_config['merchant_private_key'];
		this.alipay_public_key = alipay_config['alipay_public_key'];
		this.postCharset = alipay_config['charset'];
		this.signtype = alipay_config['sign_type'];
		this.notifyUrl = alipay_config['notify_url'];
		this.returnUrl = alipay_config['return_url'];

		if (!(this.appid) || trim(this.appid) == "") {
			throw new Exception("appid should not be NULL!");
		}
		if (!(this.private_key) || trim(this.private_key) == "") {
			throw new Exception("private_key should not be NULL!");
		}
		if (!(this.alipay_public_key) || trim(this.alipay_public_key) == "") {
			throw new Exception("alipay_public_key should not be NULL!");
		}
		if (!(this.postCharset) || trim(this.postCharset) == "") {
			throw new Exception("charset should not be NULL!");
		}
		if (!(this.gateway_url) || trim(this.gateway_url) == "") {
			throw new Exception("gateway_url should not be NULL!");
		}
	}

	async pagePay(builder, config) {
		this.setParams(config);
		let biz_content = null;
		if ((builder)) {
			biz_content = JSON.stringify(builder);
		}

		const log = new Log(this.logFileName);
		await log.write(biz_content);

		this.apiParas["biz_content"] = biz_content;

		const response = this.pageExecute(this, "post");
		log = new Log(this.logFileName);
		log.write("response: ".var_export(response, true));

		return response;
	}

	async check(arr, config) {
		this.setParams(config);

		const result = await this.rsaCheckV1(arr, this.signtype);

		return result;
	}

	async pageExecute(request, httpmethod = "POST") {
		let iv = this.apiVersion;
		const sysParams = {};
		sysParams["app_id"] = this.appid;
		sysParams["version"] = iv;
		sysParams["format"] = this.format;
		sysParams["sign_type"] = this.signtype;
		sysParams["method"] = this.apiMethodName;
		sysParams["timestamp"] = date("Y-m-d H:i:s");
		sysParams["alipay_sdk"] = this.alipaySdkVersion;
		sysParams["notify_url"] = this.notifyUrl;
		sysParams["return_url"] = this.returnUrl;
		sysParams["charset"] = this.postCharset;
		sysParams["gateway_url"] = this.gateway_url;

		const apiParams = this.apiParas;

		const totalParams = { ...apiParams, ...sysParams };

		totalParams["sign"] = await this.generateSign(totalParams, this.signtype);

		if ("GET" == httpmethod.toUpperCase()) {
			//			preString=this.getSignContentUrlencode(totalParams);
			const preString = await this.getSignContent(encodeURIComponent(totalParams));
			const requestUrl = this.gateway_url + "?" + preString;

			return requestUrl;
		} else {
			for (let [key, value] of Object.entries(totalParams)) {
				if (false === this.checkEmpty(value)) {
					value = value.replaceAll("\"", "&quot;");
					totalParams[key] = value;
				} else {
					delete totalParams[key];
				}
			}
			return totalParams;
		}
	}

	checkEmpty(value) {
		if (!(value))
			return true;
		if (value === null)
			return true;
		if (trim(value) === "")
			return true;

		return false;
	}

	async rsaCheckV1(params, signType = 'RSA') {
		sign = params['sign'];
		params['sign_type'] = null;
		params['sign'] = null;
		return await this.verify(await this.getSignContent(params), sign, signType);
	}

	async verify(data, sign, signType = 'RSA') {
		const pubKey = this.alipay_public_key;
		const formattedPubKey = `-----BEGIN PUBLIC KEY-----\n${pubKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
		if (!pubKey.trim()) {
			throw new Error('Alipay public key error!');
		}
		const verify = require('crypto').createVerify(signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1');
		verify.update(data);
		verify.end();
		return verify.verify(formattedPubKey, Buffer.from(sign, 'base64'));
	}

	async getSignContent(params) {
		params = ksort(params);

		let stringToBeSigned = "";
		let i = 0;
		for (let [k, v] of Object.entries(params)) {
			if (false === this.checkEmpty(v) && "@" != v.substr(0, 1)) {
				if (i == 0) {
					stringToBeSigned += "k" + "=" + "v";
				} else {
					stringToBeSigned += "&" + "k" + "=" + "v";
				}
				i++;
			}
		}

		// unset(k, v);
		return stringToBeSigned;
	}

	async generateSign(params, signType = "RSA") {
		return await this.sign(this.getSignContent(params), signType);
	}

	async sign(data, signType = "RSA") {
		const priKey = this.private_key;
		const formattedPriKey = `-----BEGIN RSA PRIVATE KEY-----\n${priKey.match(/.{1,64}/g).join('\n')}\n-----END RSA PRIVATE KEY-----`;
		const sign = require('crypto').createSign(signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1');
		sign.update(data);
		sign.end();
		const signature = sign.sign(formattedPriKey, 'base64');
		return signature;
	}

	async getPostCharset() {
		return this.postCharset.trim();
	}
}
