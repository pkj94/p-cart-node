module.exports = class ControllerExtensionShippingRoyalMail extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/shipping/royal_mail');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_royal_mail', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true));
		}

		if ((this.error['warning']))  {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
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
			'href' : await this.url.link('extension/shipping/royal_mail', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/shipping/royal_mail', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		// Special Delivery < 500
		if ((this.request.post['shipping_royal_mail_special_delivery_500_rate'])) {
			data['shipping_royal_mail_special_delivery_500_rate'] = this.request.post['shipping_royal_mail_special_delivery_500_rate'];
		} else if (this.config.has('shipping_royal_mail_special_delivery_500_rate')) {
			data['shipping_royal_mail_special_delivery_500_rate'] = this.config.get('shipping_royal_mail_special_delivery_500_rate');
		} else {
			data['shipping_royal_mail_special_delivery_500_rate'] = '0.1:6.40,0.5:7.15,1:8.45,2:11.00,10:26.60,20:41.20';
		}

		if ((this.request.post['shipping_royal_mail_special_delivery_500_insurance'])) {
			data['shipping_royal_mail_special_delivery_500_insurance'] = this.request.post['shipping_royal_mail_special_delivery_500_insurance'];
		} else if (this.config.has('shipping_royal_mail_special_delivery_500_insurance')) {
			data['shipping_royal_mail_special_delivery_500_insurance'] = this.config.get('shipping_royal_mail_special_delivery_500_insurance');
		} else {
			data['shipping_royal_mail_special_delivery_500_insurance'] = '0:500';
		}

		if ((this.request.post['shipping_royal_mail_special_delivery_500_status'])) {
			data['shipping_royal_mail_special_delivery_500_status'] = this.request.post['shipping_royal_mail_special_delivery_500_status'];
		} else {
			data['shipping_royal_mail_special_delivery_500_status'] = this.config.get('shipping_royal_mail_special_delivery_500_status');
		}

		// Special Delivery < 1000
		if ((this.request.post['shipping_royal_mail_special_delivery_1000_rate'])) {
			data['shipping_royal_mail_special_delivery_1000_rate'] = this.request.post['shipping_royal_mail_special_delivery_1000_rate'];
		} else if (this.config.has('shipping_royal_mail_special_delivery_1000_rate')) {
			data['shipping_royal_mail_special_delivery_1000_rate'] = this.config.get('shipping_royal_mail_special_delivery_1000_rate');
		} else {
			data['shipping_royal_mail_special_delivery_1000_rate'] = '0.1:7.40,0.5:8.15,1:9.45,2:12.00,10:27.60,20:42.20';
		}

		if ((this.request.post['shipping_royal_mail_special_delivery_1000_insurance'])) {
			data['shipping_royal_mail_special_delivery_1000_insurance'] = this.request.post['shipping_royal_mail_special_delivery_1000_insurance'];
		} else if (this.config.has('shipping_royal_mail_special_delivery_1000_insurance')) {
			data['shipping_royal_mail_special_delivery_1000_insurance'] = this.config.get('shipping_royal_mail_special_delivery_1000_insurance');
		} else {
			data['shipping_royal_mail_special_delivery_1000_insurance'] = '0:1000';
		}

		if ((this.request.post['shipping_royal_mail_special_delivery_1000_status'])) {
			data['shipping_royal_mail_special_delivery_1000_status'] = this.request.post['shipping_royal_mail_special_delivery_1000_status'];
		} else {
			data['shipping_royal_mail_special_delivery_1000_status'] = this.config.get('shipping_royal_mail_special_delivery_1000_status');
		}

		// Special Delivery < 2500
		if ((this.request.post['shipping_royal_mail_special_delivery_2500_rate'])) {
			data['shipping_royal_mail_special_delivery_2500_rate'] = this.request.post['shipping_royal_mail_special_delivery_2500_rate'];
		} else if (this.config.has('shipping_royal_mail_special_delivery_2500_rate')) {
			data['shipping_royal_mail_special_delivery_2500_rate'] = this.config.get('shipping_royal_mail_special_delivery_2500_rate');
		} else {
			data['shipping_royal_mail_special_delivery_2500_rate'] = '0.1:9.40,0.5:10.15,1:11.45,2:14.00,10:29.60,20:44.20';
		}

		if ((this.request.post['shipping_royal_mail_special_delivery_2500_insurance'])) {
			data['shipping_royal_mail_special_delivery_2500_insurance'] = this.request.post['shipping_royal_mail_special_delivery_2500_insurance'];
		} else if (this.config.has('shipping_royal_mail_special_delivery_2500_insurance')) {
			data['shipping_royal_mail_special_delivery_2500_insurance'] = this.config.get('shipping_royal_mail_special_delivery_2500_insurance');
		} else {
			data['shipping_royal_mail_special_delivery_2500_insurance'] = '0:2500';
		}

		if ((this.request.post['shipping_royal_mail_special_delivery_2500_status'])) {
			data['shipping_royal_mail_special_delivery_2500_status'] = this.request.post['shipping_royal_mail_special_delivery_2500_status'];
		} else {
			data['shipping_royal_mail_special_delivery_2500_status'] = this.config.get('shipping_royal_mail_special_delivery_2500_status');
		}

		// 1st Class Signed
		if ((this.request.post['shipping_royal_mail_1st_class_signed_rate'])) {
			data['shipping_royal_mail_1st_class_signed_rate'] = this.request.post['shipping_royal_mail_1st_class_signed_rate'];
		} else if (this.config.has('shipping_royal_mail_1st_class_signed_rate')) {
			data['shipping_royal_mail_1st_class_signed_rate'] = this.config.get('shipping_royal_mail_1st_class_signed_rate');
		} else {
			data['shipping_royal_mail_1st_class_signed_rate'] = '0.1:2.03,0.25:2.34,0.5:2.75,0.75:3.48,1:6.75,2:10.00,5:16.95,10:23.00,20:34.50';
		}

		if ((this.request.post['shipping_royal_mail_1st_class_signed_status'])) {
			data['shipping_royal_mail_1st_class_signed_status'] = this.request.post['shipping_royal_mail_1st_class_signed_status'];
		} else {
			data['shipping_royal_mail_1st_class_signed_status'] = this.config.get('shipping_royal_mail_1st_class_signed_status');
		}

		// 2nd Class Signed
		if ((this.request.post['shipping_royal_mail_2nd_class_signed_rate'])) {
			data['shipping_royal_mail_2nd_class_signed_rate'] = this.request.post['shipping_royal_mail_2nd_class_signed_rate'];
		} else if (this.config.has('shipping_royal_mail_2nd_class_signed_rate')) {
			data['shipping_royal_mail_2nd_class_signed_rate'] = this.config.get('shipping_royal_mail_2nd_class_signed_rate');
		} else {
			data['shipping_royal_mail_2nd_class_signed_rate'] = '0.1:1.83,0.25:2.27,0.5:2.58,0.75:3.11,1:6.30,2:9.10,5:14.85,10:21.35,20:29.65';
		}

		if ((this.request.post['shipping_royal_mail_2nd_class_signed_status'])) {
			data['shipping_royal_mail_2nd_class_signed_status'] = this.request.post['shipping_royal_mail_2nd_class_signed_status'];
		} else {
			data['shipping_royal_mail_2nd_class_signed_status'] = this.config.get('shipping_royal_mail_2nd_class_signed_status');
		}

		// 1st Class Standard
		if ((this.request.post['shipping_royal_mail_1st_class_standard_rate'])) {
			data['shipping_royal_mail_1st_class_standard_rate'] = this.request.post['shipping_royal_mail_1st_class_standard_rate'];
		} else if (this.config.has('shipping_royal_mail_1st_class_standard_rate')) {
			data['shipping_royal_mail_1st_class_standard_rate'] = this.config.get('shipping_royal_mail_1st_class_standard_rate');
		} else {
			data['shipping_royal_mail_1st_class_standard_rate'] = '0.1:0.93,0.25:1.24,0.5:1.65,0.75:2.38,1:5.65,2:8.90,5:15.85,10:21.90,20:33.40';
		}

		if ((this.request.post['shipping_royal_mail_1st_class_standard_status'])) {
			data['shipping_royal_mail_1st_class_standard_status'] = this.request.post['shipping_royal_mail_1st_class_standard_status'];
		} else {
			data['shipping_royal_mail_1st_class_standard_status'] = this.config.get('shipping_royal_mail_1st_class_standard_status');
		}

		// 2nd Class Standard
		if ((this.request.post['shipping_royal_mail_2nd_class_standard_rate'])) {
			data['shipping_royal_mail_2nd_class_standard_rate'] = this.request.post['shipping_royal_mail_2nd_class_standard_rate'];
		} else if (this.config.has('shipping_royal_mail_2nd_class_standard_rate')) {
			data['shipping_royal_mail_2nd_class_standard_rate'] = this.config.get('shipping_royal_mail_2nd_class_standard_rate');
		} else {
			data['shipping_royal_mail_2nd_class_standard_rate'] = '0.1:0.73,.25:1.17,.5:1.48,.75:2.01,1:5.20,2:8.00,5:13.75,10:20.25,20:28.55';
		}

		if ((this.request.post['shipping_royal_mail_2nd_class_standard_status'])) {
			data['shipping_royal_mail_2nd_class_standard_status'] = this.request.post['shipping_royal_mail_2nd_class_standard_status'];
		} else {
			data['shipping_royal_mail_2nd_class_standard_status'] = this.config.get('shipping_royal_mail_2nd_class_standard_status');
		}

		// International Standard
		if ((this.request.post['shipping_royal_mail_international_standard_eu_rate'])) {
			data['shipping_royal_mail_international_standard_eu_rate'] = this.request.post['shipping_royal_mail_international_standard_eu_rate'];
		} else if (this.config.has('shipping_royal_mail_international_standard_eu_rate')) {
			data['shipping_royal_mail_international_standard_eu_rate'] = this.config.get('shipping_royal_mail_international_standard_eu_rate');
		} else {
			data['shipping_royal_mail_international_standard_eu_rate'] = '0.01:0.97,0.02:0.97,0.06:1.47,0.1:3.20,0.25:3.70,0.5:5.15,0.75:6.60,1.25:9.50,1.5:10.95,1.75:12.40,2:13.85';
		}

		if ((this.request.post['shipping_royal_mail_international_standard_zone_1_rate'])) {
			data['shipping_royal_mail_international_standard_zone_1_rate'] = this.request.post['shipping_royal_mail_international_standard_zone_1_rate'];
		} else if (this.config.has('shipping_royal_mail_international_standard_zone_1_rate')) {
			data['shipping_royal_mail_international_standard_zone_1_rate'] = this.config.get('shipping_royal_mail_international_standard_zone_1_rate');
		} else {
			data['shipping_royal_mail_international_standard_zone_1_rate'] = '0.01:0.97,0.02:1.28,0.06:2.15,0.1:3.80,0.25:4.75,0.5:7.45,0.75:10.15,1:12.85,1.25:15.55,1.5:18.25,1.75:20.95,2:23.65';
		}

		if ((this.request.post['shipping_royal_mail_international_standard_zone_2_rate'])) {
			data['shipping_royal_mail_international_standard_zone_2_rate'] = this.request.post['shipping_royal_mail_international_standard_zone_2_rate'];
		} else if (this.config.has('shipping_royal_mail_international_standard_zone_2_rate')) {
			data['shipping_royal_mail_international_standard_zone_2_rate'] = this.config.get('shipping_royal_mail_international_standard_zone_2_rate');
		} else {
			data['shipping_royal_mail_international_standard_zone_2_rate'] = '0.01:0.97,0.02:1.28,0.06:2.15,0.1:4.00,0.25:5.05,0.5:7.90,0.75:10.75,1:13.60,1.25:16.45,1.5:19.30,1.75:22.15,2:25.00';
		}

		if ((this.request.post['shipping_royal_mail_international_standard_status'])) {
			data['shipping_royal_mail_international_standard_status'] = this.request.post['shipping_royal_mail_international_standard_status'];
		} else {
			data['shipping_royal_mail_international_standard_status'] = this.config.get('shipping_royal_mail_international_standard_status');
		}

		// International Tracked & Signed
		if ((this.request.post['shipping_royal_mail_international_tracked_signed_eu_rate'])) {
			data['shipping_royal_mail_international_tracked_signed_eu_rate'] = this.request.post['shipping_royal_mail_international_tracked_signed_eu_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_signed_eu_rate')) {
			data['shipping_royal_mail_international_tracked_signed_eu_rate'] = this.config.get('shipping_royal_mail_international_tracked_signed_eu_rate');
		} else {
			data['shipping_royal_mail_international_tracked_signed_eu_rate'] = '0.02:5.97,0.06:6.47,0.1:8.20,0.25:8.70,0.50:10.15,0.75:11.60,1:13.05,1.25:14.50,1.5:15.95,1.75:17.40,2:18.85';
		}

		if ((this.request.post['shipping_royal_mail_international_tracked_signed_zone_1_rate'])) {
			data['shipping_royal_mail_international_tracked_signed_zone_1_rate'] = this.request.post['shipping_royal_mail_international_tracked_signed_zone_1_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_signed_zone_1_rate')) {
			data['shipping_royal_mail_international_tracked_signed_zone_1_rate'] = this.config.get('shipping_royal_mail_international_tracked_signed_zone_1_rate');
		} else {
			data['shipping_royal_mail_international_tracked_signed_zone_1_rate'] = '0.02:6.28,0.06:7.15,0.1:8.80,0.25:9.75,0.5:12.45,0.75:15.15,1:17.85,1.25:20.55,1.5:23.25,1.75:25.95,2:28.65';
		}

		if ((this.request.post['shipping_royal_mail_international_tracked_signed_zone_2_rate'])) {
			data['shipping_royal_mail_international_tracked_signed_zone_2_rate'] = this.request.post['shipping_royal_mail_international_tracked_signed_zone_2_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_signed_zone_2_rate')) {
			data['shipping_royal_mail_international_tracked_signed_zone_2_rate'] = this.config.get('shipping_royal_mail_international_tracked_signed_zone_2_rate');
		} else {
			data['shipping_royal_mail_international_tracked_signed_zone_2_rate'] = '0.02:6.28,0.06:7.15,0.1:9.00,0.25:10.05,0.5:12.90,0.75:15.75,1:18.60,1.25:21.45,1.5:24.30,1.75:27.15,2:30.00';
		}

		if ((this.request.post['shipping_royal_mail_international_tracked_signed_status'])) {
			data['shipping_royal_mail_international_tracked_signed_status'] = this.request.post['shipping_royal_mail_international_tracked_signed_status'];
		} else {
			data['shipping_royal_mail_international_tracked_signed_status'] = this.config.get('shipping_royal_mail_international_tracked_signed_status');
		}

		// International Tracked
		// Europe
		if ((this.request.post['shipping_royal_mail_international_tracked_eu_rate'])) {
			data['shipping_royal_mail_international_tracked_eu_rate'] = this.request.post['shipping_royal_mail_international_tracked_eu_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_eu_rate')) {
			data['shipping_royal_mail_international_tracked_eu_rate'] = this.config.get('shipping_royal_mail_international_tracked_eu_rate');
		} else {
			data['shipping_royal_mail_international_tracked_eu_rate'] = '0.02:7.16,0.06:7.76,0.1:9.84,0.25:10.44,0.5:12.18,0.75:13.92,1:15.66,1.25:17.40,1.5:19.14,1.75:20.88,2:22.62';
		}

		// International Tracked
		// Non Europe
		if ((this.request.post['shipping_royal_mail_international_tracked_non_eu_rate'])) {
			data['shipping_royal_mail_international_tracked_non_eu_rate'] = this.request.post['shipping_royal_mail_international_tracked_non_eu_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_non_eu_rate')) {
			data['shipping_royal_mail_international_tracked_non_eu_rate'] = this.config.get('shipping_royal_mail_international_tracked_non_eu_rate');
		} else {
			data['shipping_royal_mail_international_tracked_non_eu_rate'] = '0.02:5.97,0.06:6.47,0.1:8.20,0.25:8.70,0.5:10.15,0.75:11.60,1:13.05,1.25:14.50,1.5:15.95,1.75:17.40,2:18.85';
		}

		// International Tracked
		// World Zones 1
		if ((this.request.post['shipping_royal_mail_international_tracked_zone_1_rate'])) {
			data['shipping_royal_mail_international_tracked_zone_1_rate'] = this.request.post['shipping_royal_mail_international_tracked_zone_1_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_zone_1_rate')) {
			data['shipping_royal_mail_international_tracked_zone_1_rate'] = this.config.get('shipping_royal_mail_international_tracked_zone_1_rate');
		} else {
			data['shipping_royal_mail_international_tracked_zone_1_rate'] = '0.02:5.97,0.06:6.47,0.1:8.80,0.25:9.75,0.5:12.45,0.75:15.15,1:17.85,1.25:20.55,1.5:23.25,1.75:25.95,2:28.65';
		}

		// International Tracked
		// World Zones 2
		if ((this.request.post['shipping_royal_mail_international_tracked_zone_2_rate'])) {
			data['shipping_royal_mail_international_tracked_zone_2_rate'] = this.request.post['shipping_royal_mail_international_tracked_zone_2_rate'];
		} else if (this.config.has('shipping_royal_mail_international_tracked_zone_2_rate')) {
			data['shipping_royal_mail_international_tracked_zone_2_rate'] = this.config.get('shipping_royal_mail_international_tracked_zone_2_rate');
		} else {
			data['shipping_royal_mail_international_tracked_zone_2_rate'] = '0.02:6.28,0.06:7.15,0.1:9.00,0.25:10.05,0.5:12.90,0.75:15.75,1:18.60,1.25:21.45,1.5:24.30,1.75:27.15,2:30.00';
		}

		if ((this.request.post['shipping_royal_mail_international_tracked_status'])) {
			data['shipping_royal_mail_international_tracked_status'] = this.request.post['shipping_royal_mail_international_tracked_status'];
		} else {
			data['shipping_royal_mail_international_tracked_status'] = this.config.get('shipping_royal_mail_international_tracked_status');
		}

		// International Signed
		// Europe
		if ((this.request.post['shipping_royal_mail_international_signed_eu_rate'])) {
			data['shipping_royal_mail_international_signed_eu_rate'] = this.request.post['shipping_royal_mail_international_signed_eu_rate'];
		} else if (this.config.has('shipping_royal_mail_international_signed_eu_rate')) {
			data['shipping_royal_mail_international_signed_eu_rate'] = this.config.get('shipping_royal_mail_international_signed_eu_rate');
		} else {
			data['shipping_royal_mail_international_signed_eu_rate'] = '0.02:5.97,0.06:6.47,0.1:8.20,0.25:8.70,0.5:10.15,0.75:11.60,1:13.05,1.25:14.50,1.5:15.95,1.75:17.40,2:18.85';
		}

		// International Signed
		// World Zones 1
		if ((this.request.post['shipping_royal_mail_international_signed_zone_1_rate'])) {
			data['shipping_royal_mail_international_signed_zone_1_rate'] = this.request.post['shipping_royal_mail_international_signed_zone_1_rate'];
		} else if (this.config.has('shipping_royal_mail_international_signed_zone_1_rate')) {
			data['shipping_royal_mail_international_signed_zone_1_rate'] = this.config.get('shipping_royal_mail_international_signed_zone_1_rate');
		} else {
			data['shipping_royal_mail_international_signed_zone_1_rate'] = '0.02:6.28,0.06:7.15,0.1:8.80,0.25:9.75,0.5:12.45,0.75:15.15,1:17.85,1.25:20.55,1.5:23.25,1.75:25.95,2:28.65';
		}

		// International Signed
		// World Zones 2
		if ((this.request.post['shipping_royal_mail_international_signed_zone_2_rate'])) {
			data['shipping_royal_mail_international_signed_zone_2_rate'] = this.request.post['shipping_royal_mail_international_signed_zone_2_rate'];
		} else if (this.config.has('shipping_royal_mail_international_signed_zone_2_rate')) {
			data['shipping_royal_mail_international_signed_zone_2_rate'] = this.config.get('shipping_royal_mail_international_signed_zone_2_rate');
		} else {
			data['shipping_royal_mail_international_signed_zone_2_rate'] = '0.02:6.28,0.06:7.15,0.1:9.00,0.25:10.05,0.5:12.90,0.75:15.75,1:18.60,1.25:21.45,1.5:24.30,1.75:27.15,2:30.00';
		}

		if ((this.request.post['shipping_royal_mail_international_signed_status'])) {
			data['shipping_royal_mail_international_signed_status'] = this.request.post['shipping_royal_mail_international_signed_status'];
		} else {
			data['shipping_royal_mail_international_signed_status'] = this.config.get('shipping_royal_mail_international_signed_status');
		}

		// International Economy
		if ((this.request.post['shipping_royal_mail_international_economy_rate'])) {
			data['shipping_royal_mail_international_economy_rate'] = this.request.post['shipping_royal_mail_international_economy_rate'];
		} else if (this.config.has('shipping_royal_mail_international_economy_rate')) {
			data['shipping_royal_mail_international_economy_rate'] = this.config.get('shipping_royal_mail_international_economy_rate');
		} else {
			data['shipping_royal_mail_international_economy_rate'] = '0.02:0.81,0.06:1.43,0.1:2.80,0.25:3.65,0.5:5.10,0.75:6.55,1:8.00,1.25:9.45,1.5:10.90,1.75:12.35,2:13.80';
		}

		if ((this.request.post['shipping_royal_mail_international_economy_status'])) {
			data['shipping_royal_mail_international_economy_status'] = this.request.post['shipping_royal_mail_international_economy_status'];
		} else {
			data['shipping_royal_mail_international_economy_status'] = this.config.get('shipping_royal_mail_international_economy_status');
		}

		if ((this.request.post['shipping_royal_mail_display_weight'])) {
			data['shipping_royal_mail_display_weight'] = this.request.post['shipping_royal_mail_display_weight'];
		} else {
			data['shipping_royal_mail_display_weight'] = this.config.get('shipping_royal_mail_display_weight');
		}

		if ((this.request.post['shipping_royal_mail_display_insurance'])) {
			data['shipping_royal_mail_display_insurance'] = this.request.post['shipping_royal_mail_display_insurance'];
		} else {
			data['shipping_royal_mail_display_insurance'] = this.config.get('shipping_royal_mail_display_insurance');
		}

		if ((this.request.post['shipping_royal_mail_weight_class_id'])) {
			data['shipping_royal_mail_weight_class_id'] = this.request.post['shipping_royal_mail_weight_class_id'];
		} else {
			data['shipping_royal_mail_weight_class_id'] = this.config.get('shipping_royal_mail_weight_class_id');
		}

		this.load.model('localisation/weight_class',this);

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((this.request.post['shipping_royal_mail_tax_class_id'])) {
			data['shipping_royal_mail_tax_class_id'] = this.request.post['shipping_royal_mail_tax_class_id'];
		} else {
			data['shipping_royal_mail_tax_class_id'] = this.config.get('shipping_royal_mail_tax_class_id');
		}

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['shipping_royal_mail_geo_zone_id'])) {
			data['shipping_royal_mail_geo_zone_id'] = this.request.post['shipping_royal_mail_geo_zone_id'];
		} else {
			data['shipping_royal_mail_geo_zone_id'] = this.config.get('shipping_royal_mail_geo_zone_id');
		}

		this.load.model('localisation/geo_zone',this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['shipping_royal_mail_status'])) {
			data['shipping_royal_mail_status'] = this.request.post['shipping_royal_mail_status'];
		} else {
			data['shipping_royal_mail_status'] = this.config.get('shipping_royal_mail_status');
		}

		if ((this.request.post['shipping_royal_mail_sort_order'])) {
			data['shipping_royal_mail_sort_order'] = this.request.post['shipping_royal_mail_sort_order'];
		} else {
			data['shipping_royal_mail_sort_order'] = this.config.get('shipping_royal_mail_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/royal_mail', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/royal_mail')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}