module.exports = class ControllerExtensionShippingECShip extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/shipping/ec_ship');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_ec_ship', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['username'])) {
			data['error_username'] = this.error['username'];
		} else {
			data['error_username'] = '';
		}

		if ((this.error['api_username'])) {
			data['error_api_username'] = this.error['entry_api_username'];
		} else {
			data['error_api_username'] = '';
		}

		if ((this.error['api_key'])) {
			data['error_api_key'] = this.error['api_key'];
		} else {
			data['error_api_key'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/shipping/ec_ship', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/shipping/ec_ship', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		if ((this.request.post['shipping_ec_ship_api_key'])) {
			data['shipping_ec_ship_api_key'] = this.request.post['shipping_ec_ship_api_key'];
		} else {
			data['shipping_ec_ship_api_key'] = this.config.get('shipping_ec_ship_api_key');
		}

		if ((this.request.post['shipping_ec_ship_username'])) {
			data['shipping_ec_ship_username'] = this.request.post['shipping_ec_ship_username'];
		} else {
			data['shipping_ec_ship_username'] = this.config.get('shipping_ec_ship_username');
		}

		if ((this.request.post['shipping_ec_ship_api_username'])) {
			data['shipping_ec_ship_api_username'] = this.request.post['shipping_ec_ship_api_username'];
		} else {
			data['shipping_ec_ship_api_username'] = this.config.get('shipping_ec_ship_api_username');
		}

		if ((this.request.post['shipping_ec_ship_test'])) {
			data['shipping_ec_ship_test'] = this.request.post['shipping_ec_ship_test'];
		} else {
			data['shipping_ec_ship_test'] = this.config.get('shipping_ec_ship_test');
		}

		if ((this.request.post['shipping_ec_ship_air_registered_mail'])) {
			data['shipping_ec_ship_air_registered_mail'] = this.request.post['shipping_ec_ship_air_registered_mail'];
		} else {
			data['shipping_ec_ship_air_registered_mail'] = this.config.get('shipping_ec_ship_air_registered_mail');
		}

		if ((this.request.post['shipping_ec_ship_air_parcel'])) {
			data['shipping_ec_ship_air_parcel'] = this.request.post['shipping_ec_ship_air_parcel'];
		} else {
			data['shipping_ec_ship_air_parcel'] = this.config.get('shipping_ec_ship_air_parcel');
		}

		if ((this.request.post['shipping_ec_ship_e_express_service_to_us'])) {
			data['shipping_ec_ship_e_express_service_to_us'] = this.request.post['shipping_ec_ship_e_express_service_to_us'];
		} else {
			data['shipping_ec_ship_e_express_service_to_us'] = this.config.get('shipping_ec_ship_e_express_service_to_us');
		}

		if ((this.request.post['shipping_ec_ship_e_express_service_to_canada'])) {
			data['shipping_ec_ship_e_express_service_to_canada'] = this.request.post['shipping_ec_ship_e_express_service_to_canada'];
		} else {
			data['shipping_ec_ship_e_express_service_to_canada'] = this.config.get('shipping_ec_ship_e_express_service_to_canada');
		}

		if ((this.request.post['shipping_ec_ship_e_express_service_to_united_kingdom'])) {
			data['shipping_ec_ship_e_express_service_to_united_kingdom'] = this.request.post['shipping_ec_ship_e_express_service_to_united_kingdom'];
		} else {
			data['shipping_ec_ship_e_express_service_to_united_kingdom'] = this.config.get('shipping_ec_ship_e_express_service_to_united_kingdom');
		}

		if ((this.request.post['shipping_ec_ship_e_express_service_to_russia'])) {
			data['shipping_ec_ship_e_express_service_to_russia'] = this.request.post['shipping_ec_ship_e_express_service_to_russia'];
		} else {
			data['shipping_ec_ship_e_express_service_to_russia'] = this.config.get('shipping_ec_ship_e_express_service_to_russia');
		}

		if ((this.request.post['shipping_ec_ship_e_express_service_one'])) {
			data['shipping_ec_ship_e_express_service_one'] = this.request.post['shipping_ec_ship_e_express_service_one'];
		} else {
			data['shipping_ec_ship_e_express_service_one'] = this.config.get('shipping_ec_ship_e_express_service_one');
		}

		if ((this.request.post['shipping_ec_ship_e_express_service_two'])) {
			data['shipping_ec_ship_e_express_service_two'] = this.request.post['shipping_ec_ship_e_express_service_two'];
		} else {
			data['shipping_ec_ship_e_express_service_two'] = this.config.get('shipping_ec_ship_e_express_service_two');
		}

		if ((this.request.post['shipping_ec_ship_speed_post'])) {
			data['shipping_ec_ship_speed_post'] = this.request.post['shipping_ec_ship_speed_post'];
		} else {
			data['shipping_ec_ship_speed_post'] = this.config.get('shipping_ec_ship_speed_post');
		}

		if ((this.request.post['shipping_ec_ship_smart_post'])) {
			data['shipping_ec_ship_smart_post'] = this.request.post['shipping_ec_ship_smart_post'];
		} else {
			data['shipping_ec_ship_smart_post'] = this.config.get('shipping_ec_ship_smart_post');
		}

		if ((this.request.post['shipping_ec_ship_local_courier_post'])) {
			data['shipping_ec_ship_local_courier_post'] = this.request.post['shipping_ec_ship_local_courier_post'];
		} else {
			data['shipping_ec_ship_local_courier_post'] = this.config.get('shipping_ec_ship_local_courier_post');
		}

		if ((this.request.post['shipping_ec_ship_local_parcel'])) {
			data['shipping_ec_ship_local_parcel'] = this.request.post['shipping_ec_ship_local_parcel'];
		} else {
			data['shipping_ec_ship_local_parcel'] = this.config.get('shipping_ec_ship_local_parcel');
		}

		if ((this.request.post['shipping_ec_ship_weight_class_id'])) {
			data['shipping_ec_ship_weight_class_id'] = this.request.post['shipping_ec_ship_weight_class_id'];
		} else {
			data['shipping_ec_ship_weight_class_id'] = this.config.get('shipping_ec_ship_weight_class_id');
		}

		this.load.model('localisation/weight_class',this);

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((this.request.post['shipping_ec_ship_tax_class_id'])) {
			data['shipping_ec_ship_tax_class_id'] = this.request.post['shipping_ec_ship_tax_class_id'];
		} else {
			data['shipping_ec_ship_tax_class_id'] = this.config.get('shipping_ec_ship_tax_class_id');
		}

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['shipping_ec_ship_geo_zone_id'])) {
			data['shipping_ec_ship_geo_zone_id'] = this.request.post['shipping_ec_ship_geo_zone_id'];
		} else {
			data['shipping_ec_ship_geo_zone_id'] = this.config.get('shipping_ec_ship_geo_zone_id');
		}

		this.load.model('localisation/geo_zone',this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['shipping_ec_ship_status'])) {
			data['shipping_ec_ship_status'] = this.request.post['shipping_ec_ship_status'];
		} else {
			data['shipping_ec_ship_status'] = this.config.get('shipping_ec_ship_status');
		}

		if ((this.request.post['shipping_ec_ship_sort_order'])) {
			data['shipping_ec_ship_sort_order'] = this.request.post['shipping_ec_ship_sort_order'];
		} else {
			data['shipping_ec_ship_sort_order'] = this.config.get('shipping_ec_ship_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/ec_ship', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/ec_ship')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['shipping_ec_ship_api_key']) {
			this.error['api_key'] = this.language.get('error_api_key');
		}

		if (!this.request.post['shipping_ec_ship_username']) {
			this.error['username'] = this.language.get('error_username');
		}

		if (!this.request.post['shipping_ec_ship_api_username']) {
			this.error['api_username'] = this.language.get('error_api_username');
		}

		return Object.keys(this.error).length?false:true
	}
}
