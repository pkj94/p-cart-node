module.exports = class Event extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		// Add events from the DB
		this.load.model('setting/event', this);

		const results = await this.model_setting_event.getEvents();

		for (let result of results) {
			const parts = result.trigger.split('/');

			if (parts[0] == 'catalog') {
				parts.shift();
				this.event.register(parts.join('/'), new global['\Opencart\System\Engine\Action'](result.action), result.sort_order);
			}

			if (parts[0] == 'system') {
				this.event.register(result.trigger, new global['\Opencart\System\Engine\Action'](result.action), result.sort_order);
			}
		}
		return true;
	}
}