module.exports = class ModelExtensionPaymentFirstdataRemote extends Model {
	async install() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}firstdata_remote_order\` (
			  \`firstdata_remote_order_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`order_id\` INT(11) NOT NULL,
			  \`order_ref\` CHAR(50) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`date_modified\` DATETIME NOT NULL,
			  \`tdate\` VARCHAR(30) NOT NULL,
			  \`capture_status\` INT(1) DEFAULT NULL,
			  \`void_status\` INT(1) DEFAULT NULL,
			  \`refund_status\` INT(1) DEFAULT NULL,
			  \`currency_code\` CHAR(3) NOT NULL,
			  \`authcode\` VARCHAR(30) NOT NULL,
			  \`total\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`firstdata_remote_order_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}firstdata_remote_order_transaction\` (
			  \`firstdata_remote_order_transaction_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`firstdata_remote_order_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`type\` ENUM('auth', 'payment', 'refund', 'void') DEFAULT NULL,
			  \`amount\` DECIMAL( 10, 2 ) NOT NULL,
			  PRIMARY KEY (\`firstdata_remote_order_transaction_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);

		await this.db.query(`
			CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}firstdata_remote_card\` (
			  \`firstdata_remote_card_id\` INT(11) NOT NULL AUTO_INCREMENT,
			  \`customer_id\` INT(11) NOT NULL,
			  \`date_added\` DATETIME NOT NULL,
			  \`digits\` CHAR(4) NOT NULL,
			  \`expire_month\` INT(2) NOT NULL,
			  \`expire_year\` INT(2) NOT NULL,
			  \`card_type\` CHAR(15) NOT NULL,
			  \`token\` CHAR(64) NOT NULL,
			  PRIMARY KEY (\`firstdata_remote_card_id\`)
			) ENGINE=MyISAM DEFAULT COLLATE=utf8_general_ci;`);
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "firstdata_remote_order`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "firstdata_remote_order_transaction`;");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "firstdata_remote_card`;");
	}


	async call(xml) {
		const url = "https://test.ipg-online.com/ipgapi/services";
		const auth = `${this.config.firstdata_remote_user_id}:${this.config.firstdata_remote_password}`;

		try {
			const response = await require('axios').post(url, xml, {
				headers: {
					'Content-Type': 'text/xml'
				},
				auth: {
					username: this.config.firstdata_remote_user_id,
					password: this.config.firstdata_remote_password
				},
				httpsAgent: new https.Agent({
					rejectUnauthorized: true,
					ca: fs.readFileSync(this.config.firstdata_remote_ca),
					cert: fs.readFileSync(this.config.firstdata_remote_certificate),
					key: fs.readFileSync(this.config.firstdata_remote_key),
					passphrase: this.config.firstdata_remote_key_pw
				}),
				timeout: 60000,
				validateStatus: () => true // Accept all HTTP status codes
			});

			this.log('Post data:', this.config.request.post);
			this.log('Request:', xml);
			this.log('Response:', response.data);
			this.log('Response info:', response);

			return response.data;
		} catch (error) {
			await this.logger('Error:', error);
			return null;
		}
	}

	async void(orderRef, tdate) {
		const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header />
        <SOAP-ENV:Body>
          <ipgapi:IPGApiOrderRequest xmlns:v1="http://ipg-online.com/ipgapi/schemas/v1" xmlns:ipgapi="http://ipg-online.com/ipgapi/schemas/ipgapi">
            <v1:Transaction>
              <v1:CreditCardTxType>
                <v1:Type>void</v1:Type>
              </v1:CreditCardTxType>
              <v1:TransactionDetails>
                <v1:OrderId>${orderRef}</v1:OrderId>
                <v1:TDate>${tdate}</v1:TDate>
              </v1:TransactionDetails>
            </v1:Transaction>
          </ipgapi:IPGApiOrderRequest>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `;

		try {
			const response = await this.call(xml);

			const parser = new require('xml2js').Parser({ explicitArray: false });
			const parsedResponse = await parser.parseStringPromise(response);

			this.log('Request:', xml);
			this.log('Response:', parsedResponse);

			const fault = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault'];
			const error = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ipgapi:IPGApiOrderRequest']['ipgapi:ErrorMessage'];
			const transactionResult = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ipgapi:IPGApiOrderRequest']['ipgapi:TransactionResult'];

			return {
				fault: fault ? fault.detail : '',
				error: error || '',
				transaction_result: transactionResult || ''
			};
		} catch (error) {
			this.log('Error:', error);
			return {
				fault: '',
				error: error.message,
				transaction_result: ''
			};
		}
	}


	async updateVoidStatus(firstdata_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "firstdata_remote_order` SET `void_status` = '" + status + "' WHERE `firstdata_remote_order_id` = '" + firstdata_remote_order_id + "'");
	}


	async capture(orderRef, total, currencyCode) {
		const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header />
        <SOAP-ENV:Body>
          <ipgapi:IPGApiOrderRequest xmlns:v1="http://ipg-online.com/ipgapi/schemas/v1" xmlns:ipgapi="http://ipg-online.com/ipgapi/schemas/ipgapi">
            <v1:Transaction>
              <v1:CreditCardTxType>
                <v1:Type>postAuth</v1:Type>
              </v1:CreditCardTxType>
              <v1:Payment>
                <v1:ChargeTotal>${total}</v1:ChargeTotal>
                <v1:Currency>${this.mapCurrency(currencyCode)}</v1:Currency>
              </v1:Payment>
              <v1:TransactionDetails>
                <v1:OrderId>${orderRef}</v1:OrderId>
              </v1:TransactionDetails>
            </v1:Transaction>
          </ipgapi:IPGApiOrderRequest>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `;

		try {
			const response = await this.call(xml);

			const parser = new require('xml2js').Parser({ explicitArray: false });
			const parsedResponse = await parser.parseStringPromise(response);

			this.log('Request:', xml);
			this.log('Response:', parsedResponse);

			const fault = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault'];
			const error = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ipgapi:IPGApiOrderRequest']['ipgapi:ErrorMessage'];
			const transactionResult = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ipgapi:IPGApiOrderRequest']['ipgapi:TransactionResult'];

			return {
				fault: fault ? fault.detail : '',
				error: error || '',
				transaction_result: transactionResult || ''
			};
		} catch (error) {
			this.log('Error:', error);
			return {
				fault: '',
				error: error.message,
				transaction_result: ''
			};
		}
	}


	async updateCaptureStatus(firstdata_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "firstdata_remote_order` SET `capture_status` = '" + status + "' WHERE `firstdata_remote_order_id` = '" + firstdata_remote_order_id + "'");
	}



	async refund(orderRef, total, currencyCode) {
		const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header />
        <SOAP-ENV:Body>
          <ipgapi:IPGApiOrderRequest xmlns:v1="http://ipg-online.com/ipgapi/schemas/v1" xmlns:ipgapi="http://ipg-online.com/ipgapi/schemas/ipgapi">
            <v1:Transaction>
              <v1:CreditCardTxType>
                <v1:Type>return</v1:Type>
              </v1:CreditCardTxType>
              <v1:Payment>
                <v1:ChargeTotal>${total}</v1:ChargeTotal>
                <v1:Currency>${this.mapCurrency(currencyCode)}</v1:Currency>
              </v1:Payment>
              <v1:TransactionDetails>
                <v1:OrderId>${orderRef}</v1:OrderId>
              </v1:TransactionDetails>
            </v1:Transaction>
          </ipgapi:IPGApiOrderRequest>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `;

		try {
			const response = await this.call(xml);

			const parser = new require('xml2js').Parser({ explicitArray: false });
			const parsedResponse = await parser.parseStringPromise(response.data);

			this.log('Request:', xml);
			this.log('Response:', parsedResponse);

			const fault = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault'];
			const error = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ipgapi:IPGApiOrderRequest']['ipgapi:ErrorMessage'];
			const transactionResult = parsedResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ipgapi:IPGApiOrderRequest']['ipgapi:TransactionResult'];

			return {
				fault: fault ? fault.detail : '',
				error: error || '',
				transaction_result: transactionResult || ''
			};
		} catch (error) {
			this.log('Error:', error);
			return {
				fault: '',
				error: error.message,
				transaction_result: ''
			};
		}
	}


	async updateRefundStatus(firstdata_remote_order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "firstdata_remote_order` SET `refund_status` = '" + status + "' WHERE `firstdata_remote_order_id` = '" + firstdata_remote_order_id + "'");
	}

	async getOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "firstdata_remote_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['firstdata_remote_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async getTransactions(firstdata_remote_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "firstdata_remote_order_transaction` WHERE `firstdata_remote_order_id` = '" + firstdata_remote_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async addTransaction(firstdata_remote_order_id, type, total) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_remote_order_transaction` SET `firstdata_remote_order_id` = '" + firstdata_remote_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + total + "'");
	}

	async logger(message) {
		if (this.config.get('firstdata_remote_debug') == 1) {
			const log = new Log('firstdata_remote.log');
			log.write(message);
		}
	}

	async getTotalCaptured(firstdata_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "firstdata_remote_order_transaction` WHERE `firstdata_remote_order_id` = '" + firstdata_order_id + "' AND (`type` = 'payment' OR `type` = 'refund')");

		return query.row['total'];
	}

	async getTotalRefunded(firstdata_order_id) {
		const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "firstdata_remote_order_transaction` WHERE `firstdata_remote_order_id` = '" + firstdata_order_id + "' AND 'refund'");

		return query.row['total'];
	}

	async mapCurrency(code) {
		const currency = {
			'GBP': 826,
			'USD': 840,
			'EUR': 978,
		};

		if (currency.includes(code)) {
			return currency[code];
		} else {
			return false;
		}
	}
}