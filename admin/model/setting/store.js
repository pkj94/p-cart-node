const crypto = require('crypto');
module.exports = class StoreSettingModel extends Model {
    constructor(registry) {
        super(registry)
    }
    async addStore(data){
		await this.db.query("INSERT INTO `" + DB_PREFIX + "store` SET `name` = " + this.db.escape(data['config_name']) + ", `url` = " + this.db.escape(data['config_url']) );

		const store_id = this.db.getLastId();

		// Layout Route
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "layout_route` WHERE `store_id` = '0'");

		for (let layout_route of query.rows) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "layout_route` SET `layout_id` = '" + layout_route['layout_id'] + "', `route` = " + this.db.escape(layout_route['route']) + ", `store_id` = '" + store_id + "'");
		}

		await this.cache.delete('store');

		return store_id;
	}

	/**
	 * @param   store_id
	 * @param data
	 *
	 * @return void
	 */
	async editStore(store_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "store` SET `name` = " + this.db.escape(data['config_name']) + ", `url` = " + this.db.escape(data['config_url']) + "' WHERE `store_id` = '" + store_id );

		await this.cache.delete('store');
	}

	/**
	 * @param store_id
	 *
	 * @return void
	 */
	async deleteStore(store_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "store` WHERE `store_id` = '" + store_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_layout` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_store` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_affiliate_report` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_ip` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_search` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "download_report` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "gdpr` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_layout` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_store` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_route` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_layout` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_store` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "marketing_report` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_report` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_layout` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_store` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "theme` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "translation` WHERE `store_id` = '" + store_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `store_id` = '" + store_id + "'");

		await this.cache.delete('store');
	}

	/**
	 * @param store_id
	 *
	 * @return array
	 */
	async getStore(store_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "store` WHERE `store_id` = '" + store_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getStores(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "store` ORDER BY `url`";

		let store_data = await this.cache.get('store.' + md5(sql));
		if (!store_data) {
			let query = await this.db.query(sql);

			store_data = query.rows;

			await this.cache.set('store.' + md5(sql), store_data);
		}

		return store_data;
	}

	/**
	 * @param    store_id
	 * @param language
	 * @param session_id
	 *
	 * @return \Opencart\System\Engine\Registry
	 * @throws \Exception
	 */
	async createStoreInstance(store_id = 0, language = '', session_id = '') {
		// Autoloader
		// this.autoloader.register('Opencart\Catalog', DIR_CATALOG);

		// Registry
		let registry = new Registry();
		registry.set('autoloader', this.autoloader);

		// Config
		let config = new Config();
		registry.set('config', config);

		// Load the default config
		config.addPath(DIR_CONFIG);
		config.load('default');
		config.load('catalog');
		config.set('application', 'Catalog');

		// Store
		config.set('config_store_id', store_id);

		// Logging
		registry.set('log', this.log);

		// Event
		let event = new Event(registry);
		registry.set('event', event);

		// Event Register
		if (config.has('action_event')) {
			for (let [key, value] of Object.entries(config.get('action_event'))) {
                for (let [priority, action] of Object.entries(value)) {
					event.register(key, new Action(action), priority);
				}
			}
		}

		// Loader
		let loader = new Loader(registry);
		registry.set('load', loader);

		// Create a dummy request class, so we can feed the data to the order editor
		let request = this.request;
		request.get = [];
		request.post = [];
		request.server = this.request.server;
		request.cookie = [];

		// Request
		registry.set('request', request);

		// Response
		let response = new ResponseLibrary(this.response.response);
		registry.set('response', response);

		// Database
		registry.set('db', this.db);

		// Cache
		registry.set('cache', this.cache);

		// Session
		// let session = new SessionLibrary(config.get('session_engine'), registry);
		let session = new SessionLibrary(registry);
		registry.set('session', session);

		// Start session
		// session.start(session_id);

		// Template
		let template = new TemplateLibrary(config.get('template_engine'));
		template.addPath(DIR_CATALOG + 'view/template/');
		registry.set('template', template);

		// Adding language var to the GET variable so there is a default language
		registry.get('request').get['language'] = language;

		// Language
		let languageLib = new LanguageLibrary(config.get('language_code'));
		languageLib.addPath(DIR_CATALOG + 'language/');
		languageLib.load('default');
		registry.set('language', languageLib);

		// Url
		registry.set('url', new UrlLibrary(config.get('site_url')));

		// Document
		registry.set('document', new DocumentLibrary(registry));

		// Run pre actions to load key settings and classes+
		let pre_actions = [
			'startup/setting',
			'startup/language',
			'startup/extension',
			'startup/customer',
			'startup/tax',
			'startup/currency',
			'startup/application',
			'startup/startup',
			'startup/event'
		];

		// Pre Actions
		for (let pre_action of pre_actions) {
			await loader.controller(pre_action);
		}

		return registry;
	}

	/**
	 * @return int
	 */
	async getTotalStores(){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "store`");

		return query.row['total'];
	}

	/**
	 * @param layout_id
	 *
	 * @return int
	 */
	async getTotalStoresByLayoutId(layout_id){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_layout_id' AND `value` = '" + layout_id + "' AND `store_id` != '0'");

		return query.row['total'];
	}

	/**
	 * @param language
	 *
	 * @return int
	 */
	async getTotalStoresByLanguage(language){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_language' AND `value` = " + this.db.escape(language) + " AND `store_id` != '0'");

		return query.row['total'];
	}

	/**
	 * @param currency
	 *
	 * @return int
	 */
	async getTotalStoresByCurrency(currency){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_currency' AND `value` = " + this.db.escape(currency) + " AND `store_id` != '0'");

		return query.row['total'];
	}

	/**
	 * @param country_id
	 *
	 * @return int
	 */
	async getTotalStoresByCountryId(country_id){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_country_id' AND `value` = '" + country_id + "' AND `store_id` != '0'");

		return query.row['total'];
	}

	/**
	 * @param zone_id
	 *
	 * @return int
	 */
	async getTotalStoresByZoneId(zone_id){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_zone_id' AND `value` = '" + zone_id + "' AND `store_id` != '0'");

		return query.row['total'];
	}

	/**
	 * @param customer_group_id
	 *
	 * @return int
	 */
	async getTotalStoresByCustomerGroupId(customer_group_id){
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_customer_group_id' AND `value` = '" + customer_group_id + "' AND `store_id` != '0'");

		return query.row['total'];
	}

	/**
	 * @param information_id
	 *
	 * @return int
	 */
	async getTotalStoresByInformationId(information_id){
		const account_query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_account_id' AND `value` = '" + information_id + "' AND `store_id` != '0'");

		const checkout_query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_checkout_id' AND `value` = '" + information_id + "' AND `store_id` != '0'");

		return (account_query.row['total'] + checkout_query.row['total']);
	}

	/**
	 * @param order_status_id
	 *
	 * @return int
	 */
	async getTotalStoresByOrderStatusId(order_status_id){
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "setting` WHERE `key` = 'config_order_status_id' AND `value` = '" + order_status_id + "' AND `store_id` != '0'");

		return query.row['total'];
	}
}