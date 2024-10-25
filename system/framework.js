
// Helper
module.exports = class Framework {
    async init(req, res, next) {

        const autoloader = new global['\Opencart\System\Engine\Autoloader']();
        autoloader.register(`Opencart${APPLICATION}`, DIR_APPLICATION);
        autoloader.register('OpencartExtension', DIR_EXTENSION);
        autoloader.register('OpencartSystem', DIR_SYSTEM);
        // Registry
        global.registry = new (global['\Opencart\System\Engine\Registry'])();
        registry.set('autoloader', autoloader);
        global.config = new (global['\Opencart\System\Engine\Config'])();
        registry.set('config', config);
        config.addPath(DIR_CONFIG);
        // Load the default config
        await config.load('default');
        await config.load(oc_strtolower(APPLICATION));
        // console.log('config--', config)

        // Set the default application
        config.set('application', APPLICATION);
        // Set the default time zone
        let dateTimezone = config.get('date_timezone');
        Intl.DateTimeFormat().resolvedOptions().timeZone = dateTimezone;
        // Logging
        global.log = new global['\Opencart\System\Library\Log'](config.get('error_filename'));
        registry.set('log', log);
        // Event
        let event = new global['\Opencart\System\Engine\Event'](registry);
        registry.set('event', event);
        // Event Register
        if (config.has('action_event')) {
            let actionEvents = config.get('action_event');
            for (let key in actionEvents) {
                let value = actionEvents[key];
                for (let priority in value) {
                    let action = value[priority];
                    await event.register(key, new global['\Opencart\System\Engine\Action'](action), priority);
                }
            }
        }
        // Loader
        let loader = new global['\Opencart\System\Engine\Loader'](registry);
        registry.set('load', loader);
        // Request
        let request = new global['\Opencart\System\Library\Request'](req);
        registry.set('request', request);
        // Compatibility
        if (request.get['route']) {
            request.get['route'] = request.get['route'].replace('|', '.');
            request.get['route'] = request.get['route'].replace('%7C', '|');
        }
        // Response
        global.response = new global['\Opencart\System\Library\Response'](res, req);
        // registry.set('response', response);
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
        registry.set('response', response);
        // Database
        if (config.get('db_autostart')) {
            let db = new global['\Opencart\System\Library\Db'](config.get('db_engine'), config.get('db_hostname'), config.get('db_username'), config.get('db_password'), config.get('db_database'), config.get('db_port'), config.get('db_debug'));
            await db.connect();
            // console.log('db=--=', db)
            registry.set('db', db);
        }
        // Session
        if (config.get('session_autostart')) {
            let session = new global['\Opencart\System\Library\Session'](req.session);
            session.start(req.sessionID)
            registry.set('session', session);

        }
        // Cache
        let cache = new global['\Opencart\System\Library\Cache'](config.get('cache_engine'), config.get('cache_expire'));
        registry.set('cache', cache);
        // Template
        let template = new global['\Opencart\System\Library\Template'](config.get('template_engine'));
        registry.set('template', template);
        // console.log('config template', config.get('template_engine'))
        template.addPath(DIR_TEMPLATE);
        // Language
        let language = new global['\Opencart\System\Library\Language'](config.get('language_code'));
        language.addPath(DIR_LANGUAGE);
        await language.load('default');
        registry.set('language', language);
        // Url
        // console.log("config.get('site_url')==================",config.get('site_url'))
        registry.set('url', new global['\Opencart\System\Library\Url'](config.get('site_url')));
        // Document
        registry.set('document', new global['\Opencart\System\Library\Document']());
        // Action error object to execute if any other actions cannot be executed.
        let action = '';
        let args = [];
        let output = '';
        let error = new global['\Opencart\System\Engine\Action'](config.get('action_error'));
        // Pre Actions
        // console.log('framework', config.get('action_pre_action'))
        for (let pre_action of config.get('action_pre_action')) {
            let preActionInstance = new global['\Opencart\System\Engine\Action'](pre_action);
            let result = await preActionInstance.execute(registry);
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
            result = await action.execute(registry, args);
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
        //     await registry.get('db').close();
        // }

        return response.output();
    }
}