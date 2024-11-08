module.exports = class Setting extends Controller {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @return void
	 */
	async index() {
		this.load.model('setting/store', this);

		const hostname = `${this.request.server.protocol}://${this.request.server.hostname.replace('www.', '')}${this.request.server.originalUrl.substring(0, this.request.server.originalUrl.lastIndexOf('/'))}/`;

		const store_info = await this.model_setting_store.getStoreByHostname(hostname);
		// Store
		if ((this.request.get['store_id'])) {
			this.config.set('config_store_id', this.request.get['store_id']);
		} else if (store_info.store_id) {
			this.config.set('config_store_id', store_info['store_id']);
		} else {
			this.config.set('config_store_id', 0);
		}

		if (!store_info.store_id) {
			// If catalog constant is defined
			if (typeof HTTP_CATALOG != 'undefined') {
				this.config.set('config_url', HTTP_CATALOG);
			} else {
				this.config.set('config_url', HTTP_SERVER);
			}
		}

		// Settings
		this.load.model('setting/setting', this);
		const results = await this.model_setting_setting.getSettings(this.config.get('config_store_id'));
		for (let result of results) {
			if (!result['serialized']) {
				this.config.set(result['key'], result['value']);
			} else {
				this.config.set(result['key'], JSON.parse(result['value']));
			}
		}

		// Url
		this.registry.set('url', new Url(this.config.get('config_url')));

		// Set time zone
		if (this.config.get('config_timezone')) {
			process.env.TZ = this.config.get('config_timezone');

			// Sync PHP and DB time zones+
			await this.db.query("SET time_zone = " + this.db.escape(date('P')));
		}

		// Response output compression level
		if (this.config.get('config_compression')) {
			this.response.setCompression(this.config.get('config_compression'));
		}
		return true;
	}
}