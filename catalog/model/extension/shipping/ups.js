const { parseStringPromise } = require('xml2js');
module.exports = class ModelExtensionShippingUps extends Model {
	async getQuote(address) {
		await this.load.language('extension/shipping/ups');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + Number(this.config.get('shipping_ups_geo_zone_id')) + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_ups_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			let weight = this.weight.convert(await this.cart.getWeight(), this.config.get('config_weight_class_id'), this.config.get('shipping_ups_weight_class_id'));
			let weight_code = (await this.weight.getUnit(this.config.get('shipping_ups_weight_class_id'))).toUpperCase();

			if (weight_code == 'KG') {
				weight_code = 'KGS';
			} else if (weight_code == 'LB') {
				weight_code = 'LBS';
			}

			weight = (weight < 0.1 ? 0.1 : weight);

			length = this.length.convert(this.config.get('shipping_ups_length'), this.config.get('config_length_class_id'), this.config.get('shipping_ups_length_class_id'));
			let width = this.length.convert(this.config.get('shipping_ups_width'), this.config.get('config_length_class_id'), this.config.get('shipping_ups_length_class_id'));
			let height = this.length.convert(this.config.get('shipping_ups_height'), this.config.get('config_length_class_id'), this.config.get('shipping_ups_length_class_id'));

			let length_code = (await this.length.getUnit(this.config.get('shipping_ups_length_class_id'))).toUpperCase();

			let service_code = {
				// US Origin
				'US': {
					'01': this.language.get('text_us_origin_01'),
					'02': this.language.get('text_us_origin_02'),
					'03': this.language.get('text_us_origin_03'),
					'07': this.language.get('text_us_origin_07'),
					'08': this.language.get('text_us_origin_08'),
					'11': this.language.get('text_us_origin_11'),
					'12': this.language.get('text_us_origin_12'),
					'13': this.language.get('text_us_origin_13'),
					'14': this.language.get('text_us_origin_14'),
					'54': this.language.get('text_us_origin_54'),
					'59': this.language.get('text_us_origin_59'),
					'65': this.language.get('text_us_origin_65')
				},
				// Canada Origin
				'CA': {
					'01': this.language.get('text_ca_origin_01'),
					'02': this.language.get('text_ca_origin_02'),
					'07': this.language.get('text_ca_origin_07'),
					'08': this.language.get('text_ca_origin_08'),
					'11': this.language.get('text_ca_origin_11'),
					'12': this.language.get('text_ca_origin_12'),
					'13': this.language.get('text_ca_origin_13'),
					'14': this.language.get('text_ca_origin_14'),
					'54': this.language.get('text_ca_origin_54'),
					'65': this.language.get('text_ca_origin_65')
				},
				// European Union Origin
				'EU': {
					'07': this.language.get('text_eu_origin_07'),
					'08': this.language.get('text_eu_origin_08'),
					'11': this.language.get('text_eu_origin_11'),
					'54': this.language.get('text_eu_origin_54'),
					'65': this.language.get('text_eu_origin_65'),
					// next five services Poland domestic only
					'82': this.language.get('text_eu_origin_82'),
					'83': this.language.get('text_eu_origin_83'),
					'84': this.language.get('text_eu_origin_84'),
					'85': this.language.get('text_eu_origin_85'),
					'86': this.language.get('text_eu_origin_86')
				},
				// Puerto Rico Origin
				'PR': {
					'01': this.language.get('text_pr_origin_01'),
					'02': this.language.get('text_pr_origin_02'),
					'03': this.language.get('text_pr_origin_03'),
					'07': this.language.get('text_pr_origin_07'),
					'08': this.language.get('text_pr_origin_08'),
					'14': this.language.get('text_pr_origin_14'),
					'54': this.language.get('text_pr_origin_54'),
					'65': this.language.get('text_pr_origin_65')
				},
				// Mexico Origin
				'MX': {
					'07': this.language.get('text_mx_origin_07'),
					'08': this.language.get('text_mx_origin_08'),
					'54': this.language.get('text_mx_origin_54'),
					'65': this.language.get('text_mx_origin_65')
				},
				// All other origins
				'other': {
					// service code 7 seems to be gone after January 2, 2007
					'07': this.language.get('text_other_origin_07'),
					'08': this.language.get('text_other_origin_08'),
					'11': this.language.get('text_other_origin_11'),
					'54': this.language.get('text_other_origin_54'),
					'65': this.language.get('text_other_origin_65')
				}
			};

			let xml = '<?xml version="1.0"?>';
			xml += '<AccessRequest xml:lang="en-US">';
			xml += '	<AccessLicenseNumber>' + this.config.get('shipping_ups_key') + '</AccessLicenseNumber>';
			xml += '	<UserId>' + this.config.get('shipping_ups_username') + '</UserId>';
			xml += '	<Password>' + this.config.get('shipping_ups_password') + '</Password>';
			xml += '</AccessRequest>';
			xml += '<?xml version="1.0"?>';
			xml += '<RatingServiceSelectionRequest xml:lang="en-US">';
			xml += '	<Request>';
			xml += '		<TransactionReference>';
			xml += '			<CustomerContext>Bare Bones Rate Request</CustomerContext>';
			xml += '			<XpciVersion>1.0001</XpciVersion>';
			xml += '		</TransactionReference>';
			xml += '		<RequestAction>Rate</RequestAction>';
			xml += '		<RequestOption>shop</RequestOption>';
			xml += '	</Request>';
			xml += '   <PickupType>';
			xml += '       <Code>' + this.config.get('shipping_ups_pickup') + '</Code>';
			xml += '   </PickupType>';

			if (this.config.get('shipping_ups_country') == 'US' && this.config.get('shipping_ups_pickup') == '11') {
				xml += '   <CustomerClassification>';
				xml += '       <Code>' + this.config.get('shipping_ups_classification') + '</Code>';
				xml += '   </CustomerClassification>';
			}

			xml += '	<Shipment>';
			xml += '		<Shipper>';
			xml += '			<Address>';
			xml += '				<City>' + this.config.get('shipping_ups_city') + '</City>';
			xml += '				<StateProvinceCode>' + this.config.get('shipping_ups_state') + '</StateProvinceCode>';
			xml += '				<CountryCode>' + this.config.get('shipping_ups_country') + '</CountryCode>';
			xml += '				<PostalCode>' + this.config.get('shipping_ups_postcode') + '</PostalCode>';
			xml += '			</Address>';
			xml += '		</Shipper>';
			xml += '		<ShipTo>';
			xml += '			<Address>';
			xml += ' 				<City>' + address['city'] + '</City>';
			xml += '				<StateProvinceCode>' + address['zone_code'] + '</StateProvinceCode>';
			xml += '				<CountryCode>' + address['iso_code_2'] + '</CountryCode>';
			xml += '				<PostalCode>' + address['postcode'] + '</PostalCode>';

			if (this.config.get('shipping_ups_quote_type') == 'residential') {
				xml += '				<ResidentialAddressIndicator />';
			}

			xml += '			</Address>';
			xml += '		</ShipTo>';
			xml += '		<ShipFrom>';
			xml += '			<Address>';
			xml += '				<City>' + this.config.get('shipping_ups_city') + '</City>';
			xml += '				<StateProvinceCode>' + this.config.get('shipping_ups_state') + '</StateProvinceCode>';
			xml += '				<CountryCode>' + this.config.get('shipping_ups_country') + '</CountryCode>';
			xml += '				<PostalCode>' + this.config.get('shipping_ups_postcode') + '</PostalCode>';
			xml += '			</Address>';
			xml += '		</ShipFrom>';

			xml += '		<Package>';
			xml += '			<PackagingType>';
			xml += '				<Code>' + this.config.get('shipping_ups_packaging') + '</Code>';
			xml += '			</PackagingType>';

			xml += '		    <Dimensions>';
			xml += '				<UnitOfMeasurement>';
			xml += '					<Code>' + length_code + '</Code>';
			xml += '				</UnitOfMeasurement>';
			xml += '				<Length>' + length + '</Length>';
			xml += '				<Width>' + width + '</Width>';
			xml += '				<Height>' + height + '</Height>';
			xml += '			</Dimensions>';

			xml += '			<PackageWeight>';
			xml += '				<UnitOfMeasurement>';
			xml += '					<Code>' + weight_code + '</Code>';
			xml += '				</UnitOfMeasurement>';
			xml += '				<Weight>' + weight + '</Weight>';
			xml += '			</PackageWeight>';

			if (this.config.get('shipping_ups_insurance')) {
				xml += '           <PackageServiceOptions>';
				xml += '               <InsuredValue>';
				xml += '                   <CurrencyCode>' + this.session.data['currency'] + '</CurrencyCode>';
				xml += '                   <MonetaryValue>' + this.currency.format(await this.cart.getSubTotal(), this.session.data['currency'], false, false) + '</MonetaryValue>';
				xml += '               </InsuredValue>';
				xml += '           </PackageServiceOptions>';
			}

			xml += '		</Package>';

			xml += '	</Shipment>';
			xml += '</RatingServiceSelectionRequest>';
			let url = 'https://wwwcie.ups.com/ups.app/xml/Rate';
			if (!this.config.get('shipping_ups_test')) {
				url = 'https://onlinetools.ups.com/ups.app/xml/Rate';
			}

			try {
				const response = await require('axios').post(url, xml, {
					headers: { 'Content-Type': 'text/xml' },
					timeout: 60000,
					httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
				});
				const result = response.data;
				let error = '';
				const quote_data = {};
				if (result) {
					if (this.config.get('shipping_ups_debug')) {
						await this.log.write("UPS DATA SENT: " + xml);
						await this.log.write("UPS DATA RECV: " + result);
					}
					const parsedXml = await parseStringPromise(result);
					if (!parsedXml.RatingServiceSelectionResponse) {
						return false;
					}
					const ratingServiceSelectionResponse = parsedXml.RatingServiceSelectionResponse;
					const response = ratingServiceSelectionResponse.Response[0];
					const responseStatusCode = response.ResponseStatusCode[0];
					if (responseStatusCode !== '1') {
						const errorNode = response.Error[0];
						error = `${errorNode.ErrorCode[0]}: ${errorNode.ErrorDescription[0]}`;
					} else {
						const ratedShipments = ratingServiceSelectionResponse.RatedShipment || [];
						ratedShipments.forEach(ratedShipment => {
							const service = ratedShipment.Service[0];
							const code = service.Code[0];
							const totalCharges = ratedShipment.TotalCharges[0];
							const cost = totalCharges.MonetaryValue[0];
							const currencyCode = totalCharges.CurrencyCode[0];
							if (!code || !cost)
								return;
							const origin = this.config.get('shipping_ups_origin').toLowerCase();
							if (this.config.get(`shipping_ups_${origin}_${code}`)) {
								const title = serviceCodeMap[this.config.get('shipping_ups_origin')][code];
								const formattedCost = this.currency.convert(cost, currencyCode, this.config.get('config_currency')); quote_data[code] = {
									code: `ups.${code}`,
									title,
									cost: formattedCost,
									tax_class_id: this.config.get('shipping_ups_tax_class_id'),
									text: this.currency.format(this.tax.calculate(formattedCost, this.config.get('shipping_ups_tax_class_id'), this.config.get('config_tax')), session.data.currency)
								};
							}
						});
					}
				}

			} catch (err) {
				console.error('Error during UPS API call:', err.message);
				error = err.message;
			}

			let title = this.language.get('text_title');

			if (this.config.get('shipping_ups_display_weight')) {
				title += ' (' + this.language.get('text_weight') + ' ' + this.weight.format(weight, this.config.get('shipping_ups_weight_class_id')) + ')';
			}

			if (Object.keys(quote_data).length || error) {
				method_data = {
					'code': 'ups',
					'title': title,
					'quote': quote_data,
					'sort_order': this.config.get('shipping_ups_sort_order'),
					'error': error
				};
			}
		}

		return method_data;
	}
}
