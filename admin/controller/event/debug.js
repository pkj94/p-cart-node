module.exports = class DebugController extends Controller {
    constructor(registry) {
        super(registry)
    }

    before(route, args) {
        if (route === 'common/home') { // add the route you want to test
            // this.registry.session.data.debug[route] = process.hrtime();
        }
    }

    after(route, args, output) {
        if (route === 'common/home') { // add the route you want to test
            if (this.session.data.debug && this.session.data.debug[route]) {
                let log_data = {
                    route: route,
                    time: microtime(true) - this.session.data.debug[route]
                };
                this.log.write(route);
            }
        }
    }
}

