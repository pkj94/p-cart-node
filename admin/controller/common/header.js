const fs = require('fs');
module.exports = class HeaderController extends Controller {
    constructor(registry) {
        super(registry)
    }

    async index() {
        const data = {
            lang: this.language.get('code'),
            direction: this.language.get('direction'),
            title: this.document.getTitle(),
            base: HTTP_SERVER,
            description: this.document.getDescription(),
            keywords: this.document.getKeywords(),
            bootstrap: 'view/stylesheet/bootstrap.css',
            icons: 'view/stylesheet/fonts/fontawesome/css/all.min.css',
            stylesheet: 'view/stylesheet/stylesheet.css',
            jquery: 'view/javascript/jquery/jquery-3.7.1.min.js',
            links: this.document.getLinks(),
            styles: this.document.getStyles(),
            scripts: this.document.getScripts()
        };

        await this.language.load('common/header');

        if (!this.request.get.user_token || !this.session.data.user_token || this.request.get.user_token !== this.session.data.user_token) {
            data.logged = false;
            data.home = this.url.link('common/login');
        } else {
            data.logged = true;
            data.home = this.url.link('common/dashboard', { user_token: this.session.data.user_token });

            data.language = await this.load.controller('common/language');
            
            // Notifications
            const filter_data = {
                start: 0,
                limit: 5
            };

            data.notifications = [];
            this.load.model('tool/notification',this);

            let results = await this.model_tool_notification.getNotifications(filter_data);
            
            for (const result of results) {
                data.notifications.push({
                    title: result.title,
                    href: this.url.link('tool/notification.info', { user_token: this.session.data.user_token, notification_id: result.notification_id })
                });
            }

            data.notification_all = this.url.link('tool/notification', { user_token: this.session.data.user_token });
            data.notification_total = await this.model_tool_notification.getTotalNotifications({ filter_status: 0 });

            data.profile = this.url.link('user/profile', { user_token: this.session.data.user_token });

            this.load.model('tool/image',this);
            data.image = await this.model_tool_image.resize('profile.png', 45, 45);
            this.load.model('user/user',this);
            const user_info = await this.model_user_user.getUser(this.user.getId());

            if (user_info) {
                data.firstname = user_info.firstname;
                data.lastname = user_info.lastname;
                data.username = user_info.username;
                data.user_group = user_info.user_group;

                if (fs.existsSync(DIR_IMAGE+ user_info.image)) {
                    data.image = await this.model_tool_image.resize(user_info.image, 45, 45);
                }
            } else {
                data.firstname = '';
                data.lastname = '';
                data.user_group = '';
            }

            data.stores = [{
                name: this.config.get('config_name'),
                href: HTTP_CATALOG
            }];

            this.load.model('setting/store',this);
            const storeResults = await this.model_setting_store.getStores();
            for (const result of storeResults) {
                data.stores.push({
                    name: result.name,
                    href: result.url
                });
            }

            data.logout = this.url.link('common/logout', { user_token: this.session.data.user_token });
        }
        return await this.load.view('common/header', data);
    }
}

