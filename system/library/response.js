
module.exports = class ResponseLibrary {
  constructor(res) {
    this.response = res;
    this.headers = [];
    this.level = 0;
    this.outputData = '';
    this.redirect = '';
  }
  addHeader(header) {
    this.headers.push(header);
  }
  getHeaders() {
    return this.headers;
  }
  setRedirect(url, status = 302) {
    this.redirect = (url.replace(/&amp;/g, '&').replace(/\n|\r/g, ''));
  }
  setCompression(level) {
    this.level = level;
  }
  setOutput(output) {
    this.outputData = output;
  }
  getOutput() {
    return this.outputData;
  }
  compress(data, level = 0) {
    if (typeof data !== 'string') {
      return data;
    }
    let encoding;
    if (req.headers['accept-encoding'].includes('gzip')) {
      encoding = 'gzip';
    } else if (req.headers['accept-encoding'].includes('x-gzip')) {
      encoding = 'x-gzip';
    }
    if (!encoding || (level < -1 || level > 9)) {
      return data;
    }
    const zlib = require('zlib');
    if (!zlib || req.headersSent) {
      return data;
    }
    this.addHeader(`Content-Encoding: ${encoding}`);
    return zlib.gzipSync(data, { level });
  }
  output() {
    const outputData = this.level ? this.compress(this.outputData, this.level) : this.outputData;
    // this.headers.forEach(header => {
    //   this.response.header(header.split(':')[0].trim(), header.split(':')[1].trim());
    // });
    return outputData;
  }
}