module.exports = class Store extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param store_id
	 *
	 * @return array
	 */
	async getStore(store_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "store` WHERE `store_id` = '" + store_id + "'");

		return query.row;
	}

	/**
	 * @param string url
	 *
	 * @return array
	 */
	async getStoreByHostname(url) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "store` WHERE REPLACE(`url`, 'www+', '') = " + this.db.escape(url));

		return query.row;
	}

	/**
	 * @return array
	 */
	async getStores() {
		const sql = "SELECT * FROM `" + DB_PREFIX + "store` ORDER BY `url`";

		let store_data = await this.cache.get('store.' + md5(sql));

		if (!store_data) {
			const query = await this.db.query(sql);

			store_data = query.rows;

			await this.cache.set('store.' + md5(sql), store_data);
		}

		return store_data;
	}

	/**
	 * @param    store_id
	 * @param string language
	 * @param string session_id
	 *
	 * @return \Opencart\System\Engine\Registry
	 * @throws \Exception
	 */
	async createStoreInstance(store_id = 0, language = '', session_id = '') {
		// Autoloader
		// this.autoloader.register('Opencart\Catalog', DIR_CATALOG);

		// Registry
		let registry = new Registry();
		// registry.set('autoloader', this.autoloader);

		// Config
		let config = new Config();
		registry.set('config', config);

		// Load the default config
		config.addPath(DIR_CONFIG);
		config.load('default');
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
					event.register(key, new global['\Opencart\System\Engine\Action'](action), priority);
				}
			}
		}

		// Loader
		let loader = new Loader(registry);
		registry.set('load', loader);

		// Create a dummy request class so we can feed the data to the order editor
		let request = new RequestLibrary(this.request.server);

		// Request
		registry.set('request', request);

		// Response
		let response = new ResponseLibrary(this.response.response, this.request.server);
		registry.set('response', response);

		// Database
		registry.set('db', this.db);

		// Cache
		registry.set('cache', this.cache);

		// Session
		session = new global['\Opencart\System\Library\Session'](this.request.server.session);
		session.start(this.request.server.sessionID)
		registry.set('session', session);

		// Start session
		session.start(session_id);

		// Template
		let template = new TemplateLibrary(config.get('template_engine'));
		template.addPath(DIR_TEMPLATE);
		registry.set('template', template);

		// Language
		this.load.model('localisation/language', this);

		const language_info = await this.registry.get('model_localisation_language').getLanguageByCode(language);

		if (language_info.language_id) {
			config.set('config_language_id', language_info['language_id']);
			config.set('config_language', language_info['code']);
		} else {
			config.set('config_language_id', this.config.get('config_language_id'));
			config.set('config_language', this.config.get('config_language'));
		}

		let languageLib = new LanguageLibrary(this.config.get('config_language'));

		if (!language_info['extension']) {
			languageLib.addPath(DIR_LANGUAGE);
		} else {
			languageLib.addPath(DIR_EXTENSION + language_info['extension'] + '/catalog/language/');
		}

		// Load default language file
		await languageLib.load('default');
		registry.set('language', languageLib);

		// Url
		registry.set('url', new global['\Opencart\System\Library\Url'](config.get('site_url')));

		// Document
		registry.set('document', new DocumentLibrary());

		// Run pre actions to load key settings and classes+
		let pre_actions = [
			'startup/setting',
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
}
