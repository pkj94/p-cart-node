module.exports = class LoginController extends Controller {
    constructor(registry) {
        super(registry)
    }
    /**
     * @return void
     */
    async index() {
        let data = {};
        await  this.load.language('common/login');
        this.document.setTitle(this.language.get('heading_title'));
        // Check to see if user is already logged
        if (this.user.isLogged() && this.request.get['user_token'] && this.session.data['user_token'] && (this.request.get['user_token'] == this.session.data['user_token'])) {
            this.response.setRedirect(this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true));
        }
        // Check to see if user is using incorrect token
        if (this.request.get['user_token'] && (!this.session.data['user_token'] || (this.request.get['user_token'] != this.session.data['user_token']))) {
            data['error_warning'] = this.language.get('error_token');
        } else if (this.session.data['error']) {
            data['error_warning'] = this.session.data['error'];
            delete this.session.data['error'];
        } else {
            data['error_warning'] = '';
        }
        if (this.session.data['success']) {
            data['success'] = this.session.data['success'];
            delete this.session.data['success'];
        } else {
            data['success'] = '';
        }
        // Create a login token to prevent brute force attacks
        this.session.data.login_token = oc_token(32);
        data['login'] = this.url.link('common/login.login', 'login_token=' + this.session.data['login_token'], true);
        if (this.config.get('config_mail_engine')) {
            data['forgotten'] = this.url.link('common/forgotten');
        } else {
            data['forgotten'] = '';
        }
        if (this.request.get['route'] && this.request.get['route'] != 'common/login') {
            let args = this.request.get;
            let route = args['route'];
            delete args['route'];
            delete args['user_token'];
            let url = '';
            if (this.request.get) {
                url += http_build_query(args);
            }
            data['redirect'] = this.url.link(route, url);
        } else {
            data['redirect'] = '';
        }
        await this.session.save(this.session.data);
        data['header'] = await this.load.controller('common/header');
        data['footer'] = await this.load.controller('common/footer');
        this.response.setOutput(await this.load.view('common/login', data));
    }
    /**
     * @return void
     */
    async login() {
        await  this.load.language('common/login');
        let json = {};
        // Stop any undefined index messages.
        let keys = [
            'username',
            'password',
            'redirect'
        ];
        for (let key of keys) {
            if (!this.request.post[key]) {
                this.request.post[key] = '';
            }
        }
        // console.log(this.request.post)
        if (this.user.isLogged() && this.request.get['user_token'] && this.session.data['user_token'] && (this.request.get['user_token'] == this.session.data['user_token'])) {
            json['redirect'] = this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);
            // console.log(1)
        }
        if (!this.request.get['login_token'] || !this.session.data['login_token'] || this.request.get['login_token'] != this.session.data['login_token']) {
            this.session.data['error'] = this.language.get('error_login');
            json['redirect'] = this.url.link('common/login', '', true);
            // console.log(2)
        }
        if (!Object.keys(json).length && !await this.user.login(this.request.post['username'], this.request.post['password'])) {
            json['error'] = this.language.get('error_login');
        }

        if (!Object.keys(json).length) {
            this.session.data['user_token'] = oc_token(32);
            // Remove login token so it cannot be used again.
            delete this.session.data['login_token'];
            let login_data = {
                ip: this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress):''),
                user_agent: useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source,
            };
            this.load.model('user/user', this);
            await this.model_user_user.addLogin(this.user.getId(), login_data);
            if (this.request.post['redirect'] && (this.request.post['redirect'].indexOf(HTTP_SERVER) === 0)) {
                json['redirect'] = this.request.post['redirect'] + '&user_token=' + this.session.data['user_token'].replace('&amp;', '&');
                // console.log(3)
            } else {
                json['redirect'] = this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);
                // console.log(4,HTTP_SERVER,this.request.post['redirect'].indexOf(HTTP_SERVER))
            }
        }
        // console.log('common/login',this.session.data)
        await this.session.save(this.session.data);
        // console.log(json)
        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }
}