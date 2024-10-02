module.exports = class Footer extends Controller {
    constructor(registry) {
        super(registry)
    }
    async index() {
        await this.load.language('common/footer');
        const data = {
            text_project: this.language.get('text_project'),
            text_documentation: this.language.get('text_documentation'),
            text_support: this.language.get('text_support'),
            text_footer: this.language.get('text_footer')
        };
        return this.load.view('common/footer', data);
    }
}
