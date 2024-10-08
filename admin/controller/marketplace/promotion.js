<?php
namespace Opencart\Admin\Controller\Marketplace;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Marketplace
 */
class PromotionController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		await this.load.language('marketplace/promotion');

		if ((this.request.get['type'])) {
			type = this.request.get['type'];
		} else {
			// Just in case there are any direct calls to methods we need to remove them to get the extension type
			pos = strrpos(this.request.get['route'], '.');

			if (pos !== false) {
				route = substr(this.request.get['route'], 0, pos);
			} else {
				route = this.request.get['route'];
			}

			type = substr(route, strrpos(route, '/') + 1);
		}

		promotion = this.cache.get('promotion.' + type);

		if (!promotion) {
			curl = curl_init();

			curl_setopt(curl, CURLOPT_URL, OPENCART_SERVER + 'api/recommended&type=' + type + '&version=' + VERSION);
			curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt(curl, CURLOPT_HEADER, false);
			curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
			curl_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30);
			curl_setopt(curl, CURLOPT_TIMEOUT, 30);

			response = curl_exec(curl);

			curl_close(curl);

			if (response) {
				promotion = json_decode(response, true);
			} else {
				promotion = '';
			}

			this.cache.set('promotion.' + type, promotion, 3600 * 24);
		}

		if ((promotion['banner'])) {
			data['banner'] = promotion['banner'];
		} else {
			data['banner'] = '';
		}

		data['extensions'] = [];

		if ((promotion['extensions'])) {
			this.load.model('setting/extension');

			for (promotion['extensions'] of result) {
				extension_install_info await this.model_setting_extension.getInstallByExtensionDownloadId(result['extension_download_id']);

				// Download
				if (!extension_install_info) {
					download = this.url.link('marketplace/marketplace.download', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id'] + '&extension_download_id=' + result['extension_download_id']);
				} else {
					download = '';
				}

				// Install
				if (extension_install_info && !extension_install_info['status']) {
					install = this.url.link('marketplace/installer.install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + extension_install_info['extension_install_id']);
				} else {
					install = '';
				}

				// Delete
				if (extension_install_info && !extension_install_info['status']) {
					delete = this.url.link('marketplace/installer.delete', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + extension_install_info['extension_install_id']);
				} else {
					delete = '';
				}

				if (!extension_install_info || !extension_install_info['status']) {
					data['extensions'].push({
						'name'     : result['name'],
						'href'     : this.url.link('marketplace/marketplace.info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id']),
						'download' : download,
						'install'  : install,
						'delete'   : delete
					];
				}
			}
		}

		return await this.load.view('marketplace/promotion', data);
	}
}