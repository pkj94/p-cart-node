module.exports = class Currency extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param    cron_id
	 * @param string code
	 * @param string cycle
	 * @param string date_added
	 * @param string date_modified
	 *
	 * @return void
	 */
	async index(cron_id, code, cycle, date_added, date_modified) {
		this.load.model('setting/extension',this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('currency', this.config.get('config_currency_engine'));

		if (extension_info) {
			this.load.controller('extension/' + extension_info['extension'] + '/currency/' + extension_info['code'] + '+currency', this.config.get('config_currency'));
		}
	}
}
