const array_multisort = require('locutus/php/array/array_multisort')
module.exports = class DashboardController extends Controller {
    constructor(registry) {
        super(registry)
    }
    async index() {
        let data = {};
        await this.load.language('common/dashboard');
        this.document.setTitle(this.language.get('heading_title'));
        data['breadcrumbs'] = [];
        data['breadcrumbs'].push({
            'text': this.language.get('text_home'),
            'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
        });
        data['breadcrumbs'].push({
            'text': this.language.get('heading_title'),
            'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
        });
        // Dashboard Extensions
        let dashboards = [];
        this.load.model('setting/extension', this);
        // Get a list of installed modules
        let extensions = await this.model_setting_extension.getExtensionsByType('dashboard');
        // console.log('extensions-----',extensions);        
        // Add all the modules which have multiple settings for each module
        for (let extension of extensions) {
            if (this.config.get('dashboard_' + extension['code'] + '_status') && this.user.hasPermission('access', 'extension/' + extension['extension'] + '/dashboard/' + extension['code'])) {
                let output = await this.load.controller('extension/' + extension['extension'] + '/dashboard/' + extension['code'] + '.dashboard');
                //if (!output instanceof \Exception) {
                if (output) {
                    dashboards.push({
                        'code': extension['code'],
                        'width': this.config.get('dashboard_' + extension['code'] + '_width'),
                        'sort_order': this.config.get('dashboard_' + extension['code'] + '_sort_order'),
                        'output': output
                    });
                }
            }
        }
        let sort_order = [];
        for (let [key, value] of Object.entries(dashboards)) {
            sort_order[key] = value['sort_order'];
        }
        array_multisort(sort_order, 'ASC', dashboards);
        // Split the array so the columns width is not more than 12 on each row+
        let width = 0;
        let column = [];
        data['rows'] = [];
        for (let dashboard of dashboards) {
            column.push(dashboard);
            width = (width + dashboard['width']);
            if (width >= 12) {
                data['rows'].push(column);
                width = 0;
                column = [];
            }
        }
        if (column) {
            data['rows'].push(column);
        }
        if (this.user.hasPermission('access', 'common/developer')) {
            data['developer_status'] = true;
        } else {
            data['developer_status'] = false;
        }
        data['security'] = await this.load.controller('common/security');
        data['user_token'] = this.session.data['user_token'];
        data['header'] = await this.load.controller('common/header');
        data['column_left'] = await this.load.controller('common/column_left');
        data['footer'] = await this.load.controller('common/footer');
        this.response.setOutput(await this.load.view('common/dashboard', data));
    }
}