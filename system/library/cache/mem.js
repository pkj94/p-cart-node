// The legacy 'memcache' npm package is abandoned and crashes on modern Node.js
// (it relies on the removed process.EventEmitter), so 'mem' reuses the memcached driver.
const CacheMemcachedLibrary = require('./memcached');

module.exports = class CacheMemLibrary extends CacheMemcachedLibrary {
}
