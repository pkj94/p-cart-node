
module.exports = class PromotionController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('marketplace/promotion');
		let type = '';
		if ((this.request.get['type'])) {
			type = this.request.get['type'];
		} else {
			// Just in case there are any direct calls to methods we need to remove them to get the extension type
			let pos = this.request.get['route'].indexOf('.');
			let route = this.request.get['route'];
			if (pos !== false) {
				route = this.request.get['route'].substring(0, pos);
			} else {
				route = this.request.get['route'];
			}

			type = route.substring(route.indexOf('/') + 1);
		}

		let promotion = await this.cache.get('promotion.' + type);

		if (!promotion) {
			try {
				console.log('test----')
				const curl = await require("axios").get(OPENCART_SERVER + 'index.php?route=api/recommended&type=' + type + '&version=' + VERSION);

				let response = curl.data;
				if (response) {
					promotion = response
				} else {
					promotion = '';
				}
			} catch (e) {
				promotion = '';
			}

			await this.cache.set('promotion.' + type, promotion, 3600 * 24);
		}

		if ((promotion['banner'])) {
			data['banner'] = promotion['banner'];
		} else {
			data['banner'] = '';
		}

		data['extensions'] = [];

		if ((promotion['extensions'])) {
			this.load.model('setting/extension', this);

			for (let result of promotion['extensions']) {
				const extension_install_info = await this.model_setting_extension.getInstallByExtensionDownloadId(result['extension_download_id']);

				// Download
				let download = '';
				if (!extension_install_info.extension_install_id) {
					download = await this.url.link('marketplace/marketplace.download', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id'] + '&extension_download_id=' + result['extension_download_id']);
				}

				// Install
				let install = '';
				if (extension_install_info.extension_install_id && !extension_install_info['status']) {
					install = await this.url.link('marketplace/installer.install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + extension_install_info['extension_install_id']);
				}

				// Delete
				let remove = '';
				if (extension_install_info.extension_install_id && !extension_install_info['status']) {
					remove = await this.url.link('marketplace/installer.delete', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + extension_install_info['extension_install_id']);
				}

				if (!extension_install_info.extension_install_id || !extension_install_info['status']) {
					data['extensions'].push({
						'name': result['name'],
						'href': await this.url.link('marketplace/marketplace.info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id']),
						'download': download,
						'install': install,
						'delete': remove
					});
				}
			}
		}

		return await this.load.view('marketplace/promotion', data);
	}
}