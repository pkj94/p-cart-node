const gmdate = require("locutus/php/datetime/gmdate");
const mt_rand = require("locutus/php/math/mt_rand");
const pack = require("locutus/php/misc/pack");
const sha1 = require("locutus/php/strings/sha1");
const soap = require('soap');
const { create } = require('xmlbuilder2');

module.exports = class ModelExtensionShippingECShip extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/ec_ship');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + Number(this.config.get('shipping_ec_ship_geo_zone_id')) + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_ec_ship_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		//convert iso_code_3 to ec-ship country code
		const country_codes = {
			'AFG': 'AFA',
			'ALB': 'ALA',
			'DZA': 'DZA',
			'AND': 'ADA',
			'AGO': 'AOA',
			'AIA': 'AIA',
			'ATG': 'AGA',
			'ARG': 'ARA',
			'ARM': 'AMA',
			'ASC': 'ACA',
			'ABW': 'AWA',
			'AUT': 'ATA',
			'AZE': 'AZA',
			'BHS': 'BSA',
			'BHR': 'BHA',
			'BGD': 'BDA',
			'BRB': 'BBA',
			'BLR': 'BYA',
			'BEL': 'BEA',
			'BLZ': 'BZA',
			'BEN': 'BJA',
			'BMU': 'BMA',
			'BTN': 'BTA',
			'BOL': 'BOA',
			'BIH': 'BAA',
			'BWA': 'BWA',
			'BRA': 'BRA',
			'IOT': 'IOA',
			'BRN': 'BNA',
			'BGR': 'BGA',
			'BFA': 'BFA',
			'BDI': 'BIA',
			'KHM': 'KHA',
			'CMR': 'CMA',
			'CAN': 'CAA',
			'CPV': 'CVA',
			'CYM': 'KYA',
			'CAF': 'CFA',
			'TCD': 'TDA',
			'CHL': 'CLA',
			'CXR': 'CXA',
			'CCK': 'CCA',
			'COL': 'COA',
			'COM': 'KMA',
			'COG': 'CGA',
			'CRI': 'CRA',
			'CIV': 'CIA',
			'HRV': 'HRA',
			'CUB': 'CUA',
			'CYP': 'CYA',
			'CZE': 'CZA',
			'DNK': 'DKA',
			'DJI': 'DJA',
			'DMA': 'DMA',
			'DOM': 'DOA',
			'TLS': 'TPA',
			'ECU': 'ECA',
			'EGY': 'EGA',
			'SLV': 'SVA',
			'GNQ': 'GQA',
			'ERI': 'ERA',
			'EST': 'EEA',
			'ETH': 'ETA',
			'FLK': 'FKA',
			'FRO': 'FOA',
			'FJI': 'FJA',
			'FIN': 'FIA',
			'FRA': 'FRA',
			'GUF': 'GFA',
			'PYF': 'PFA',
			'GAB': 'GAA',
			'GMB': 'GMA',
			'GEO': 'GEA',
			'DEU': 'DEA',
			'GHA': 'GHA',
			'GIB': 'GIA',
			'GRC': 'GRA',
			'GRL': 'GLA',
			'GRD': 'GDA',
			'GUM': 'GUA',
			'GTM': 'GTA',
			'GIN': 'GNA',
			'GNB': 'GWA',
			'GUY': 'GYA',
			'HTI': 'HTA',
			'HND': 'HNA',
			'HKG': 'HKG',
			'HUN': 'HUA',
			'ISL': 'ISA',
			'IND': 'INA',
			'IDN': 'IDA',
			'IRN': 'IRA',
			'IRQ': 'IQA',
			'IRL': 'IEA',
			'ISR': 'ILA',
			'ITA': 'ITA',
			'JAM': 'JMA',
			'JPN': 'JPA',
			'JOR': 'JOA',
			'KAZ': 'KZA',
			'KEN': 'KEA',
			'KIR': 'KIA',
			'PRK': 'KPA',
			'KOR': 'KRA',
			'KWT': 'KWA',
			'KGZ': 'KGA',
			'LAO': 'LAA',
			'LVA': 'LVA',
			'LBN': 'LBA',
			'LSO': 'LSA',
			'LBR': 'LRA',
			'LBY': 'LYA',
			'LIE': 'LIA',
			'LTU': 'LTA',
			'LUX': 'LUA',
			'MAC': 'MOA',
			'MDG': 'MGA',
			'MWI': 'MWA',
			'MDV': 'MVA',
			'MLI': 'MLA',
			'MLT': 'MTA',
			'MHL': 'MHA',
			'MRT': 'MRA',
			'MUS': 'MUA',
			'MEX': 'MXA',
			'MDA': 'MDA',
			'MCO': 'MCA',
			'MNG': 'MNA',
			'MNE': 'MEA',
			'MSR': 'MSA',
			'MAR': 'MAA',
			'MOZ': 'MZA',
			'MMR': 'MMA',
			'NAM': 'NAA',
			'NRU': 'NRA',
			'NPL': 'NPA',
			'NLD': 'NLA',
			'ANT': 'ANA',
			'NCL': 'NCA',
			'NZL': 'NZA',
			'NIC': 'NIA',
			'NER': 'NEA',
			'NGA': 'NGA',
			'NFK': 'NFA',
			'NOR': 'NOA',
			'OMN': 'OMA',
			'PAK': 'PKA',
			'PAN': 'PAA',
			'PNG': 'PGA',
			'PRY': 'PYA',
			'PER': 'PEA',
			'PHL': 'PHA',
			'PCN': 'PNA',
			'POL': 'PLA',
			'PRT': 'PTA',
			'PRI': 'PRA',
			'QAT': 'QAA',
			'REU': 'REA',
			'ROM': 'ROA',
			'RUS': 'RUA',
			'RWA': 'RWA',
			'ASM': 'ASA',
			'SMR': 'SMA',
			'STP': 'STA',
			'SAU': 'SAA',
			'SEN': 'SNA',
			'SRB': 'RSA',
			'SYC': 'SCA',
			'SLE': 'SLA',
			'SGP': 'SGA',
			'SVK': 'SKA',
			'SVN': 'SIA',
			'SLB': 'SBA',
			'SOM': 'SOA',
			'ZAF': 'ZAA',
			'ESP': 'ESA',
			'LKA': 'LKA',
			'KNA': 'KNA',
			'SHN': ['SHA', 'TAA'],
			'LCA': 'LCA',
			'SPM': 'PMA',
			'VCT': 'VCA',
			'SDN': 'SDA',
			'SUR': 'SRA',
			'SWZ': 'SZA',
			'SWE': 'SEA',
			'CHE': 'CHA',
			'SYR': 'SYA',
			'TWN': 'TWA',
			'TJK': 'TJA',
			'TZA': 'TZA',
			'THA': 'THA',
			'TGO': 'TGA',
			'TON': 'TOA',
			'TTO': 'TTA',
			'TUN': 'TNA',
			'TUR': 'TRA',
			'TKM': 'TMA',
			'TCA': 'TCA',
			'TUV': 'TVA',
			'UGA': 'UGA',
			'UKR': 'UAA',
			'ARE': 'AEA',
			'GBR': 'GBA',
			'URY': 'UYA',
			'UZB': 'UZA',
			'VUT': 'VUA',
			'VAT': 'VAA',
			'VEN': 'VEA',
			'VNM': 'VNA',
			'VIA': 'VIA',
			'WLF': 'WFA',
			'YEM': 'YEA',
			'ZMB': 'ZMA',
			'ZWE': 'ZWA',
			'AUS': {
				'WA': 'AUA',
				'OTHERS': 'AUB',
			},
			'CHN': {
				'BE': 'CNA',
				'FU': ['CNB', 'CNJ'],
				'GU': 'CNC',
				'ZH': 'CND',
				'YU': 'CNE',
				'SG': 'CNF',
				'OTHERS': 'CNG',
				'TI': 'CNH',
			},
			'MYS': {
				'OTHERS': 'MYA',
				'MY-12': 'MYB',
				'MY-13': 'MYC',
			},
			'USA': {
				'HI': 'USA',
				'NY': 'USB',
				'OTHERS': 'USC',
			}
		};

		const service = {
			'ARM': this.config.get('shipping_ec_ship_air_registered_mail'),
			'APL': this.config.get('shipping_ec_ship_air_parcel'),
			'AEP': this.config.get('shipping_ec_ship_e_express_service_to_us'),
			'AEC': this.config.get('shipping_ec_ship_e_express_service_to_canada'),
			'AEG': this.config.get('shipping_ec_ship_e_express_service_to_united_kingdom'),
			'AER': this.config.get('shipping_ec_ship_e_express_service_to_russia'),
			'AE1': this.config.get('shipping_ec_ship_e_express_service_one'),
			'AE2': this.config.get('shipping_ec_ship_e_express_service_two'),
			'EMS': this.config.get('shipping_ec_ship_speed_post'),
			'SMP': this.config.get('shipping_ec_ship_smart_post'),
			'LCP': this.config.get('shipping_ec_ship_local_courier_post'),
			'LPL': this.config.get('shipping_ec_ship_local_parcel')
		};

		//Countries available service
		const shipCode = {
			'AUS': {
				'AE2': this.language.get('text_e_express_service_two'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},
			'NZL': {
				'AE2': this.language.get('text_e_express_service_two'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'KOR': {
				'AE2': this.language.get('text_e_express_service_two'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'SGP': {
				'AE2': this.language.get('text_e_express_service_two'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'VNM': {
				'AE2': this.language.get('text_e_express_service_two'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'DEU': {
				'AE1': this.language.get('text_e_express_service_one'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'FRA': {
				'AE1': this.language.get('text_e_express_service_one'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'NOR': {
				'AE1': this.language.get('text_e_express_service_one'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'RUS': {
				'AER': this.language.get('text_e_express_service_to_russia'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'GBR': {
				'AEG': this.language.get('text_e_express_service_to_united_kingdom'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'CAN': {
				'AEC': this.language.get('text_e_express_service_to_canada'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'USA': {
				'AEP': this.language.get('text_e_express_service_to_us'),
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			},

			'HKG': {
				'SMP': this.language.get('text_smart_post'),
				'LCP': this.language.get('text_local_courier_post'),
				'LPL': this.language.get('text_local_parcel')
			},

			'OTHERS': {
				'ARM': this.language.get('text_air_registered_mail'),
				'APL': this.language.get('text_air_parcel'),
				'EMS': this.language.get('text_speed_post')
			}
		};

		const method_data = {};
		let error = '';

		if (status) {
			let weight = this.weight.convert(await this.cart.getWeight(), this.config.get('config_weight_class_id'), this.config.get('shipping_ec_ship_weight_class_id'));
			let weight_code = (this.weight.getUnit(this.config.get('shipping_ec_ship_weight_class_id'))).toLowerCase();

			weight = (weight < 0.1 ? 0.1 : weight);

			const address_from = {
				'country': "HKG",
				'contact_name': this.config.get('config_owner'),
				'phone': this.config.get('config_telephone'),
				'email': this.config.get('config_email'),
				'company_name': this.config.get('config_name')
			};

			const address_to = {
				'country': '',
				'contact_name': address['firstname'] + ' ' + address['lastname'],
				'company_name': address['company'],
				'code': ''
			};

			for (let [key, value] of Object.entries(shipCode)) {
				if (address['iso_code_3'] == key) {
					address_to['code'] = shipCode[key];
					break;
				} else {
					address_to['code'] = shipCode['OTHERS'];
				}
			}

			for (let [key, value] of Object.entries(service)) {
				if (!(service[key])) {
					delete address_to['code'][key];
				}
			}

			if ((country_codes[address['iso_code_3']]) && Array.isArray(country_codes[address['iso_code_3']])) {
				for (let [key, value] of Object.entries(country_codes[address['iso_code_3']])) {
					if (address['zone_code'] == key) {
						address_to['country'] = country_codes[address['iso_code_3']][address['zone_code']];
						break;
					} else {
						address_to['country'] = country_codes[address['iso_code_3']]['OTHERS'];
					}
				}
			} else if ((country_codes[address['iso_code_3']])) {
				address_to['country'] = country_codes[address['iso_code_3']];
			} else {
				error = this.language.get('text_unavailable');
			}

			let url = 'https://service.hongkongpost.hk/API-trial/services/Calculator?wsdl';

			// Creating date using yyyy-mm-ddThh:mm:ssZ format
			let tm_created = gmdate('Y-m-d\TH:i:s\Z');
			let tm_expires = gmdate('Y-m-d\TH:i:s\Z', gmdate('U') + 180);


			// Generating, packing and encoding a random number
			let simple_nonce = mt_rand();
			let encoded_nonce = atob(pack('H*', simple_nonce));


			let username = this.config.get('shipping_ec_ship_api_username');
			let password = this.config.get('shipping_ec_ship_api_key');
			let passdigest = atob(pack('H*', sha1(pack('H*', simple_nonce) + pack('a*', tm_created) + pack('a*', password))));


			// Initializing namespaces
			let ns_wsse = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd';
			let ns_wsu = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd';
			let password_type = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest';
			let encoding_type = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary';

			// Creating WSS identification header using SimpleXML
			const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('root').ele('wsse:Security', { xmlns: ns_wsse }).ele('wsse:UsernameToken').ele('wsse:Username').txt(username).up().ele('wsse:Password', { Type: passwordType }).txt(password).up().ele('wsse:Nonce', { EncodingType: encodingType }).txt(nonce).up().ele('wsu:Created', { xmlns: ns_wsu }).txt(created).end();
			const auth = root.toString({ prettyPrint: true });
			// Create a SOAP client 
			const client = await soap.createClientAsync(url); // Add WS-Security header 
			const wsSecurityHeader = {
				Security:
				{
					UsernameToken: {
						Username: username,
						Password: { _: password, $: { Type: passwordType } },
						Nonce: { _: nonce, $: { EncodingType: encodingType } },
						Created: created
					},
				},
			};
			client.addSoapHeader(wsSecurityHeader, '', 'wsse', ns_wsse);

			const request = {
				'ecshipUsername': this.config.get('shipping_ec_ship_username'),
				'integratorUsername': this.config.get('shipping_ec_ship_api_username'),
				'countryCode': address_to['country'],
				'shipCode': '',
				'weight': weight
			};

			const objResponseArray = {};

			for (let [key, value] of Object.entries(address_to['code'])) {
				const api01Req = { ecshipUsername: request['ecshipUsername'], integratorUsername: request['integratorUsername'], countryCode: request['countryCode'], shipCode: key, weight: request['weight'] };
				const params = { "api01Req": api01Req };
				objResponse = client("getTotalPostage", array(params));
				const [objResponse] = await client.getTotalPostageAsync(params);
				const responseJson = JSON.parse(JSON.stringify(objResponse));
				responseJson.getTotalPostageReturn.serviceName = value;
				objResponseArray.push(responseJson);
			}

			if (objResponseArray.length) {
				let code = 'ec_ship';
				const quote_data = {};

				for (let [key, value] of Object.entries(objResponseArray)) {
					if (value['getTotalPostageReturn']['status'] == 0) {
						quote_data[key] = {
							'code': 'ec_ship.' + key,
							'title': value['getTotalPostageReturn']['serviceName'],
							'cost': value['getTotalPostageReturn']['totalPostage'],
							'tax_class_id': this.config.get('shipping_ec_ship_tax_class_id'),
							'text': this.currency.format(this.tax.calculate(this.currency.convert(value['getTotalPostageReturn']['totalPostage'], 'HKD', this.session.data['currency']), this.config.get('shipping_ec_ship_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'], 1.0000000)
						};
					}
				}
			}
			if (Object.keys(quote_data).length || error) {
				method_data = {
					'code': 'ec_ship',
					'title': this.language.get('text_title'),
					'quote': quote_data,
					'sort_order': this.config.get('shipping_ec_ship_sort_order'),
					'error': error
				};
			}
		}
		return method_data;
	}
}

