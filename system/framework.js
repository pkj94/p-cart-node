const fs = require('fs');
// Helper
module.exports = class Framework {
    async init(req, res, next) {
        require('../system/startup');

        const autoloader = new global['\Opencart\System\Engine\Autoloader']();
        autoloader.register(`Opencart\\${APPLICATION}`, DIR_APPLICATION);
        autoloader.register('Opencart\\Extension', DIR_EXTENSION);
        autoloader.register('Opencart\\System', DIR_SYSTEM);
        // Registry
        global.registry = new (global['\Opencart\System\Engine\Registry'])();
        global.config = new (global['\Opencart\System\Engine\Config'])();
        registry.set('config', global.config);
        global.config.addPath(DIR_CONFIG);
        // Load the default config
        await global.config.load('default');
        await global.config.load(oc_strtolower(APPLICATION));
        // console.log('config--', global.config)

        // Set the default application
        global.config.set('application', APPLICATION);
        // Set the default time zone
        let dateTimezone = global.config.get('date_timezone');
        Intl.DateTimeFormat().resolvedOptions().timeZone = dateTimezone;
        // Logging
        console.log(global['\Opencart\System\Library\Log'])
        global.log = new (global['\Opencart\System\Library\Log'])(global.config.get('error_filename'));
        registry.set('log', global.log);
        // Event
        let event = new Event(registry);
        registry.set('event', event);
        // Event Register
        if (global.config.has('action_event')) {
            let actionEvents = global.config.get('action_event');
            for (let key in actionEvents) {
                let value = actionEvents[key];
                for (let priority in value) {
                    let action = value[priority];
                    await event.register(key, new Action(action), priority);
                }
            }
        }
        // Loader
        let loader = new Loader(registry);
        registry.set('load', loader);
        // Request
        let request = new RequestLibrary(req);
        registry.set('request', request);
        // Compatibility
        if (request.get['route']) {
            request.get['route'] = request.get['route'].replace('|', '.');
            request.get['route'] = request.get['route'].replace('%7C', '|');
        }
        // Response
        let response = new ResponseLibrary(res, req);
        registry.set('response', response);
        for (let header of global.config.get('response_header') || []) {
            response.addHeader(header);
        }
        response.addHeader('Access-Control-Allow-Origin: *');
        response.addHeader('Access-Control-Allow-Credentials: true');
        response.addHeader('Access-Control-Max-Age: 1000');
        response.addHeader('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding');
        response.addHeader('Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS, DELETE');
        response.addHeader('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        response.addHeader('Pragma: no-cache');
        response.setCompression(global.config.get('response_compression'));
        // Database
        if (global.config.get('db_autostart')) {
            let db = new DbLibrary(config.get('db_engine'), config.get('db_hostname'), config.get('db_username'), config.get('db_password'), config.get('db_database'), config.get('db_port'), config.get('db_debug'));
            await db.connect();
            // console.log('db=--=', db)
            registry.set('db', db);
        }
        // Session
        if (global.config.get('session_autostart')) {
            let session = new SessionLibrary(req.session);
            session.start(req.sessionID)
            registry.set('session', session);

        }
        // Cache
        let cache = new CacheLibrary(global.config.get('cache_engine'), global.config.get('cache_expire'));
        registry.set('cache', cache);
        // Template
        let template = new TemplateLibrary(global.config.get('template_engine'));
        registry.set('template', template);
        // console.log('config template', global.config.get('template_engine'))
        template.addPath(DIR_TEMPLATE);
        // Language
        let language = new LanguageLibrary(global.config.get('language_code'));
        language.addPath(DIR_LANGUAGE);
        await language.load('default');
        registry.set('language', language);
        // Url
        // console.log("global.config.get('site_url')==================",global.config.get('site_url'))
        registry.set('url', new UrlLibrary(global.config.get('site_url')));
        // Document
        registry.set('document', new DocumentLibrary());
        // Action error object to execute if any other actions cannot be executed.
        let action = '';
        let args = [];
        let output = '';
        let error = new Action(global.config.get('action_error'));
        // Pre Actions
        // console.log('framework', global.config.get('action_pre_action'))
        for (let pre_action of global.config.get('action_pre_action')) {
            let preActionInstance = new Action(pre_action);
            let result = await preActionInstance.execute(global.registry);
            if (result instanceof Action) {
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
                action = new Action(request.get.route);
            } else {
                action = new Action(global.config.get('action_default'));
            }
        }
        // Dispatch
        while (action) {
            // Route needs to be updated each time so it can trigger events
            let route = action.getId();
            // Keep the original trigger.
            let trigger = route;
            let result = await event.trigger(`controller/${trigger}/before`, [route, args]);
            if (result instanceof Action) {
                action = result;
            }
            // Execute the action.
            result = await action.execute(global.registry, args);
            action = '';
            if (result instanceof Action) {
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
            if (result instanceof Action) {
                action = result;
            }
        }
        // Output
        // console.log('outputData', response.level)
        // if (global.config.get('db_autostart')) {
        //     await registry.get('db').close();
        // }
        return response.output();
    }
}