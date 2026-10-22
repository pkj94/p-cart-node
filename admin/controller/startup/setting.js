module.exports = class SettingController extends global['OpencartSystemEngineController'] {
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
				this.config.set(result.key, oc_json_decode(result.value, []));
			}
		});

		// Set time zone
		if (this.config.get('config_timezone')) {
			process.env.TZ = this.config.get('config_timezone');
			// The DB driver syncs each connection's time_zone to this before every query
		}

		// Response output compression level
		if (this.config.get('config_compression')) {
			this.response.setCompression(parseInt(this.config.get('config_compression')));
		}
	}
}

