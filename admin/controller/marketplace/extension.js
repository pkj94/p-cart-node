<?php
namespace Opencart\Admin\Controller\Marketplace;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Marketplace
 */
class ExtensionController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('marketplace/extension');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'])
		});

		if ((this.request.get['type'])) {
			data['type'] = this.request.get['type'];
		} else {
			data['type'] = '';
		}

		data['categories'] = [];

		this.load.model('setting/extension');

		files = glob(DIR_APPLICATION + 'controller/extension/*.php');

		for (files of file) {
			extension = basename(file, '.php');

			await this.load.language('extension/' + extension, extension);

			if (await this.user.hasPermission('access', 'extension/' + extension)) {
				extensions await this.model_setting_extension.getPaths('%/admin/controller/' + extension + '/%.php');

				data['categories'].push({
					'code' : extension,
					'text' : this.language.get(extension + '_heading_title') + ' (' + count(extensions) + ')',
					'href' : this.url.link('extension/' + extension, 'user_token=' + this.session.data['user_token'])
				];
			}
		}

		if ((this.request.get['type'])) {
			data['extension'] = await this.load.controller('extension/' + basename(this.request.get['type']) + '.getList');
		} elseif (data['categories']) {
			data['extension'] = await this.load.controller('extension/' + data['categories'][0]['code'] + '.getList');
		} else {
			data['extension'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/extension', data));
	}
}