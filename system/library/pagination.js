module.exports = class Pagination {
    constructor() {
        this.total = 0;
        this.page = 1;
        this.limit = 20;
        this.numLinks = 8;
        this.url = '';
        this.textFirst = '|&lt;';
        this.textLast = '&gt;|';
        this.textNext = '&gt;';
        this.textPrev = '&lt;';
    }

    render() {
        let total = this.total;
        let page = this.page < 1 ? 1 : this.page;
        let limit = !parseInt(this.limit) ? 10 : this.limit;
        let numLinks = this.numLinks;
        let numPages = Math.ceil(total / limit);

        this.url = this.url.replace('%7Bpage%7D', '{page}');

        let output = '<ul class="pagination">';

        if (page > 1) {
            output += '<li><a href="' + this.url.replace(/(&amp;page=\{page\}|\?page=\{page\}|&page=\{page\})/, '') + '">' + this.textFirst + '</a></li>';

            if (page - 1 === 1) {
                output += '<li><a href="' + this.url.replace(/(&amp;page=\{page\}|\?page=\{page\}|&page=\{page\})/, '') + '">' + this.textPrev + '</a></li>';
            } else {
                output += '<li><a href="' + this.url.replace('{page}', page - 1) + '">' + this.textPrev + '</a></li>';
            }
        }

        if (numPages > 1) {
            let start, end;

            if (numPages <= numLinks) {
                start = 1;
                end = numPages;
            } else {
                start = page - Math.floor(numLinks / 2);
                end = page + Math.floor(numLinks / 2);

                if (start < 1) {
                    end += Math.abs(start) + 1;
                    start = 1;
                }

                if (end > numPages) {
                    start -= (end - numPages);
                    end = numPages;
                }
            }

            for (let i = start; i <= end; i++) {
                if (page == i) {
                    output += '<li class="active"><span>' + i + '</span></li>';
                } else {
                    if (i === 1) {
                        output += '<li><a href="' + this.url.replace(/(&amp;page=\{page\}|\?page=\{page\}|&page=\{page\})/, '') + '">' + i + '</a></li>';
                    } else {
                        output += '<li><a href="' + this.url.replace('{page}', i) + '">' + i + '</a></li>';
                    }
                }
            }
        }

        if (page < numPages) {
            output += '<li><a href="' + this.url.replace('{page}', page + 1) + '">' + this.textNext + '</a></li>';
            output += '<li><a href="' + this.url.replace('{page}', numPages) + '">' + this.textLast + '</a></li>';
        }

        output += '</ul>';

        return numPages > 1 ? output : '';
    }
}  