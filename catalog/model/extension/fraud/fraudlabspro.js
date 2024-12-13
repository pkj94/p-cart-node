const sha1 = require('locutus/php/strings/sha1');

module.exports = class FraudLabsPro extends Controller {
	constructor(config, db) {
		this.config = config;
		this.db = db;
	}

	async check(data) {
		// Do not perform fraud check if FraudLabs Pro is disabled or API key is not provided.
		if (!this.config.fraud_fraudlabspro_status || !this.config.fraud_fraudlabspro_key) {
			return;
		}

		let riskScore = 0;

		const query = await this.db.query(`SELECT * FROM fraudlabspro WHERE order_id = ${parseInt(data.order_id)}`);

		// Do not call FraudLabs Pro API if order is already screened.
		if (query.rows.length) {
			return;
		}

		let ip = data.ip;

		// Detect client IP if store is behind CloudFlare protection.
		if (process.env.HTTP_CF_CONNECTING_IP && this.validateIP(process.env.HTTP_CF_CONNECTING_IP)) {
			ip = process.env.HTTP_CF_CONNECTING_IP;
		}

		// Get real client IP if they are behind proxy server.
		if (process.env.HTTP_X_FORWARDED_FOR && this.validateIP(process.env.HTTP_X_FORWARDED_FOR)) {
			ip = process.env.HTTP_X_FORWARDED_FOR;
		}

		// Overwrite client IP if simulate IP is provided.
		if (this.validateIP(this.config.fraud_fraudlabspro_simulate_ip)) {
			ip = this.config.fraud_fraudlabspro_simulate_ip;
		}

		const request = {
			key: this.config.fraud_fraudlabspro_key,
			ip: ip,
			first_name: data.firstname,
			last_name: data.lastname,
			bill_city: data.payment_city,
			bill_state: data.payment_zone,
			bill_country: data.payment_iso_code_2,
			bill_zip_code: data.payment_postcode,
			email_domain: data.email.split('@').pop(),
			user_phone: data.telephone,
			email: data.email,
			email_hash: this.hashIt(data.email),
			amount: data.total.toFixed(2),
			quantity: 1,
			currency: data.currency_code,
			payment_mode: data.payment_code,
			user_order_id: data.order_id,
			flp_checksum: process.env.FLP_CHECKSUM || '',
			format: 'json',
			source: 'opencart',
			source_version: '2.1.0.2'
		};

		if (data.shipping_method) {
			request.ship_addr = data.shipping_address_1;
			request.ship_city = data.shipping_city;
			request.ship_state = data.shipping_zone;
			request.ship_zip_code = data.shipping_postcode;
			request.ship_country = data.shipping_iso_code_2;
		}

		try {
			const response = await require('axios').get('https://api.fraudlabspro.com/v1/order/screen', {
				params: request,
				timeout: 30000
			});

			const json = response.data;

			if (json) {
				await this.db.query(`
                    REPLACE INTO fraudlabspro SET 
                    order_id = ${parseInt(data.order_id)},
                    is_country_match = '${json.is_country_match}',
                    is_high_risk_country = '${json.is_high_risk_country}',
                    distance_in_km = '${json.distance_in_km}',
                    distance_in_mile = '${json.distance_in_mile}',
                    ip_country = '${json.ip_country}',
                    ip_region = '${json.ip_region}',
                    ip_city = '${json.ip_city}',
                    ip_continent = '${json.ip_continent}',
                    ip_latitude = '${json.ip_latitude}',
                    ip_longitude = '${json.ip_longitude}',
                    ip_timezone = '${json.ip_timezone}',
                    ip_elevation = '${json.ip_elevation}',
                    ip_domain = '${json.ip_domain}',
                    ip_mobile_mnc = '${json.ip_mobile_mnc}',
                    ip_mobile_mcc = '${json.ip_mobile_mcc}',
                    ip_mobile_brand = '${json.ip_mobile_brand}',
                    ip_netspeed = '${json.ip_netspeed}',
                    ip_isp_name = '${json.ip_isp_name}',
                    ip_usage_type = '${json.ip_usage_type}',
                    is_free_email = '${json.is_free_email}',
                    is_new_domain_name = '${json.is_new_domain_name}',
                    is_proxy_ip_address = '${json.is_proxy_ip_address}',
                    is_bin_found = '${json.is_bin_found}',
                    is_bin_country_match = '${json.is_bin_country_match}',
                    is_bin_name_match = '${json.is_bin_name_match}',
                    is_bin_phone_match = '${json.is_bin_phone_match}',
                    is_bin_prepaid = '${json.is_bin_prepaid}',
                    is_address_ship_forward = '${json.is_address_ship_forward}',
                    is_bill_ship_city_match = '${json.is_bill_ship_city_match}',
                    is_bill_ship_state_match = '${json.is_bill_ship_state_match}',
                    is_bill_ship_country_match = '${json.is_bill_ship_country_match}',
                    is_bill_ship_postal_match = '${json.is_bill_ship_postal_match}',
                    is_ip_blacklist = '${json.is_ip_blacklist}',
                    is_email_blacklist = '${json.is_email_blacklist}',
                    is_credit_card_blacklist = '${json.is_credit_card_blacklist}',
                    is_device_blacklist = '${json.is_device_blacklist}',
                    is_user_blacklist = '${json.is_user_blacklist}',
                    fraudlabspro_score = '${json.fraudlabspro_score}',
                    fraudlabspro_distribution = '${json.fraudlabspro_distribution}',
                    fraudlabspro_status = '${json.fraudlabspro_status}',
                    fraudlabspro_id = '${json.fraudlabspro_id}',
                    fraudlabspro_error = '${json.fraudlabspro_error_code}',
                    fraudlabspro_message = '${json.fraudlabspro_message}',
                    fraudlabspro_credits = '${json.fraudlabspro_credits}',
                    api_key = '${this.config.fraud_fraudlabspro_key}',
                    ip_address = '${ip}'
                `);

				riskScore = parseInt(json.fraudlabspro_score, 10);
			}

			// Do not perform any action if error found
			if (json.fraudlabspro_error_code) {
				return;
			}

			if (riskScore > this.config.fraud_fraudlabspro_score) {
				return this.config.fraud_fraudlabspro_order_status_id;
			}

			if (json.fraudlabspro_status === 'REVIEW') {
				return this.config.fraud_fraudlabspro_review_status_id;
			}

			if (json.fraudlabspro_status === 'APPROVE') {
				return this.config.fraud_fraudlabspro_approve_status_id;
			}

			if (json.fraudlabspro_status === 'REJECT') {
				return this.config.fraud_fraudlabspro_reject_status_id;
			}

		} catch (error) {
			console.error('Error in FraudLabs Pro API call:', error);
		}
	}

	validateIP(ip) {
		const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return regex.test(ip);
	}

	hashIt(s) {
		let hash = 'fraudlabspro_' + s;
		for (let i = 0; i < 65536; i++) {
			hash = sha1('fraudlabspro_' + hash);
		}
		return hash;
	}
}