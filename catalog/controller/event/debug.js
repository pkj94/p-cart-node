module.exports = class Debug extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 */
	async index(route, args) {
		//echo route;
	}

	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 */
	async before(route, args) {
		// add the route you want to test
		/*
		if (route == 'common/home') {
			this.session.data['debug'][route] = microtime(true);
		}
		*/
	}

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async after(route, args, output) {
		// add the route you want to test
		/*
		if (route == 'common/home') {
			if ((this.session.data['debug'][route])) {
				log_data = {
					'route' : route,
					'time'  : microtime(true) - this.session.data['debug'][route]
				};
				
				this.log.write(log_data);
			}
		}
		*/
	}
}