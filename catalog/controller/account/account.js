module.exports = class ControllerAccountAccount extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/account', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/account');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['edit'] = await this.url.link('account/edit', '', true);
		data['password'] = await this.url.link('account/password', '', true);
		data['address'] = await this.url.link('account/address', '', true);

		data['credit_cards'] = [];

		const files = require('glob').sync(DIR_APPLICATION + 'controller/extension/credit_card/*.js');

		for (let file of files) {
			let code = expressPath.basename(file, '.js');

			if (Number(this.config.get('payment_' + code + '_status')) && this.config.get('payment_' + code + '_card')) {
				await this.load.language('extension/credit_card/' + code, 'extension');

				data['credit_cards'].push({
					'name': this.language.get('extension').get('heading_title'),
					'href': await this.url.link('extension/credit_card/' + code, '', true)
				});
			}
		}

		data['wishlist'] = await this.url.link('account/wishlist');
		data['order'] = await this.url.link('account/order', '', true);
		data['download'] = await this.url.link('account/download', '', true);

		if (this.config.get('total_reward_status')) {
			data['reward'] = await this.url.link('account/reward', '', true);
		} else {
			data['reward'] = '';
		}

		data['return'] = await this.url.link('account/return', '', true);
		data['transaction'] = await this.url.link('account/transaction', '', true);
		data['newsletter'] = await this.url.link('account/newsletter', '', true);
		data['recurring'] = await this.url.link('account/recurring', '', true);

		this.load.model('account/customer', this);

		const affiliate_info = await this.model_account_customer.getAffiliate(await this.customer.getId());

		if (!affiliate_info.customer_id) {
			data['affiliate'] = await this.url.link('account/affiliate/add', '', true);
		} else {
			data['affiliate'] = await this.url.link('account/affiliate/edit', '', true);
		}

		if (affiliate_info.customer_id) {
			data['tracking'] = await this.url.link('account/tracking', '', true);
		} else {
			data['tracking'] = '';
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/account', data));
	}

	async country() {
		let json = {};

		this.load.model('localisation/country', this);

		const country_info = await this.model_localisation_country.getCountry(this.request.get['country_id']);

		if (country_info) {
			this.load.model('localisation/zone', this);

			json = {
				'country_id': country_info['country_id'],
				'name': country_info['name'],
				'iso_code_2': country_info['iso_code_2'],
				'iso_code_3': country_info['iso_code_3'],
				'address_format': country_info['address_format'],
				'postcode_required': country_info['postcode_required'],
				'zone': await this.model_localisation_zone.getZonesByCountryId(this.request.get['country_id']),
				'status': country_info['status']
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
