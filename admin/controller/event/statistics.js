module.exports = class StatisticsController extends Controller {
    constructor(registry) {
        super(registry)
    }

    async addReview(route, args, output) {
        this.load.model('report/statistics', this);
        await this.model_report_statistics.addValue('review', 1);
    }

    async deleteReview(route, args, output) {
        this.load.model('report/statistics', this);
        await this.model_report_statistics.removeValue('review', 1);
    }

    async addReturn(route, args, output) {
        this.load.model('report/statistics', this);
        await this.model_report_statistics.addValue('returns', 1);
    }

    async deleteReturn(route, args, output) {
        this.load.model('report/statistics', this);
        await this.model_report_statistics.removeValue('returns', 1);
    }
}

