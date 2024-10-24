module.exports = class EventController extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}

	async index() {
		// Add events from the DB
		this.load.model('setting/event', this);
		const results = await this.model_setting_event.getEvents();

		results.forEach(result => {
			if (result.status) {
				const parts = result.trigger.split('/');

				if (parts[0] === 'admin') {
					parts.shift();
					this.event.register(parts.join('/'), new global['\Opencart\System\Engine\Action'](result.action), result.sort_order);
				}

				if (parts[0] === 'system') {
					this.event.register(result.trigger, new global['\Opencart\System\Engine\Action'](result.action), result.sort_order);
				}
			}
		});
	}
}
