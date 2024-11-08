module.exports = class ControllerEventStatistics extends Controller {
	// model/catalog/review/removeReview/after
	async removeReview(&route, &args, &output) {
		this.load.model('setting/statistics');

		await this.model_report_statistics.addValue('review', 1);
	}

	// model/sale/return/removeReturn/after
	async removeReturn(&route, &args, &output) {
		this.load.model('setting/statistics');

		await this.model_report_statistics.addValue('return', 1);
	}
}
