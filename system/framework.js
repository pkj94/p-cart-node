
// Helper
module.exports = class Framework {
    async init(application_config, req, res, next) {
        // Registry
        const registry = new Registry();
        // Config
        const config = new Config();
        config.addPath(DIR_CONFIG);
        // Load the default config
        await config.load('default');
        await config.load(application_config);
        // console.log('config--', config)

        // Set the default application
        registry.set('config', config);
        // Set the default time zone
        const dateTimezone = config.get('date_timezone');
        Intl.DateTimeFormat().resolvedOptions().timeZone = dateTimezone;
        // Logging
        const log = new global['\Opencart\System\Library\Log'](config.get('error_filename'));
        this.registry.set('log', log);
        // Event
        const event = new global['\Opencart\System\Engine\Event'](this.registry);
        this.registry.set('event', event);
        // Event Register
        if (config.has('action_event')) {
            const actionEvents = config.get('action_event');
            for (let key in actionEvents) {
                const value = actionEvents[key];
                for (let priority in value) {
                    const action = value[priority];
                    await event.register(key, new global['\Opencart\System\Engine\Action'](action), priority);
                }
            }
        }
        // Loader
        const loader = new global['\Opencart\System\Engine\Loader'](this.registry);
        this.registry.set('load', loader);
        // Request
        const request = new global['\Opencart\System\Library\Request'](req);
        this.registry.set('request', request);
        // Compatibility
        if (request.get['route']) {
            request.get['route'] = request.get['route'].replace('|', '.');
            request.get['route'] = request.get['route'].replace('%7C', '|');
        } else if (req.params[0]) {
            request.get['_route_'] = req.params[0];
        }
        // Response
        const response = new global['\Opencart\System\Library\Response'](res, req);
        // this.registry.set('response', response);
        for (let header of config.get('response_header') || []) {
            response.addHeader(header);
        }
        response.addHeader('Access-Control-Allow-Origin: *');
        response.addHeader('Access-Control-Allow-Credentials: true');
        response.addHeader('Access-Control-Max-Age: 1000');
        response.addHeader('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding');
        response.addHeader('Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS, DELETE');
        response.addHeader('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        response.addHeader('Pragma: no-cache');
        response.setCompression(config.get('response_compression'));
        this.registry.set('response', response);
        // Database
        if (config.get('db_autostart')) {
            let db = new global['\Opencart\System\Library\Db'](config.get('db_engine'), config.get('db_hostname'), config.get('db_username'), config.get('db_password'), config.get('db_database'), config.get('db_port'), config.get('db_debug'));
            await db.connect();
            // console.log('db=--=', db)
            this.registry.set('db', db);
        }
        // Session
        if (config.get('session_autostart')) {
            let session = new global['\Opencart\System\Library\Session'](req.session);
            session.start(req.sessionID)
            this.registry.set('session', session);

        }
        // Cache
        const cache = new global['\Opencart\System\Library\Cache'](config.get('cache_engine'), config.get('cache_expire'));
        this.registry.set('cache', cache);
        // Template
        const template = new global['\Opencart\System\Library\Template'](config.get('template_engine'));
        this.registry.set('template', template);
        // console.log('config template', config.get('template_engine'))
        template.addPath(DIR_TEMPLATE);
        // Language
        const language = new global['\Opencart\System\Library\Language'](config.get('language_code'));
        language.addPath(DIR_LANGUAGE);
        await language.load('default');
        this.registry.set('language', language);
        // Url
        // console.log("config.get('site_url')==================",config.get('site_url'))
        this.registry.set('url', new global['\Opencart\System\Library\Url'](config.get('site_url')));
        // Document
        this.registry.set('document', new global['\Opencart\System\Library\Document']());
        // Action error object to execute if any other actions cannot be executed.
        let action = '';
        let args = [];
        let output = '';
        let error = new global['\Opencart\System\Engine\Action'](config.get('action_error'));
        // Pre Actions
        // console.log('framework', config.get('action_pre_action'))
        for (let pre_action of config.get('action_pre_action')) {
            let preActionInstance = new global['\Opencart\System\Engine\Action'](pre_action);
            let result = await preActionInstance.execute(this.registry);
            if (result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
                break;
            }
            // If action cannot be executed, we return an action error object.
            if (result instanceof Error) {
                action = error;
                error = '';
                break;
            }
        }
        // Route
        // console.log('framework', action)
        if (!action) {
            if (request.get.route) {
                action = new global['\Opencart\System\Engine\Action'](request.get.route);
            } else {
                action = new global['\Opencart\System\Engine\Action'](config.get('action_default'));
            }
        }
        // Dispatch
        while (action) {
            // Route needs to be updated each time so it can trigger events
            let route = action.getId();
            // Keep the original trigger.
            let trigger = route;
            let result = await event.trigger(`controller/${trigger}/before`, [route, args]);
            if (result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
            }
            // Execute the action.
            result = await action.execute(this.registry, args);
            action = '';
            if (result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
            }
            // If action cannot be executed, we return the action error object.
            if (result instanceof Error) {
                action = error;
                // In case there is an error, we don't want to infinitely keep calling the action error object.
                error = '';
            }
            // If not an object, then it's the output
            if (!action) {
                output = result;
            }
            result = await event.trigger(`controller/${trigger}/after`, [route, args, output]);
            if (result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
            }
        }
        // Output
        // console.log('outputData', response.level)
        // if (config.get('db_autostart')) {
        //     await this.registry.get('db').close();
        // }
        await this.registry.get('cache').cleanUp()
        return response.output();
    }
}