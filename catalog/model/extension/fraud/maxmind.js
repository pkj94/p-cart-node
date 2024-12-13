module.exports = class ModelExtensionFraudMaxMind extends Model {
	async check(order_info) {
		let risk_score = 0;

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "maxmind` WHERE order_id = '" + order_info['order_id'] + "'");

		if (query.num_rows) {
			risk_score = query.row['risk_score'];
		} else {
			/*
			maxmind api
			http://www.maxmind.com/app/ccv

			paypal api
			https://cms.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=developer/e_howto_html_IPNandPDTVariables
			*/

			let request = 'i=' + encodeURIComponent(order_info['ip']);
			request += '&city=' + encodeURIComponent(order_info['payment_city']);
			request += '&region=' + encodeURIComponent(order_info['payment_zone']);
			request += '&postal=' + encodeURIComponent(order_info['payment_postcode']);
			request += '&country=' + encodeURIComponent(order_info['payment_country']);
			request += '&domain=' + encodeURIComponent(utf8_substr(strrchr(order_info['email'], '@'), 1));
			request += '&custPhone=' + encodeURIComponent(order_info['telephone']);
			request += '&license_key=' + encodeURIComponent(this.config.get('fraud_maxmind_key'));

			if (order_info['shipping_method']) {
				request += '&shipAddr=' + encodeURIComponent(order_info['shipping_address_1']);
				request += '&shipCity=' + encodeURIComponent(order_info['shipping_city']);
				request += '&shipRegion=' + encodeURIComponent(order_info['shipping_zone']);
				request += '&shipPostal=' + encodeURIComponent(order_info['shipping_postcode']);
				request += '&shipCountry=' + encodeURIComponent(order_info['shipping_country']);
			}

			request += '&user_agent=' + encodeURIComponent(order_info['user_agent']);
			request += '&forwardedIP=' + encodeURIComponent(order_info['forwarded_ip']);
			request += '&emailMD5=' + encodeURIComponent(md5(utf8_strtolower(order_info['email'])));
			//request += '&passwordMD5=' + encodeURIComponent(order_info['password']);
			request += '&accept_language=' + encodeURIComponent(order_info['accept_language']);
			request += '&order_amount=' + encodeURIComponent(this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false));
			request += '&order_currency=' + encodeURIComponent(order_info['currency_code']);

			try {
				const response = await axios.get('https://minfraud1.maxmind.com/app/ccv2r', { params: request, timeout: 30000 });
				const json = response.data;
				console.log(json);

				risk_score = 0;

				if (response) {
					let order_id = order_info['order_id'];
					let customer_id = order_info['customer_id'];

					const response_info = {};

					const parts = response.split(';');

					for (let part of parts) {
						const [key, value] = part.split('=');

						response_info[key] = value;
					}
					let country_match = '';
					if ((response_info['countryMatch'])) {
						country_match = response_info['countryMatch'];
					}
					let country_code = '';
					if ((response_info['countryCode'])) {
						country_code = response_info['countryCode'];
					}
					let high_risk_country = '';
					if ((response_info['highRiskCountry'])) {
						high_risk_country = response_info['highRiskCountry'];
					}
					let distance = '';
					if ((response_info['distance'])) {
						distance = response_info['distance'];
					}
					let ip_region = '';
					if ((response_info['ip_region'])) {
						ip_region = response_info['ip_region'];
					}
					let ip_city = '';
					if ((response_info['ip_city'])) {
						ip_city = response_info['ip_city'];
					}
					let ip_latitude = '';
					if ((response_info['ip_latitude'])) {
						ip_latitude = response_info['ip_latitude'];
					}
					let ip_longitude = '';
					if ((response_info['ip_longitude'])) {
						ip_longitude = response_info['ip_longitude'];
					}
					let ip_isp = '';
					if ((response_info['ip_isp'])) {
						ip_isp = response_info['ip_isp'];
					}
					let ip_org = '';
					if ((response_info['ip_org'])) {
						ip_org = response_info['ip_org'];
					}
					let ip_asnum = '';
					if ((response_info['ip_asnum'])) {
						ip_asnum = response_info['ip_asnum'];
					}
					let ip_user_type = '';
					if ((response_info['ip_userType'])) {
						ip_user_type = response_info['ip_userType'];
					}
					let ip_country_confidence = '';
					if ((response_info['ip_countryConf'])) {
						ip_country_confidence = response_info['ip_countryConf'];
					}
					let ip_region_confidence = '';
					if ((response_info['ip_regionConf'])) {
						ip_region_confidence = response_info['ip_regionConf'];
					}
					let ip_city_confidence = '';
					if ((response_info['ip_cityConf'])) {
						ip_city_confidence = response_info['ip_cityConf'];
					}
					let ip_postal_confidence = '';
					if ((response_info['ip_postalConf'])) {
						ip_postal_confidence = response_info['ip_postalConf'];
					}
					let ip_postal_code = '';
					if ((response_info['ip_postalCode'])) {
						ip_postal_code = response_info['ip_postalCode'];
					}
					let ip_accuracy_radius = '';
					if ((response_info['ip_accuracyRadius'])) {
						ip_accuracy_radius = response_info['ip_accuracyRadius'];
					}
					let ip_net_speed_cell = '';
					if ((response_info['ip_netSpeedCell'])) {
						ip_net_speed_cell = response_info['ip_netSpeedCell'];
					}
					let ip_metro_code = '';
					if ((response_info['ip_metroCode'])) {
						ip_metro_code = response_info['ip_metroCode'];
					}
					let ip_area_code = '';
					if ((response_info['ip_areaCode'])) {
						ip_area_code = response_info['ip_areaCode'];
					}
					let ip_time_zone = '';
					if ((response_info['ip_timeZone'])) {
						ip_time_zone = response_info['ip_timeZone'];
					}
					let ip_region_name = '';
					if ((response_info['ip_regionName'])) {
						ip_region_name = response_info['ip_regionName'];
					}
					let ip_domain = '';
					if ((response_info['ip_domain'])) {
						ip_domain = response_info['ip_domain'];
					}
					let ip_country_name = '';
					if ((response_info['ip_countryName'])) {
						ip_country_name = response_info['ip_countryName'];
					}
					let ip_continent_code = '';
					if ((response_info['ip_continentCode'])) {
						ip_continent_code = response_info['ip_continentCode'];
					}
					let ip_corporate_proxy = '';
					if ((response_info['ip_corporateProxy'])) {
						ip_corporate_proxy = response_info['ip_corporateProxy'];
					}
					let anonymous_proxy = '';
					if ((response_info['anonymousProxy'])) {
						anonymous_proxy = response_info['anonymousProxy'];
					}
					let proxy_score = '';
					if ((response_info['proxyScore'])) {
						proxy_score = response_info['proxyScore'];
					}
					let is_trans_proxy = '';
					if ((response_info['isTransProxy'])) {
						is_trans_proxy = response_info['isTransProxy'];
					}
					let free_mail = '';
					if ((response_info['freeMail'])) {
						free_mail = response_info['freeMail'];
					}
					let carder_email = '';
					if ((response_info['carderEmail'])) {
						carder_email = response_info['carderEmail'];
					}
					let high_risk_username = '';
					if ((response_info['highRiskUsername'])) {
						high_risk_username = response_info['highRiskUsername'];
					}
					let high_risk_password = '';
					if ((response_info['highRiskPassword'])) {
						high_risk_password = response_info['highRiskPassword'];
					}
					let bin_match = '';
					if ((response_info['binMatch'])) {
						bin_match = response_info['binMatch'];
					}
					let bin_country = '';
					if ((response_info['binCountry'])) {
						bin_country = response_info['binCountry'];
					}
					let bin_name_match = '';
					if ((response_info['binNameMatch'])) {
						bin_name_match = response_info['binNameMatch'];
					}
					let bin_name = '';
					if ((response_info['binName'])) {
						bin_name = response_info['binName'];
					}
					let bin_phone_match = '';
					if ((response_info['binPhoneMatch'])) {
						bin_phone_match = response_info['binPhoneMatch'];
					}
					let bin_phone = '';
					if ((response_info['binPhone'])) {
						bin_phone = response_info['binPhone'];
					}
					let customer_phone_in_billing_location = '';
					if ((response_info['custPhoneInBillingLoc'])) {
						customer_phone_in_billing_location = response_info['custPhoneInBillingLoc'];
					}
					let ship_forward = '';
					if ((response_info['shipForward'])) {
						ship_forward = response_info['shipForward'];
					}
					let city_postal_match = '';
					if ((response_info['cityPostalMatch'])) {
						city_postal_match = response_info['cityPostalMatch'];
					}
					let ship_city_postal_match = '';
					if ((response_info['shipCityPostalMatch'])) {
						ship_city_postal_match = response_info['shipCityPostalMatch'];
					}
					let score = '';
					if ((response_info['score'])) {
						score = response_info['score'];
					}
					let explanation = '';
					if ((response_info['explanation'])) {
						explanation = response_info['explanation'];
					}
					let risk_score = '';
					if ((response_info['riskScore'])) {
						risk_score = response_info['riskScore'];
					}
					let queries_remaining = '';
					if ((response_info['queriesRemaining'])) {
						queries_remaining = response_info['queriesRemaining'];
					}
					let maxmind_id = '';
					if ((response_info['maxmindID'])) {
						maxmind_id = response_info['maxmindID'];
					}
					let error = '';
					if ((response_info['err'])) {
						error = response_info['err'];
					}

					await this.db.query("INSERT INTO `" + DB_PREFIX + "maxmind` SET order_id = '" + order_id + "', customer_id = '" + customer_id + "', country_match = '" + this.db.escape(country_match) + "', country_code = '" + this.db.escape(country_code) + "', high_risk_country = '" + this.db.escape(high_risk_country) + "', distance = '" + distance + "', ip_region = '" + this.db.escape(ip_region) + "', ip_city = '" + this.db.escape(ip_city) + "', ip_latitude = '" + this.db.escape(ip_latitude) + "', ip_longitude = '" + this.db.escape(ip_longitude) + "', ip_isp = '" + this.db.escape(ip_isp) + "', ip_org = '" + this.db.escape(ip_org) + "', ip_asnum = '" + ip_asnum + "', ip_user_type = '" + this.db.escape(ip_user_type) + "', ip_country_confidence = '" + this.db.escape(ip_country_confidence) + "', ip_region_confidence = '" + this.db.escape(ip_region_confidence) + "', ip_city_confidence = '" + this.db.escape(ip_city_confidence) + "', ip_postal_confidence = '" + this.db.escape(ip_postal_confidence) + "', ip_postal_code = '" + this.db.escape(ip_postal_code) + "', ip_accuracy_radius = '" + ip_accuracy_radius + "', ip_net_speed_cell = '" + this.db.escape(ip_net_speed_cell) + "', ip_metro_code = '" + ip_metro_code + "', ip_area_code = '" + ip_area_code + "', ip_time_zone = '" + this.db.escape(ip_time_zone) + "', ip_region_name = '" + this.db.escape(ip_region_name) + "', ip_domain = '" + this.db.escape(ip_domain) + "', ip_country_name = '" + this.db.escape(ip_country_name) + "', ip_continent_code = '" + this.db.escape(ip_continent_code) + "', ip_corporate_proxy = '" + this.db.escape(ip_corporate_proxy) + "', anonymous_proxy = '" + this.db.escape(anonymous_proxy) + "', proxy_score = '" + proxy_score + "', is_trans_proxy = '" + this.db.escape(is_trans_proxy) + "', free_mail = '" + this.db.escape(free_mail) + "', carder_email = '" + this.db.escape(carder_email) + "', high_risk_username = '" + this.db.escape(high_risk_username) + "', high_risk_password = '" + this.db.escape(high_risk_password) + "', bin_match = '" + this.db.escape(bin_match) + "', bin_country = '" + this.db.escape(bin_country) + "',  bin_name_match = '" + this.db.escape(bin_name_match) + "', bin_name = '" + this.db.escape(bin_name) + "', bin_phone_match = '" + this.db.escape(bin_phone_match) + "', bin_phone = '" + this.db.escape(bin_phone) + "', customer_phone_in_billing_location = '" + this.db.escape(customer_phone_in_billing_location) + "', ship_forward = '" + this.db.escape(ship_forward) + "', city_postal_match = '" + this.db.escape(city_postal_match) + "', ship_city_postal_match = '" + this.db.escape(ship_city_postal_match) + "', score = '" + score + "', explanation = '" + this.db.escape(explanation) + "', risk_score = '" + risk_score + "', queries_remaining = '" + queries_remaining + "', maxmind_id = '" + this.db.escape(maxmind_id) + "', error = '" + this.db.escape(error) + "', date_added = NOW()");
				}

			} catch (e) {

			}
		}

		if (risk_score > this.config.get('fraud_maxmind_score') && this.config.get('fraud_maxmind_key')) {
			return this.config.get('maxmind_order_status_id');
		}
	}
}
