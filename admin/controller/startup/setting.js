module.exports = class SettingController extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		this.load.model('setting/setting', this);

		// Settings
		const results = await this.model_setting_setting.getSettings(0);
		results.forEach(result => {
			if (!result.serialized) {
				this.config.set(result.key, result.value);
			} else {
				this.config.set(result.key, JSON.parse(result.value));
			}
		});

		// Set time zone
		if (this.config.get('config_timezone')) {
			process.env.TZ = this.config.get('config_timezone');

			// Sync PHP and DB time zones.
			await this.db.query(`SET time_zone = '${date('P')}'`);
		}

		// Response output compression level
		if (this.config.get('config_compression')) {
			this.response.setCompression(parseInt(this.config.get('config_compression')));
		}
	}
}

