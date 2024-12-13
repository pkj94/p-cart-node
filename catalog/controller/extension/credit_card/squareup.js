module.exports = 
class ControllerExtensionCreditCardSquareup extends Controller {
    async index() {
const data = {};
        if (!await this.customer.isLogged()) {
            this.session.data['redirect'] = await this.url.link('account/account', '', true);
            await this.session.save(this.session.data);
            this.response.setRedirect(await this.url.link('account/login', '', true));
        }

        await this.load.language('extension/credit_card/squareup');

        this.load.model('extension/credit_card/squareup');

        this.document.setTitle(this.language.get('heading_title'));

        data['breadcrumbs'] = [];

        data['breadcrumbs'].push({
            'text' : this.language.get('text_home'),
            'href' : await this.url.link('common/home')
        );

        data['breadcrumbs'].push({
            'text' : this.language.get('text_account'),
            'href' : await this.url.link('account/account', '', true)
        );

        data['breadcrumbs'].push({
            'text' : this.language.get('heading_title'),
            'href' : await this.url.link('extension/credit_card/squareup', '', true)
        );

        if ((this.session.data['success'])) {
            data['success'] = this.session.data['success'];

            delete this.session.data['success']);
        } else {
            data['success'] = '';
        } 

        if ((this.session.data['error'])) {
            data['error'] = this.session.data['error'];

            delete this.session.data['error']);
        } else {
            data['error'] = '';
        } 

        data['back'] = await this.url.link('account/account', '', true);

        data['cards'] = array();

        for (await this.model_extension_credit_card_squareup.getCards(await this.customer.getId(), this.config.get('payment_squareup_enable_sandbox')) of card) {
            data['cards'].push(array(
                'text' : sprintf(this.language.get('text_card_ends_in'), card['brand'], card['ends_in']),
                'delete' : await this.url.link('extension/credit_card/squareup/forget', 'squareup_token_id=' + card['squareup_token_id'], true)
            );
        }

        data['column_left'] = await this.load.controller('common/column_left');
        data['column_right'] = await this.load.controller('common/column_right');
        data['content_top'] = await this.load.controller('common/content_top');
        data['content_bottom'] = await this.load.controller('common/content_bottom');
        data['footer'] = await this.load.controller('common/footer');
        data['header'] = await this.load.controller('common/header');
        
        this.response.setOutput(await this.load.view('extension/credit_card/squareup', data));
    }

    async forget() {
        if (!await this.customer.isLogged()) {
            this.session.data['redirect'] = await this.url.link('account/account', '', true);
            await this.session.save(this.session.data);
            this.response.setRedirect(await this.url.link('account/login', '', true));
        }

        await this.load.language('extension/credit_card/squareup');

        this.load.model('extension/credit_card/squareup');

        this.load.library('squareup');

        squareup_token_id = !empty(this.request.get['squareup_token_id']) ?
            this.request.get['squareup_token_id'] : 0;

        if (await this.model_extension_credit_card_squareup.verifyCardCustomer(squareup_token_id,await  this.customer.getId())) {
            card_info = await this.model_extension_credit_card_squareup.getCard(squareup_token_id);

            customer_info = await this.model_extension_credit_card_squareup.getCustomer(await this.customer.getId(), card_info['sandbox']);
            
            try {
                this.squareup.deleteCard(customer_info['square_customer_id'], card_info['token']);
                
                await this.model_extension_credit_card_squareup.deleteCard(squareup_token_id);
                
                this.session.data['success'] = this.language.get('text_success_card_delete');
            } catch (\Squareup\Exception e) {
                this.session.data['error'] = e.getMessage();
            }
        }

        this.response.setRedirect(await this.url.link('extension/credit_card/squareup', '', true));
    }
}