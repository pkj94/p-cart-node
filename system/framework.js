
// Helper
module.exports = class Framework {
    async init(application_config, req, res, next) {
        // Registry
        global.registry = new Registry();
        // Config
        const config = new Config();
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
        const log = new Log(config.get('error_filename'));
        registry.set('log', log);
        // Event
        const event = new global.Event(registry);
        registry.set('event', event);
        // Event Register
        if (config.has('action_event')) {
            const actionEvents = config.get('action_event');
            for (let key in actionEvents) {
                const value = actionEvents[key];
                for (let priority in value) {
                    const action = value[priority];
                    await event.register(key, new Action(action), priority);
                }
            }
        }
        // Loader
        const loader = new Loader(registry);
        registry.set('load', loader);
        // Request
        const request = new global.Request(req);
        registry.set('request', request);

        // Response
        const response = new global.Response(res, req);

        response.addHeader('Content-Type: text/html; charset=utf-8');
        response.addHeader('Expires: Thu, 19 Nov 1981 08:52:00 GMT');
        response.addHeader('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        response.addHeader('Pragma: no-cache');
        response.setCompression(config.get('config_compression'));
        registry.set('response', response);
        // Database
        if (config.get('db_autostart')) {
            let db = new Db(config.get('db_engine'), config.get('db_hostname'), config.get('db_username'), config.get('db_password'), config.get('db_database'), config.get('db_port'), config.get('db_debug'));
            await db.connect();
            // console.log('db=--=', db)
            registry.set('db', db);
            // Set time zone
            const query = db.query("SELECT * FROM " + DB_PREFIX + "setting WHERE `key` = 'config_timezone' AND store_id = '0'");

            if (query.num_rows) {
                process.env.TZ = query.row['value'];
            }

            // Sync PHP and DB time zones
            db.query("SET time_zone = '" + db.escape(date('P')) + "'");
        }
        // Session
        if (config.get('session_autostart')) {
            let session = new global.Session(req.session);
            session.start(req.sessionID)
            registry.set('session', session);

        }
        // Cache
        const cache = new global.Cache(config.get('cache_engine'), config.get('cache_expire'));
        registry.set('cache', cache);
        // Url
        if (config.get('url_autostart')) {
            registry.set('url', new Url(config.get('site_url'), config.get('site_ssl')));
        }
        // Language
        const language = new Language(config.get('language_directory'));
        registry.set('language', language);

        // Document
        registry.set('document', new Document());
        // Config Autoload
        if (config.has('config_autoload')) {
            for (let value of config.get('config_autoload')) {
                loader.config(value);
            }
        }

        // Language Autoload
        if (config.has('language_autoload')) {
            for (let value of config.get('language_autoload')) {
                loader.language(value);
            }
        }

        // Library Autoload
        if (config.has('library_autoload')) {
            for (let value of config.get('library_autoload')) {
                loader.library(value);
            }
        }

        // Model Autoload
        if (config.has('model_autoload')) {
            for (let value of config.get('model_autoload')) {
                loader.model(value);
            }
        }
        // Route
        const route = new Router(registry);

        // Pre Actions
        if (config.has('action_pre_action')) {
            for (let value of config.get('action_pre_action')) {
                route.addPreAction(new Action(value));
            }
        }

        // Dispatch
        await route.dispatch(new Action(config.get('action_router')), new Action(config.get('action_error')));

        // await registry.get('cache').cleanUp()
        return response.output();
    }
}