module.exports = class ControllerEventDebug extends Controller {
	async before(&route, &args) {
		if (route == 'common/home') { // add the route you want to test
			this.session.data['debug'][route] = micronew Date();		
		}
	}
	
	async after(route, &args, &output) {
		if (route == 'common/home') { // add the route you want to test
			if ((this.session.data['debug'][route])) {
				log_data = array(
					'route' : route,
					'time'  : micronew Date() - this.session.data['debug'][route]
				});
				
				this.log.write(log_data);
			}
		}
	}	
}
