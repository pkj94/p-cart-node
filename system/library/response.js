
module.exports = class Response {
  constructor(res, req) {
    this.response = res;
    this.headers = [];
    this.level = 0;
    this.status = 200;
    this.outputData = '';
    this.redirect = '';
    this.file = '';
    this.end = '';
    this.request = req
  }
  addHeader(header) {
    this.headers.push(header);
  }
  getHeaders() {
    return this.headers;
  }
  setRedirect(url, status = 302) {
    // console.log(url)
    this.redirect = (url.replace(/&amp;/g, '&').replace(/\n|\r/g, ''));
    // this.response.redirect(this.redirect);
  }
  setCompression(level) {
    this.level = level;
  }
  setFile(file) {
    this.file = file;
  }
  setStatus(status) {
    this.status = status;
  }
  setOutput(output) {
    this.outputData = output;
  }
  setEnd(output) {
    this.end = output;
  }
  getOutput() {
    return this.outputData;
  }
  compress(data, level = 0) {
    if (typeof data !== 'string') {
      return data;
    }
    let encoding;
    if (this.request.headers['accept-encoding'].includes('gzip')) {
      encoding = 'gzip';
    } else if (this.request.headers['accept-encoding'].includes('x-gzip')) {
      encoding = 'x-gzip';
    }
    if (!encoding || (level < -1 || level > 9)) {
      return data;
    }
    const zlib = require('zlib');
    if (!zlib || this.request.headersSent) {
      return data;
    }
    this.addHeader(`Content-Encoding: ${encoding}`);
    return zlib.gzipSync(data, { level: Number(level) });
  }
  output() {
    const outputData = this.level ? this.compress(this.outputData, this.level) : this.outputData;
    return outputData;
  }
}