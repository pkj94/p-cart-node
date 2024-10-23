global['\Opencart\Install\Controller\Common\Header'] = class Header extends global['\Opencart\System\Engine\Controller'] {
    constructor(registry) {
        super(registry);
    }
    async index() {
        await this.load.language('common/header');
        const data = {
            title: this.document.getTitle(),
            description: this.document.getDescription(),
            base: HTTP_SERVER,
            links: this.document.getLinks(),
            styles: this.document.getStyles(),
            scripts: this.document.getScripts()
        };
        return this.load.view('common/header', data);
    }
}
