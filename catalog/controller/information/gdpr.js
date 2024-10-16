<?php
namespace Opencart\Catalog\Controller\Information;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Information
 */
class GdprController extends Controller {
	/**
	 * @return object|\Opencart\System\Engine\Action|null
	 */
	async index() {
const data ={};
		this.load.model('catalog/information',this);

		information_info = await this.model_catalog_information.getInformation(this.config.get('config_gdpr_id'));

		if (information_info) {
			await this.load.language('information/gdpr');

			this.document.setTitle(this.language.get('heading_title'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_home'),
				'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			];

			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('information/gdpr', 'language=' + this.config.get('config_language'))
			];

			data['action'] = await this.url.link('information/gdpr+action', 'language=' + this.config.get('config_language'));

			data['title'] = information_info['title'];

			data['gdpr'] = await this.url.link('information/information', 'language=' + this.config.get('config_language') + '&information_id=' + information_info['information_id']);

			data['email'] = await this.customer.getEmail();
			data['store'] = this.config.get('config_name');
			data['limit'] = this.config.get('config_gdpr_limit');

			data['cancel'] = await this.url.link('account/account', 'language=' + this.config.get('config_language'));

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('information/gdpr', data));

			return null;
		} else {
			return new \Opencart\System\Engine\Action('error/not_found');
		}
	}

	/*
	 *  Action Statuses
	 *
	 *	EXPORT
	 *
	 *  unverified = 0
	 *	pending    = 1
	 *	complete   = 3
	 *
	 *	REMOVE
	 *
	 *  unverified = 0
	 *	pending    = 1
	 *	processing = 2
	 *	delete     = 3
	 *
	 *	DENY
	 *
	 *  unverified = 0
	 *	pending    = 1
	 *	processing = 2
	 *	denied     = -1
	*/
	/**
	 * @return void
	 */
	async action() {
		await this.load.language('information/gdpr');

		const json = {};

		if ((this.request.post['email'])) {
			email = this.request.post['email'];
		} else {
			email = '';
		}

		if ((this.request.post['action'])) {
			action = this.request.post['action'];
		} else {
			action = '';
		}

		// Validate E-Mail
		if ((oc_strlen(email) > 96) || !filter_var(email, FILTER_VALIDATE_EMAIL)) {
			json['error']['email'] = this.language.get('error_email');
		}

		// Validate Action
		allowed = [
			'export',
			'remove'
		];

		if (!in_array(action, allowed)) {
			json['error']['action'] = this.language.get('error_action');
		}

		if (!Object.keys(json).length) {
			// Added additional check so people are not spamming requests
			status = true;

			this.load.model('account/gdpr');

			const results = await this.model_account_gdpr.getGdprsByEmail(email);

			for (let result of results) {
				if (result['action'] == action) {
					status = false;

					break;
				}
			}

			if (status) {
				await this.model_account_gdpr.addGdpr(oc_token(32), email, action);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return object|\Opencart\System\Engine\Action|null
	 */
	async success() {
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		} else {
			code = '';
		}

		this.load.model('account/gdpr');

		gdpr_info = await this.model_account_gdpr.getGdprByCode(code);

		if (gdpr_info) {
			await this.load.language('information/gdpr_success');

			this.document.setTitle(this.language.get('heading_title'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_home'),
				'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_account'),
				'href' : await this.url.link('information/gdpr', 'language=' + this.config.get('config_language'))
			];

			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('information/gdpr+success', 'language=' + this.config.get('config_language'))
			];

			if (gdpr_info['status'] == 0) {
				await this.model_account_gdpr.editStatus(gdpr_info['gdpr_id'], 1);
			}

			if (gdpr_info['action'] == 'export') {
				data['text_message'] = this.language.get('text_export');
			} else {
				data['text_message'] = sprintf(this.language.get('text_remove'), this.config.get('config_gdpr_limit'));
			}

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('common/success', data));

			return null;
		} else {
			return new \Opencart\System\Engine\Action('error/not_found');
		}
	}
}