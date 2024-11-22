module.exports = class ControllerExtensionShippingUPS extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/shipping/ups');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_ups', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['key'])) {
			data['error_key'] = this.error['key'];
		} else {
			data['error_key'] = '';
		}

		if ((this.error['username'])) {
			data['error_username'] = this.error['username'];
		} else {
			data['error_username'] = '';
		}

		if ((this.error['password'])) {
			data['error_password'] = this.error['password'];
		} else {
			data['error_password'] = '';
		}

		if ((this.error['city'])) {
			data['error_city'] = this.error['city'];
		} else {
			data['error_city'] = '';
		}

		if ((this.error['state'])) {
			data['error_state'] = this.error['state'];
		} else {
			data['error_state'] = '';
		}

		if ((this.error['country'])) {
			data['error_country'] = this.error['country'];
		} else {
			data['error_country'] = '';
		}

		if ((this.error['dimension'])) {
			data['error_dimension'] = this.error['dimension'];
		} else {
			data['error_dimension'] = '';
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
			'href' : await this.url.link('extension/shipping/ups', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/shipping/ups', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		if ((this.request.post['shipping_ups_key'])) {
			data['shipping_ups_key'] = this.request.post['shipping_ups_key'];
		} else {
			data['shipping_ups_key'] = this.config.get('shipping_ups_key');
		}

		if ((this.request.post['shipping_ups_username'])) {
			data['shipping_ups_username'] = this.request.post['shipping_ups_username'];
		} else {
			data['shipping_ups_username'] = this.config.get('shipping_ups_username');
		}

		if ((this.request.post['shipping_ups_password'])) {
			data['shipping_ups_password'] = this.request.post['shipping_ups_password'];
		} else {
			data['shipping_ups_password'] = this.config.get('shipping_ups_password');
		}

		if ((this.request.post['shipping_ups_pickup'])) {
			data['shipping_ups_pickup'] = this.request.post['shipping_ups_pickup'];
		} else {
			data['shipping_ups_pickup'] = this.config.get('shipping_ups_pickup');
		}

		data['pickups'] = {};

		data['pickups'].push({
			'value' : '01',
			'text'  : this.language.get('text_daily_pickup')
		});

		data['pickups'].push({
			'value' : '03',
			'text'  : this.language.get('text_customer_counter')
		});

		data['pickups'].push({
			'value' : '06',
			'text'  : this.language.get('text_one_time_pickup')
		});

		data['pickups'].push({
			'value' : '07',
			'text'  : this.language.get('text_on_call_air_pickup')
		});

		data['pickups'].push({
			'value' : '19',
			'text'  : this.language.get('text_letter_center')
		});

		data['pickups'].push({
			'value' : '20',
			'text'  : this.language.get('text_air_service_center')
		});

		data['pickups'].push({
			'value' : '11',
			'text'  : this.language.get('text_suggested_retail_rates')
		});

		if ((this.request.post['shipping_ups_packaging'])) {
			data['shipping_ups_packaging'] = this.request.post['shipping_ups_packaging'];
		} else {
			data['shipping_ups_packaging'] = this.config.get('shipping_ups_packaging');
		}

		data['packages'] = {};

		data['packages'].push({
			'value' : '02',
			'text'  : this.language.get('text_package')
		});

		data['packages'].push({
			'value' : '01',
			'text'  : this.language.get('text_ups_letter')
		});

		data['packages'].push({
			'value' : '03',
			'text'  : this.language.get('text_ups_tube')
		});

		data['packages'].push({
			'value' : '04',
			'text'  : this.language.get('text_ups_pak')
		});

		data['packages'].push({
			'value' : '21',
			'text'  : this.language.get('text_ups_express_box')
		});

		data['packages'].push({
			'value' : '24',
			'text'  : this.language.get('text_ups_25kg_box')
		});

		data['packages'].push({
			'value' : '25',
			'text'  : this.language.get('text_ups_10kg_box')
		});

		if ((this.request.post['shipping_ups_classification'])) {
			data['shipping_ups_classification'] = this.request.post['shipping_ups_classification'];
		} else {
			data['shipping_ups_classification'] = this.config.get('shipping_ups_classification');
		}

		data['classifications'].push({
			'value' : '01',
			'text'  : '01'
		});

		data['classifications'].push({
			'value' : '03',
			'text'  : '03'
		});

		data['classifications'].push({
			'value' : '04',
			'text'  : '04'
		});

		if ((this.request.post['shipping_ups_origin'])) {
			data['shipping_ups_origin'] = this.request.post['shipping_ups_origin'];
		} else {
			data['shipping_ups_origin'] = this.config.get('shipping_ups_origin');
		}

		data['origins'] = {};

		data['origins'].push({
			'value' : 'US',
			'text'  : this.language.get('text_us')
		});

		data['origins'].push({
			'value' : 'CA',
			'text'  : this.language.get('text_ca')
		});

		data['origins'].push({
			'value' : 'EU',
			'text'  : this.language.get('text_eu')
		});

		data['origins'].push({
			'value' : 'PR',
			'text'  : this.language.get('text_pr')
		});

		data['origins'].push({
			'value' : 'MX',
			'text'  : this.language.get('text_mx')
		});

		data['origins'].push({
			'value' : 'other',
			'text'  : this.language.get('text_other')
		});

		if ((this.request.post['shipping_ups_city'])) {
			data['shipping_ups_city'] = this.request.post['shipping_ups_city'];
		} else {
			data['shipping_ups_city'] = this.config.get('shipping_ups_city');
		}

		if ((this.request.post['shipping_ups_state'])) {
			data['shipping_ups_state'] = this.request.post['shipping_ups_state'];
		} else {
			data['shipping_ups_state'] = this.config.get('shipping_ups_state');
		}

		if ((this.request.post['shipping_ups_country'])) {
			data['shipping_ups_country'] = this.request.post['shipping_ups_country'];
		} else {
			data['shipping_ups_country'] = this.config.get('shipping_ups_country');
		}

		if ((this.request.post['shipping_ups_postcode'])) {
			data['shipping_ups_postcode'] = this.request.post['shipping_ups_postcode'];
		} else {
			data['shipping_ups_postcode'] = this.config.get('shipping_ups_postcode');
		}

		if ((this.request.post['shipping_ups_test'])) {
			data['shipping_ups_test'] = this.request.post['shipping_ups_test'];
		} else {
			data['shipping_ups_test'] = this.config.get('shipping_ups_test');
		}

		if ((this.request.post['shipping_ups_quote_type'])) {
			data['shipping_ups_quote_type'] = this.request.post['shipping_ups_quote_type'];
		} else {
			data['shipping_ups_quote_type'] = this.config.get('shipping_ups_quote_type');
		}

		data['quote_types'] = {};

		data['quote_types'].push({
			'value' : 'residential',
			'text'  : this.language.get('text_residential')
		});

		data['quote_types'].push({
			'value' : 'commercial',
			'text'  : this.language.get('text_commercial')
		});

		// US
		if ((this.request.post['shipping_ups_us_01'])) {
			data['shipping_ups_us_01'] = this.request.post['shipping_ups_us_01'];
		} else {
			data['shipping_ups_us_01'] = this.config.get('shipping_ups_us_01');
		}

		if ((this.request.post['shipping_ups_us_02'])) {
			data['shipping_ups_us_02'] = this.request.post['shipping_ups_us_02'];
		} else {
			data['shipping_ups_us_02'] = this.config.get('shipping_ups_us_02');
		}

		if ((this.request.post['shipping_ups_us_03'])) {
			data['shipping_ups_us_03'] = this.request.post['shipping_ups_us_03'];
		} else {
			data['shipping_ups_us_03'] = this.config.get('shipping_ups_us_03');
		}

		if ((this.request.post['shipping_ups_us_07'])) {
			data['shipping_ups_us_07'] = this.request.post['shipping_ups_us_07'];
		} else {
			data['shipping_ups_us_07'] = this.config.get('shipping_ups_us_07');
		}

		if ((this.request.post['shipping_ups_us_08'])) {
			data['shipping_ups_us_08'] = this.request.post['shipping_ups_us_08'];
		} else {
			data['shipping_ups_us_08'] = this.config.get('shipping_ups_us_08');
		}

		if ((this.request.post['shipping_ups_us_11'])) {
			data['shipping_ups_us_11'] = this.request.post['shipping_ups_us_11'];
		} else {
			data['shipping_ups_us_11'] = this.config.get('shipping_ups_us_11');
		}

		if ((this.request.post['shipping_ups_us_12'])) {
			data['shipping_ups_us_12'] = this.request.post['shipping_ups_us_12'];
		} else {
			data['shipping_ups_us_12'] = this.config.get('shipping_ups_us_12');
		}

		if ((this.request.post['shipping_ups_us_13'])) {
			data['shipping_ups_us_13'] = this.request.post['shipping_ups_us_13'];
		} else {
			data['shipping_ups_us_13'] = this.config.get('shipping_ups_us_13');
		}

		if ((this.request.post['shipping_ups_us_14'])) {
			data['shipping_ups_us_14'] = this.request.post['shipping_ups_us_14'];
		} else {
			data['shipping_ups_us_14'] = this.config.get('shipping_ups_us_14');
		}

		if ((this.request.post['shipping_ups_us_54'])) {
			data['shipping_ups_us_54'] = this.request.post['shipping_ups_us_54'];
		} else {
			data['shipping_ups_us_54'] = this.config.get('shipping_ups_us_54');
		}

		if ((this.request.post['shipping_ups_us_59'])) {
			data['shipping_ups_us_59'] = this.request.post['shipping_ups_us_59'];
		} else {
			data['shipping_ups_us_59'] = this.config.get('shipping_ups_us_59');
		}

		if ((this.request.post['shipping_ups_us_65'])) {
			data['shipping_ups_us_65'] = this.request.post['shipping_ups_us_65'];
		} else {
			data['shipping_ups_us_65'] = this.config.get('shipping_ups_us_65');
		}

		// Puerto Rico
		if ((this.request.post['shipping_ups_pr_01'])) {
			data['shipping_ups_pr_01'] = this.request.post['shipping_ups_pr_01'];
		} else {
			data['shipping_ups_pr_01'] = this.config.get('shipping_ups_pr_01');
		}

		if ((this.request.post['shipping_ups_pr_02'])) {
			data['shipping_ups_pr_02'] = this.request.post['shipping_ups_pr_02'];
		} else {
			data['shipping_ups_pr_02'] = this.config.get('shipping_ups_pr_02');
		}

		if ((this.request.post['shipping_ups_pr_03'])) {
			data['shipping_ups_pr_03'] = this.request.post['shipping_ups_pr_03'];
		} else {
			data['shipping_ups_pr_03'] = this.config.get('shipping_ups_pr_03');
		}

		if ((this.request.post['shipping_ups_pr_07'])) {
			data['shipping_ups_pr_07'] = this.request.post['shipping_ups_pr_07'];
		} else {
			data['shipping_ups_pr_07'] = this.config.get('shipping_ups_pr_07');
		}

		if ((this.request.post['shipping_ups_pr_08'])) {
			data['shipping_ups_pr_08'] = this.request.post['shipping_ups_pr_08'];
		} else {
			data['shipping_ups_pr_08'] = this.config.get('shipping_ups_pr_08');
		}

		if ((this.request.post['shipping_ups_pr_14'])) {
			data['shipping_ups_pr_14'] = this.request.post['shipping_ups_pr_14'];
		} else {
			data['shipping_ups_pr_14'] = this.config.get('shipping_ups_pr_14');
		}

		if ((this.request.post['shipping_ups_pr_54'])) {
			data['shipping_ups_pr_54'] = this.request.post['shipping_ups_pr_54'];
		} else {
			data['shipping_ups_pr_54'] = this.config.get('shipping_ups_pr_54');
		}

		if ((this.request.post['shipping_ups_pr_65'])) {
			data['shipping_ups_pr_65'] = this.request.post['shipping_ups_pr_65'];
		} else {
			data['shipping_ups_pr_65'] = this.config.get('shipping_ups_pr_65');
		}

		// Canada
		if ((this.request.post['shipping_ups_ca_01'])) {
			data['shipping_ups_ca_01'] = this.request.post['shipping_ups_ca_01'];
		} else {
			data['shipping_ups_ca_01'] = this.config.get('shipping_ups_ca_01');
		}

		if ((this.request.post['shipping_ups_ca_02'])) {
			data['shipping_ups_ca_02'] = this.request.post['shipping_ups_ca_02'];
		} else {
			data['shipping_ups_ca_02'] = this.config.get('shipping_ups_ca_02');
		}

		if ((this.request.post['shipping_ups_ca_07'])) {
			data['shipping_ups_ca_07'] = this.request.post['shipping_ups_ca_07'];
		} else {
			data['shipping_ups_ca_07'] = this.config.get('shipping_ups_ca_07');
		}

		if ((this.request.post['shipping_ups_ca_08'])) {
			data['shipping_ups_ca_08'] = this.request.post['shipping_ups_ca_08'];
		} else {
			data['shipping_ups_ca_08'] = this.config.get('shipping_ups_ca_08');
		}

		if ((this.request.post['shipping_ups_ca_11'])) {
			data['shipping_ups_ca_11'] = this.request.post['shipping_ups_ca_11'];
		} else {
			data['shipping_ups_ca_11'] = this.config.get('shipping_ups_ca_11');
		}

		if ((this.request.post['shipping_ups_ca_12'])) {
			data['shipping_ups_ca_12'] = this.request.post['shipping_ups_ca_12'];
		} else {
			data['shipping_ups_ca_12'] = this.config.get('shipping_ups_ca_12');
		}

		if ((this.request.post['shipping_ups_ca_13'])) {
			data['shipping_ups_ca_13'] = this.request.post['shipping_ups_ca_13'];
		} else {
			data['shipping_ups_ca_13'] = this.config.get('shipping_ups_ca_13');
		}

		if ((this.request.post['shipping_ups_ca_14'])) {
			data['shipping_ups_ca_14'] = this.request.post['shipping_ups_ca_14'];
		} else {
			data['shipping_ups_ca_14'] = this.config.get('shipping_ups_ca_14');
		}

		if ((this.request.post['shipping_ups_ca_54'])) {
			data['shipping_ups_ca_54'] = this.request.post['shipping_ups_ca_54'];
		} else {
			data['shipping_ups_ca_54'] = this.config.get('shipping_ups_ca_54');
		}

		if ((this.request.post['shipping_ups_ca_65'])) {
			data['shipping_ups_ca_65'] = this.request.post['shipping_ups_ca_65'];
		} else {
			data['shipping_ups_ca_65'] = this.config.get('shipping_ups_ca_65');
		}

		// Mexico
		if ((this.request.post['shipping_ups_mx_07'])) {
			data['shipping_ups_mx_07'] = this.request.post['shipping_ups_mx_07'];
		} else {
			data['shipping_ups_mx_07'] = this.config.get('shipping_ups_mx_07');
		}

		if ((this.request.post['shipping_ups_mx_08'])) {
			data['shipping_ups_mx_08'] = this.request.post['shipping_ups_mx_08'];
		} else {
			data['shipping_ups_mx_08'] = this.config.get('shipping_ups_mx_08');
		}

		if ((this.request.post['shipping_ups_mx_54'])) {
			data['shipping_ups_mx_54'] = this.request.post['shipping_ups_mx_54'];
		} else {
			data['shipping_ups_mx_54'] = this.config.get('shipping_ups_mx_54');
		}

		if ((this.request.post['shipping_ups_mx_65'])) {
			data['shipping_ups_mx_65'] = this.request.post['shipping_ups_mx_65'];
		} else {
			data['shipping_ups_mx_65'] = this.config.get('shipping_ups_mx_65');
		}

		// EU
		if ((this.request.post['shipping_ups_eu_07'])) {
			data['shipping_ups_eu_07'] = this.request.post['shipping_ups_eu_07'];
		} else {
			data['shipping_ups_eu_07'] = this.config.get('shipping_ups_eu_07');
		}

		if ((this.request.post['shipping_ups_eu_08'])) {
			data['shipping_ups_eu_08'] = this.request.post['shipping_ups_eu_08'];
		} else {
			data['shipping_ups_eu_08'] = this.config.get('shipping_ups_eu_08');
		}

		if ((this.request.post['shipping_ups_eu_11'])) {
			data['shipping_ups_eu_11'] = this.request.post['shipping_ups_eu_11'];
		} else {
			data['shipping_ups_eu_11'] = this.config.get('shipping_ups_eu_11');
		}

		if ((this.request.post['shipping_ups_eu_54'])) {
			data['shipping_ups_eu_54'] = this.request.post['shipping_ups_eu_54'];
		} else {
			data['shipping_ups_eu_54'] = this.config.get('shipping_ups_eu_54');
		}

		if ((this.request.post['shipping_ups_eu_65'])) {
			data['shipping_ups_eu_65'] = this.request.post['shipping_ups_eu_65'];
		} else {
			data['shipping_ups_eu_65'] = this.config.get('shipping_ups_eu_65');
		}

		if ((this.request.post['shipping_ups_eu_82'])) {
			data['shipping_ups_eu_82'] = this.request.post['shipping_ups_eu_82'];
		} else {
			data['shipping_ups_eu_82'] = this.config.get('shipping_ups_eu_82');
		}

		if ((this.request.post['shipping_ups_eu_83'])) {
			data['shipping_ups_eu_83'] = this.request.post['shipping_ups_eu_83'];
		} else {
			data['shipping_ups_eu_83'] = this.config.get('shipping_ups_eu_83');
		}

		if ((this.request.post['shipping_ups_eu_84'])) {
			data['shipping_ups_eu_84'] = this.request.post['shipping_ups_eu_84'];
		} else {
			data['shipping_ups_eu_84'] = this.config.get('shipping_ups_eu_84');
		}

		if ((this.request.post['shipping_ups_eu_85'])) {
			data['shipping_ups_eu_85'] = this.request.post['shipping_ups_eu_85'];
		} else {
			data['shipping_ups_eu_85'] = this.config.get('shipping_ups_eu_85');
		}

		if ((this.request.post['shipping_ups_eu_86'])) {
			data['shipping_ups_eu_86'] = this.request.post['shipping_ups_eu_86'];
		} else {
			data['shipping_ups_eu_86'] = this.config.get('shipping_ups_eu_86');
		}

		// Other
		if ((this.request.post['shipping_ups_other_07'])) {
			data['shipping_ups_other_07'] = this.request.post['shipping_ups_other_07'];
		} else {
			data['shipping_ups_other_07'] = this.config.get('shipping_ups_other_07');
		}

		if ((this.request.post['shipping_ups_other_08'])) {
			data['shipping_ups_other_08'] = this.request.post['shipping_ups_other_08'];
		} else {
			data['shipping_ups_other_08'] = this.config.get('shipping_ups_other_08');
		}

		if ((this.request.post['shipping_ups_other_11'])) {
			data['shipping_ups_other_11'] = this.request.post['shipping_ups_other_11'];
		} else {
			data['shipping_ups_other_11'] = this.config.get('shipping_ups_other_11');
		}

		if ((this.request.post['shipping_ups_other_54'])) {
			data['shipping_ups_other_54'] = this.request.post['shipping_ups_other_54'];
		} else {
			data['shipping_ups_other_54'] = this.config.get('shipping_ups_other_54');
		}

		if ((this.request.post['shipping_ups_other_65'])) {
			data['shipping_ups_other_65'] = this.request.post['shipping_ups_other_65'];
		} else {
			data['shipping_ups_other_65'] = this.config.get('shipping_ups_other_65');
		}

		if ((this.request.post['shipping_ups_display_weight'])) {
			data['shipping_ups_display_weight'] = this.request.post['shipping_ups_display_weight'];
		} else {
			data['shipping_ups_display_weight'] = this.config.get('shipping_ups_display_weight');
		}

		if ((this.request.post['shipping_ups_insurance'])) {
			data['shipping_ups_insurance'] = this.request.post['shipping_ups_insurance'];
		} else {
			data['shipping_ups_insurance'] = this.config.get('shipping_ups_insurance');
		}

		if ((this.request.post['shipping_ups_weight_class_id'])) {
			data['shipping_ups_weight_class_id'] = this.request.post['shipping_ups_weight_class_id'];
		} else {
			data['shipping_ups_weight_class_id'] = this.config.get('shipping_ups_weight_class_id');
		}

		this.load.model('localisation/weight_class',this);

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((this.request.post['shipping_ups_length_code'])) {
			data['shipping_ups_length_code'] = this.request.post['shipping_ups_length_code'];
		} else {
			data['shipping_ups_length_code'] = this.config.get('shipping_ups_length_code');
		}

		if ((this.request.post['shipping_ups_length_class_id'])) {
			data['shipping_ups_length_class_id'] = this.request.post['shipping_ups_length_class_id'];
		} else {
			data['shipping_ups_length_class_id'] = this.config.get('shipping_ups_length_class_id');
		}

		this.load.model('localisation/length_class',this);

		data['length_classes'] = await this.model_localisation_length_class.getLengthClasses();

		if ((this.request.post['shipping_ups_length'])) {
			data['shipping_ups_length'] = this.request.post['shipping_ups_length'];
		} else {
			data['shipping_ups_length'] = this.config.get('shipping_ups_length');
		}

		if ((this.request.post['shipping_ups_width'])) {
			data['shipping_ups_width'] = this.request.post['shipping_ups_width'];
		} else {
			data['shipping_ups_width'] = this.config.get('shipping_ups_width');
		}

		if ((this.request.post['shipping_ups_height'])) {
			data['shipping_ups_height'] = this.request.post['shipping_ups_height'];
		} else {
			data['shipping_ups_height'] = this.config.get('shipping_ups_height');
		}

		if ((this.request.post['shipping_ups_tax_class_id'])) {
			data['shipping_ups_tax_class_id'] = this.request.post['shipping_ups_tax_class_id'];
		} else {
			data['shipping_ups_tax_class_id'] = this.config.get('shipping_ups_tax_class_id');
		}

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['shipping_ups_geo_zone_id'])) {
			data['shipping_ups_geo_zone_id'] = this.request.post['shipping_ups_geo_zone_id'];
		} else {
			data['shipping_ups_geo_zone_id'] = this.config.get('shipping_ups_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['shipping_ups_status'])) {
			data['shipping_ups_status'] = this.request.post['shipping_ups_status'];
		} else {
			data['shipping_ups_status'] = this.config.get('shipping_ups_status');
		}

		if ((this.request.post['shipping_ups_sort_order'])) {
			data['shipping_ups_sort_order'] = this.request.post['shipping_ups_sort_order'];
		} else {
			data['shipping_ups_sort_order'] = this.config.get('shipping_ups_sort_order');
		}

		if ((this.request.post['shipping_ups_debug'])) {
			data['shipping_ups_debug'] = this.request.post['shipping_ups_debug'];
		} else {
			data['shipping_ups_debug'] = this.config.get('shipping_ups_debug');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/ups', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/ups')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['shipping_ups_key']) {
			this.error['key'] = this.language.get('error_key');
		}

		if (!this.request.post['shipping_ups_username']) {
			this.error['username'] = this.language.get('error_username');
		}

		if (!this.request.post['shipping_ups_password']) {
			this.error['password'] = this.language.get('error_password');
		}

		if (!this.request.post['shipping_ups_city']) {
			this.error['city'] = this.language.get('error_city');
		}

		if (!this.request.post['shipping_ups_state']) {
			this.error['state'] = this.language.get('error_state');
		}

		if (!this.request.post['shipping_ups_country']) {
			this.error['country'] = this.language.get('error_country');
		}

		if (empty(this.request.post['shipping_ups_length'])) {
			this.error['dimension'] = this.language.get('error_dimension');
		}

		if (empty(this.request.post['shipping_ups_width'])) {
			this.error['dimension'] = this.language.get('error_dimension');
		}

		if (empty(this.request.post['shipping_ups_height'])) {
			this.error['dimension'] = this.language.get('error_dimension');
		}

		return Object.keys(this.error).length?false:true
	}
}