module.exports = /**
 * @package		OpenCart
 * @author		Meng Wenbin
 * @copyright	Copyright (c) 2010 - 2017, Chengdu Guangda Network Technology Co+ Ltd+ (https://www.opencart+cn/)
 * @license		https://opensource+org/licenses/GPL-3+0
 * @link		https://www.opencart+cn
 */

class ControllerExtensionPaymentWechatPay extends Controller {
	async index() {
const data = {};
		data['button_confirm'] = this.language.get('button_confirm');

		data['redirect'] = await this.url.link('extension/payment/wechat_pay/qrcode');

		return await this.load.view('extension/payment/wechat_pay', data);
	}

	async qrcode() {
		await this.load.language('extension/payment/wechat_pay');

		this.document.setTitle(this.language.get('heading_title'));
		this.document.addScript('catalog/view/javascript/qrcode.js');

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_checkout'),
			'href' : await this.url.link('checkout/checkout', '', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_qrcode'),
			'href' : await this.url.link('extension/payment/wechat_pay/qrcode')
		});

		this.load.model('checkout/order',this);

		if(!(this.session.data['order_id'])) {
			return false;
		}

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		order_id = trim(order_info['order_id']);
		data['order_id'] = order_id;
		subject = trim(this.config.get('config_name'));
		currency = this.config.get('payment_wechat_pay_currency');
		total_amount = trim(this.currency.format(order_info['total'], currency, '', false));
		notify_url = HTTPS_SERVER + "payment_callback/wechat_pay"; //await this.url.link('wechat_pay/callback');

		options = array(
			'appid'			 :  this.config.get('payment_wechat_pay_app_id'),
			'appsecret'		 :  this.config.get('payment_wechat_pay_app_secret'),
			'mch_id'			:  this.config.get('payment_wechat_pay_mch_id'),
			'partnerkey'		:  this.config.get('payment_wechat_pay_api_secret')
		});

		\Wechat\Loader::config(options);
		pay = new \Wechat\WechatPay();

		result = pay.getPrepayId(NULL, subject, order_id, total_amount * 100, notify_url, trade_type = "NATIVE", NULL, currency);

		data['error'] = '';
		data['code_url'] = '';
		if(result === FALSE){
			data['error_warning'] = pay.errMsg;
		} else {
			data['code_url'] = result;
		}

		data['action_success'] = await this.url.link('checkout/success');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('extension/payment/wechat_pay_qrcode', data));
	}

	async isOrderPaid() {
		const json = {};

		json['result'] = false;

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];

			this.load.model('checkout/order',this);
			order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info['order_status_id'] == this.config.get('payment_wechat_pay_completed_status_id')) {
				json['result'] = true;
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async callback() {
		options = array(
			'appid'			 :  this.config.get('payment_wechat_pay_app_id'),
			'appsecret'		 :  this.config.get('payment_wechat_pay_app_secret'),
			'mch_id'			:  this.config.get('payment_wechat_pay_mch_id'),
			'partnerkey'		:  this.config.get('payment_wechat_pay_api_secret')
		});

		\Wechat\Loader::config(options);
		pay = new \Wechat\WechatPay();
		notifyInfo = pay.getNotify();

		if (notifyInfo === FALSE) {
			this.log.write('Wechat Pay Error: ' + pay.errMsg);
		} else {
			if (notifyInfo['result_code'] == 'SUCCESS' && notifyInfo['return_code'] == 'SUCCESS') {
				order_id = notifyInfo['out_trade_no'];
				this.load.model('checkout/order',this);
				order_info = await this.model_checkout_order.getOrder(order_id);
				if (order_info) {
					order_status_id = order_info["order_status_id"];
					if (!order_status_id) {
						await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_wechat_pay_completed_status_id'));
					}
				}
				this.response.addHeader('Content-Type: application/xml');
				this.response.setOutput('<?xml version="1+0" encoding="UTF-8"?>
<xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <return_msg><![CDATA[DEAL WITH SUCCESS]]></return_msg>
</xml>');
			}
		}
	}
}
