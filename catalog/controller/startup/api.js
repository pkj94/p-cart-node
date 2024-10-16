module.exports=class ApiController extends Controller {
	/**
	 * @return object|\Opencart\System\Engine\Action|null
	 */
	async index() {
		if ((this->request->get['route'])) {
			route = (string)this->request->get['route'];
		} else {
			route = '';
		}

		if (substr(route, 0, 4) == 'api/' && route !== 'api/account/login' && !(this->session->data['api_id'])) {
			return new \Opencart\System\Engine\Action('error/permission');
		}

		return null;
	}
}
