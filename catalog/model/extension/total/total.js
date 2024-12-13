module.exports = class ModelExtensionTotalTotal extends Model {
	async getTotal(total) {
		await this.load.language('extension/total/total');

		total['totals'].push({
			'code': 'total',
			'title': this.language.get('text_total'),
			'value': Math.max(0, total['total']),
			'sort_order': this.config.get('total_total_sort_order')
		});
		return total;
	}
}