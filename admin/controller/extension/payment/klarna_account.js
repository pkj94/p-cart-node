module.exports = class ControllerExtensionPaymentKlarnaAccount extends Controller {
	error = {};
	pclasses = {};

	async index() {
		const data = {};
		await this.load.language('extension/payment/klarna_account');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			let status = false;

			for (let [code, klarna_account] of Object.entries(this.request.post['payment_klarna_account_'])) {
				if (klarna_account['status']) {
					status = true;

					break;
				}
			}

			const klarna_data = {
				'klarna_account_pclasses': this.pclasses,
				'klarna_account_status': status
			};

			await this.model_setting_setting.editSetting('payment_klarna_account', { ...this.request.post, ...klarna_data });

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/payment/klarna_account', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/klarna_account', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		data['countries'] = [];

		data['countries'].push({
			'name': this.language.get('text_germany'),
			'code': 'DEU'
		});

		data['countries'].push({
			'name': this.language.get('text_netherlands'),
			'code': 'NLD'
		});

		data['countries'].push({
			'name': this.language.get('text_denmark'),
			'code': 'DNK'
		});

		data['countries'].push({
			'name': this.language.get('text_sweden'),
			'code': 'SWE'
		});

		data['countries'].push({
			'name': this.language.get('text_norway'),
			'code': 'NOR'
		});

		data['countries'].push({
			'name': this.language.get('text_finland'),
			'code': 'FIN'
		});

		if ((this.request.post['payment_klarna_account'])) {
			data['payment_klarna_account'] = this.request.post['payment_klarna_account'];
		} else {
			data['payment_klarna_account'] = this.config.get('payment_klarna_account');
		}

		this.load.model('localisation/geo_zone', this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		let file = DIR_LOGS + 'klarna_account.log';

		if (is_file(file)) {
			data['log'] = fs.readFileSync(file);
		} else {
			data['log'] = '';
		}

		data['clear'] = await this.url.link('extension/payment/klarna_account/clear', 'user_token=' + this.session.data['user_token'], true);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/klarna_account', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/klarna_account')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		const log = new Log('klarna_account.log');

		let country = {
			'NOR': {
				'currency': 1,
				'country': 164,
				'language': 97,
			},
			'SWE': {
				'currency': 0,
				'country': 209,
				'language': 138,
			},
			'FIN': {
				'currency': 2,
				'country': 73,
				'language': 101,
			},
			'DNK': {
				'currency': 3,
				'country': 59,
				'language': 27,
			},
			'DEU': {
				'currency': 2,
				'country': 81,
				'language': 28,
			},
			'NLD': {
				'currency': 2,
				'country': 154,
				'language': 101,
			},
		};

		for (let [key, klarna_account] of Object.entries(this.request.post['klarna_account'] || {})) {
			if (klarna_account['status']) {
				const hash = crypto.createHash('sha256').update(`${klarnaAccount.merchant}:${country[key]['currency']}:${klarnaAccount.secret}`).digest('hex');
				const buffer = Buffer.from(hash, 'hex');
				const digest = buffer.toString('base64');

				let xml = '<methodCall>';
				xml += '  <methodName>get_pclasses</methodName>';
				xml += '  <params>';
				xml += '    <param><value><string>4.1</string></value></param>';
				xml += '    <param><value><string>API:OPENCART:' + VERSION + '</string></value></param>';
				xml += '    <param><value><int>' + klarna_account['merchant'] + '</int></value></param>';
				xml += '    <param><value><int>' + country[key]['currency'] + '</int></value></param>';
				xml += '    <param><value><string>' + digest + '</string></value></param>';
				xml += '    <param><value><int>' + country[key]['country'] + '</int></value></param>';
				xml += '    <param><value><int>' + country[key]['language'] + '</int></value></param>';
				xml += '  </params>';
				xml += '</methodCall>';
				let url = 'https://payment.testdrive.klarna.com';
				if (klarna_account['server'] == 'live') {
					url = 'https://payment.klarna.com';
				} else {
					url = 'https://payment.testdrive.klarna.com';
				}

				try {
					const response = await require('axios').post(url, xml, {
						headers: {
							'Content-Type': 'text/xml',
							'Content-Length': Buffer.byteLength(xml)
						},
						timeout: 60000
					});

					const parser = new xml2js.Parser({ explicitArray: false });
					const parsedResponse = await parser.parseStringPromise(response.data);
					const nodes = parsedResponse.methodResponse.params.param.value;
					if (!nodes) {
						this.error.warning = 'Error parsing response';
						const errorCode = parsedResponse.methodResponse.fault.value.struct.member[0].value.int;
						const errorMessage = parsedResponse.methodResponse.fault.value.struct.member[1].value.string;
						await log.write(`Error Code: ${errorCode}, Error Message: ${errorMessage}\n`);
						continue;
					}
					const pclasses = this.parseResponse(nodes.array.data.value, xml);
					while (pclasses.length > 0) {
						const pclass = pclasses.splice(0, 10);
						pclass[3] /= 100;
						pclass[4] /= 100;
						pclass[5] /= 100;
						pclass[6] /= 100;
						pclass[9] = (pclass[9] !== '-') ? new Date(pclass[9]).getTime() / 1000 : pclass[9];
						this.pclasses[key] = this.pclasses[key] || [];
						this.pclasses[key].push({
							eid: parseInt(pclass[0], 10),
							id: parseInt(pclass[1], 10),
							description: pclass[2],
							months: parseInt(pclass[3], 10),
							startfee: parseFloat(pclass[4]),
							invoicefee: parseFloat(pclass[5]),
							interestrate: parseFloat(pclass[6]),
							minamount: parseFloat(pclass[7]),
							country: parseInt(pclass[8], 10),
							type: parseInt(pclass[9], 10),
						});
					}
				} catch (error) {
					this.error.warning = 'Error logging response';
					await log.write(`cURL Error Code: ${error.code}, Error Message: ${error.message}\n`);
				}
			}
			return Object.keys(this.error).length ? false : true
		}
	}

	parseResponse(node, document) {
		let value;
		switch (node.name) {
			case 'string':
				value = node._;
				break;
			case 'boolean':
				value = node._ === '1';
				break;
			case 'integer':
			case 'int':
			case 'i4':
			case 'i8':
				value = parseInt(node._, 10);
				break;
			case 'array':
				value = [];
				node.data.value.forEach((childNode) => {
					value.push(this.parseResponse(childNode, document));
				});
				break;
			default: value = null;
		} return value;
	}

	async clear() {
		await this.load.language('extension/payment/klarna_account');

		let file = DIR_LOGS + 'klarna_account.log';

		fs.weriteFileSync(file, '');


		this.session.data['success'] = this.language.get('text_success');
		await this.session.save(this.session.data);

		this.response.setRedirect(await this.url.link('extension/payment/klarna_account', 'user_token=' + this.session.data['user_token'], true));
	}
}