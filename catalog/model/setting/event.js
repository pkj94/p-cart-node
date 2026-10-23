module.exports =class Event extends global['OpencartSystemEngineModel'] {
	/**
	 * @return array
	 */
	async getEvents() {
		// Read on every request, so kept in the cache; admin/model/setting/event.js clears it on change
		let event_data = await this.cache.get('event.enabled');

		if (!event_data) {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "event` WHERE `status` = '1' ORDER BY `sort_order` ASC");
			event_data = query.rows;

			await this.cache.set('event.enabled', event_data);
		}

		return event_data;
	}
}
