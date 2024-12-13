const { parseStringPromise } = require('xml2js');
module.exports = class ModelExtensionShippingUsps extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/usps');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + Number(this.config.get('shipping_usps_geo_zone_id')) + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_usps_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let weight = this.weight.convert(await this.cart.getWeight(), this.config.get('config_weight_class_id'), this.config.get('shipping_usps_weight_class_id'));

		// 70 pound limit
		if (weight > 70) {
			status = false;
		}

		let method_data = {};

		if (status) {
			this.load.model('localisation/country', this);

			const quote_data = {};

			weight = (weight < 0.1 ? 0.1 : weight);
			let pounds = Math.floor(weight);
			let ounces = Math.round(16 * (weight - pounds), 2); // max 5 digits

			let postcode = address['postcode'].replaceAll(' ', '');
			let request = '';
			if (address['iso_code_2'] == 'US') {
				let xml = '<RateV4Request USERID="' + this.config.get('shipping_usps_user_id') + '">';
				xml += '	<Package ID="1">';
				xml += '		<Service>ALL</Service>';
				xml += '		<ZipOrigination>' + this.config.get('shipping_usps_postcode').substr(0, 5) + '</ZipOrigination>';
				xml += '		<ZipDestination>' + postcode.substr(0, 5) + '</ZipDestination>';
				xml += '		<Pounds>' + pounds + '</Pounds>';
				xml += '		<Ounces>' + ounces + '</Ounces>';

				// Prevent common size mismatch error from USPS (Size cannot be Regular if Container is Rectangular for some reason)
				if (this.config.get('shipping_usps_container') == 'RECTANGULAR' && this.config.get('shipping_usps_size') == 'REGULAR') {
					this.config.set('shipping_usps_container', 'VARIABLE');
				}

				xml += '		<Container>' + this.config.get('shipping_usps_container') + '</Container>';
				xml += '		<Size>' + this.config.get('shipping_usps_size') + '</Size>';
				xml += '		<Width>' + this.config.get('shipping_usps_width') + '</Width>';
				xml += '		<Length>' + this.config.get('shipping_usps_length') + '</Length>';
				xml += '		<Height>' + this.config.get('shipping_usps_height') + '</Height>';

				// Calculate girth based on usps calculation
				xml += '		<Girth>' + (Math.round((this.config.get('shipping_usps_length') + this.config.get('shipping_usps_width') * 2 + this.config.get('shipping_usps_height') * 2), 1)) + '</Girth>';
				xml += '		<Machinable>' + (this.config.get('shipping_usps_machinable') ? 'true' : 'false') + '</Machinable>';
				xml += '	</Package>';
				xml += '</RateV4Request>';

				request = 'API=RateV4&XML=' + encodeURIComponent(xml);
			} else {
				let country = {
					'AF': 'Afghanistan',
					'AL': 'Albania',
					'DZ': 'Algeria',
					'AD': 'Andorra',
					'AO': 'Angola',
					'AI': 'Anguilla',
					'AG': 'Antigua and Barbuda',
					'AR': 'Argentina',
					'AM': 'Armenia',
					'AW': 'Aruba',
					'AU': 'Australia',
					'AT': 'Austria',
					'AZ': 'Azerbaijan',
					'BS': 'Bahamas',
					'BH': 'Bahrain',
					'BD': 'Bangladesh',
					'BB': 'Barbados',
					'BY': 'Belarus',
					'BE': 'Belgium',
					'BZ': 'Belize',
					'BJ': 'Benin',
					'BM': 'Bermuda',
					'BT': 'Bhutan',
					'BO': 'Bolivia',
					'BA': 'Bosnia-Herzegovina',
					'BW': 'Botswana',
					'BR': 'Brazil',
					'VG': 'British Virgin Islands',
					'BN': 'Brunei Darussalam',
					'BG': 'Bulgaria',
					'BF': 'Burkina Faso',
					'MM': 'Burma',
					'BI': 'Burundi',
					'KH': 'Cambodia',
					'CM': 'Cameroon',
					'CA': 'Canada',
					'CV': 'Cape Verde',
					'KY': 'Cayman Islands',
					'CF': 'Central African Republic',
					'TD': 'Chad',
					'CL': 'Chile',
					'CN': 'China',
					'CX': 'Christmas Island (Australia)',
					'CC': 'Cocos Island (Australia)',
					'CO': 'Colombia',
					'KM': 'Comoros',
					'CG': 'Congo (Brazzaville),Republic of the',
					'ZR': 'Congo, Democratic Republic of the',
					'CK': 'Cook Islands (New Zealand)',
					'CR': 'Costa Rica',
					'CI': 'Cote d\'Ivoire (Ivory Coast)',
					'HR': 'Croatia',
					'CU': 'Cuba',
					'CY': 'Cyprus',
					'CZ': 'Czech Republic',
					'DK': 'Denmark',
					'DJ': 'Djibouti',
					'DM': 'Dominica',
					'DO': 'Dominican Republic',
					'TP': 'East Timor (Indonesia)',
					'EC': 'Ecuador',
					'EG': 'Egypt',
					'SV': 'El Salvador',
					'GQ': 'Equatorial Guinea',
					'ER': 'Eritrea',
					'EE': 'Estonia',
					'ET': 'Ethiopia',
					'FK': 'Falkland Islands',
					'FO': 'Faroe Islands',
					'FJ': 'Fiji',
					'FI': 'Finland',
					'FR': 'France',
					'GF': 'French Guiana',
					'PF': 'French Polynesia',
					'GA': 'Gabon',
					'GM': 'Gambia',
					'GE': 'Georgia, Republic of',
					'DE': 'Germany',
					'GH': 'Ghana',
					'GI': 'Gibraltar',
					'GB': 'Great Britain and Northern Ireland',
					'GR': 'Greece',
					'GL': 'Greenland',
					'GD': 'Grenada',
					'GP': 'Guadeloupe',
					'GT': 'Guatemala',
					'GN': 'Guinea',
					'GW': 'Guinea-Bissau',
					'GY': 'Guyana',
					'HT': 'Haiti',
					'HN': 'Honduras',
					'HK': 'Hong Kong',
					'HU': 'Hungary',
					'IS': 'Iceland',
					'IN': 'India',
					'ID': 'Indonesia',
					'IR': 'Iran',
					'IQ': 'Iraq',
					'IE': 'Ireland',
					'IL': 'Israel',
					'IT': 'Italy',
					'JM': 'Jamaica',
					'JP': 'Japan',
					'JO': 'Jordan',
					'KZ': 'Kazakhstan',
					'KE': 'Kenya',
					'KI': 'Kiribati',
					'KW': 'Kuwait',
					'KG': 'Kyrgyzstan',
					'LA': 'Laos',
					'LV': 'Latvia',
					'LB': 'Lebanon',
					'LS': 'Lesotho',
					'LR': 'Liberia',
					'LY': 'Libya',
					'LI': 'Liechtenstein',
					'LT': 'Lithuania',
					'LU': 'Luxembourg',
					'MO': 'Macao',
					'MK': 'Macedonia, Republic of',
					'MG': 'Madagascar',
					'MW': 'Malawi',
					'MY': 'Malaysia',
					'MV': 'Maldives',
					'ML': 'Mali',
					'MT': 'Malta',
					'MQ': 'Martinique',
					'MR': 'Mauritania',
					'MU': 'Mauritius',
					'YT': 'Mayotte (France)',
					'MX': 'Mexico',
					'MD': 'Moldova',
					'MC': 'Monaco (France)',
					'MN': 'Mongolia',
					'MS': 'Montserrat',
					'MA': 'Morocco',
					'MZ': 'Mozambique',
					'NA': 'Namibia',
					'NR': 'Nauru',
					'NP': 'Nepal',
					'NL': 'Netherlands',
					'AN': 'Netherlands Antilles',
					'NC': 'New Caledonia',
					'NZ': 'New Zealand',
					'NI': 'Nicaragua',
					'NE': 'Niger',
					'NG': 'Nigeria',
					'KP': 'North Korea (Korea, Democratic People\'s Republic of)',
					'NO': 'Norway',
					'OM': 'Oman',
					'PK': 'Pakistan',
					'PA': 'Panama',
					'PG': 'Papua New Guinea',
					'PY': 'Paraguay',
					'PE': 'Peru',
					'PH': 'Philippines',
					'PN': 'Pitcairn Island',
					'PL': 'Poland',
					'PT': 'Portugal',
					'QA': 'Qatar',
					'RE': 'Reunion',
					'RO': 'Romania',
					'RU': 'Russia',
					'RW': 'Rwanda',
					'SH': 'Saint Helena',
					'KN': 'Saint Kitts (St. Christopher and Nevis)',
					'LC': 'Saint Lucia',
					'PM': 'Saint Pierre and Miquelon',
					'VC': 'Saint Vincent and the Grenadines',
					'SM': 'San Marino',
					'ST': 'Sao Tome and Principe',
					'SA': 'Saudi Arabia',
					'SN': 'Senegal',
					'YU': 'Serbia-Montenegro',
					'SC': 'Seychelles',
					'SL': 'Sierra Leone',
					'SG': 'Singapore',
					'SK': 'Slovak Republic',
					'SI': 'Slovenia',
					'SB': 'Solomon Islands',
					'SO': 'Somalia',
					'ZA': 'South Africa',
					'GS': 'South Georgia (Falkland Islands)',
					'KR': 'South Korea (Korea, Republic of)',
					'ES': 'Spain',
					'LK': 'Sri Lanka',
					'SD': 'Sudan',
					'SR': 'Suriname',
					'SZ': 'Swaziland',
					'SE': 'Sweden',
					'CH': 'Switzerland',
					'SY': 'Syrian Arab Republic',
					'TW': 'Taiwan',
					'TJ': 'Tajikistan',
					'TZ': 'Tanzania',
					'TH': 'Thailand',
					'TG': 'Togo',
					'TK': 'Tokelau (Union) Group (Western Samoa)',
					'TO': 'Tonga',
					'TT': 'Trinidad and Tobago',
					'TN': 'Tunisia',
					'TR': 'Turkey',
					'TM': 'Turkmenistan',
					'TC': 'Turks and Caicos Islands',
					'TV': 'Tuvalu',
					'UG': 'Uganda',
					'UA': 'Ukraine',
					'AE': 'United Arab Emirates',
					'UY': 'Uruguay',
					'UZ': 'Uzbekistan',
					'VU': 'Vanuatu',
					'VA': 'Vatican City',
					'VE': 'Venezuela',
					'VN': 'Vietnam',
					'WF': 'Wallis and Futuna Islands',
					'WS': 'Western Samoa',
					'YE': 'Yemen',
					'ZM': 'Zambia',
					'ZW': 'Zimbabwe'
				};

				if ((country[address['iso_code_2']])) {
					let xml = '<IntlRateV2Request USERID="' + this.config.get('shipping_usps_user_id') + '">';
					xml += '	<Revision>2</Revision>';
					xml += '	<Package ID="1">';
					xml += '		<Pounds>' + pounds + '</Pounds>';
					xml += '		<Ounces>' + ounces + '</Ounces>';
					xml += '		<MailType>All</MailType>';
					xml += '		<GXG>';
					xml += '		  <POBoxFlag>N</POBoxFlag>';
					xml += '		  <GiftFlag>N</GiftFlag>';
					xml += '		</GXG>';
					xml += '		<ValueOfContents>' + (await this.cart.getSubTotal()) + '</ValueOfContents>';
					xml += '		<Country>' + country[address['iso_code_2']] + '</Country>';

					// Intl only supports RECT and NONRECT
					if (this.config.get('shipping_usps_container') == 'VARIABLE') {
						this.config.set('shipping_usps_container', 'NONRECTANGULAR');
					}

					xml += '		<Container>' + this.config.get('shipping_usps_container') + '</Container>';
					xml += '		<Size>' + this.config.get('shipping_usps_size') + '</Size>';
					xml += '		<Width>' + this.config.get('shipping_usps_width') + '</Width>';
					xml += '		<Length>' + this.config.get('shipping_usps_length') + '</Length>';
					xml += '		<Height>' + this.config.get('shipping_usps_height') + '</Height>';

					// Calculate girth based on usps calculation
					xml += '		<Girth>' + (Math.round((this.config.get('shipping_usps_length') + this.config.get('shipping_usps_width') * 2 + this.config.get('shipping_usps_height') * 2), 1)) + '</Girth>';
					xml += '		<OriginZip>' + this.config.get('shipping_usps_postcode').substr(0, 5) + '</OriginZip>';
					xml += '		<CommercialFlag>N</CommercialFlag>';
					xml += '	</Package>';
					xml += '</IntlRateV2Request>';

					request = 'API=IntlRateV2&XML=' + encodeURIComponent(xml);
				} else {
					status = false;
				}
			}

			if (status) {
				try {
					const fullUrl = `https://production.shippingapis.com/ShippingAPI.dll'?${request}`;
					const response = await require('axios').get(fullUrl, {
						timeout: 60000,
						httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
					});
					let result = response.data; // Strip reg, trade and ** out 
					result = result.replace(/&amp;lt;sup&amp;gt;&amp;#174;&amp;lt;\/sup&amp;gt;/g, '').replace(/&amp;lt;sup&amp;gt;&amp;#8482;&amp;lt;\/sup&amp;gt;/g, '').replace(/&amp;lt;sup&amp;gt;&amp;#174;&amp;lt;\/sup&amp;gt;/g, '').replace(/\*\*/g, '').replace(/\r\n/g, '').replace(/\\"/g, '"');
					if (result) {
						if (this.config.get('shipping_usps_debug')) {
							await this.log.write("USPS DATA SENT: " + decodeURIComponent(request));
							await this.log.write("USPS DATA RECV: " + result);
						}
						const parsedXml = await parseStringPromise(result);
						const rateResponse = parsedXml.RateV4Response;
						const intlRateResponse = parsedXml.IntlRateV2Response;
						const error = parsedXml.Error;
						const firstClasses = [
							'First-Class Mail Parcel',
							'First-Class Mail Large Envelope',
							'First-Class Mail Stamped Letter',
							'First-Class Mail Postcards'
						];
						let quote_data = {};
						if (rateResponse || intlRateResponse) {
							if (address.iso_code_2 === 'US') {
								const allowed = [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 16, 17, 18, 19, 22, 23, 25, 27, 28];
								const packageNode = rateResponse.Package[0];
								const postages = packageNode.Postage || [];
								if (postages.length) {
									postages.forEach(postage => {
										const classid = postage['CLASSID'];
										if (allowed.includes(classid)) {
											if (classid == '0') {
												const mailservice = postage['MailService'][0];

												for (let [k, firstclass] of Object.entries(firstClasses)) {
													if (firstclass == mailservice) {
														classid = classid + k;
														break;
													}
												}
											} else if (this.config.get('shipping_usps_domestic_' + classid)) {
												// Process each postage node 
												const service = postage['MailService'][0];
												const cost = parseFloat(postage['Rate'][0]);
												if (!allowed.includes(service) || !cost)
													return;
												// Add to quoteData 
												quote_data[service] = {
													'code': 'usps.' + classid,
													'title': service,
													'cost': this.currency.convert(cost, 'USD', this.config.get('config_currency')),
													'tax_class_id': this.config.get('shipping_usps_tax_class_id'),
													'text': this.currency.format(this.tax.calculate(this.currency.convert(cost, 'USD', this.session.data['currency']), this.config.get('shipping_usps_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'], 1.0000000)
												}

											}
										}
									});
								} else {
									let error = package.Error[0];

									method_data = {
										'code': 'usps',
										'title': this.language.get('text_title'),
										'quote': quote_data,
										'sort_order': this.config.get('shipping_usps_sort_order'),
										'error': error['Description']
									};
								}
							} else {
								let allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21];

								const packageNode = rateResponse.Package[0];
								const postage = packageNode.Postage[0];
								const services = package['Service'];

								for (let service of services) {
									let id = service['ID'];

									if (allowed.includes(id) && this.config.get('shipping_usps_international_' + id)) {
										let title = service['SvcDescription'][0];

										if (this.config.get('shipping_usps_display_time')) {
											title += ' (' + this.language.get('text_eta') + ' ' + service['SvcCommitments'][0] + ')';
										}

										let cost = service['Postage'][0];

										quote_data[id] = {
											'code': 'usps.' + id,
											'title': title,
											'cost': this.currency.convert(cost, 'USD', this.config.get('config_currency')),
											'tax_class_id': this.config.get('shipping_usps_tax_class_id'),
											'text': this.currency.format(this.tax.calculate(this.currency.convert(cost, 'USD', this.session.data['currency']), this.config.get('shipping_usps_tax_class_id'), this.config.get('config_tax')), this.session.data['currency'], 1.0000000)
										};
									}
								}
							}
						} else if (error) {
							method_data = {
								'code': 'usps',
								'title': this.language.get('text_title'),
								'quote': quote_data,
								'sort_order': this.config.get('shipping_usps_sort_order'),
								'error': error['Description'][0]
							};
						}
					}

				} catch (error) {
					error = ('Error during USPS API call:' + error.message);
				}
			}
			if (Object.keys(quote_data).length) {
				let title = this.language.get('text_title');

				if (this.config.get('shipping_usps_display_weight')) {
					title += ' (' + this.language.get('text_weight') + ' ' + this.weight.format(weight, this.config.get('shipping_usps_weight_class_id')) + ')';
				}

				method_data = {
					'code': 'usps',
					'title': title,
					'quote': quote_data,
					'sort_order': this.config.get('shipping_usps_sort_order'),
					'error': false
				};
			}
		}

		return method_data;
	}
}
