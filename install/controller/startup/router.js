module.exports = class ControllerStartupRouter extends Controller {
    index() {
        if (this.request.get['route'] && this.request.get['route'] != 'action/route') {
            return new Action(this.request.get['route']);
        } else {
            return new Action(this.config.get('action_default'));
        }
    }
}