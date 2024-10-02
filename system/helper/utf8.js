// Import required libraries
const utf8 = require('utf8');
// Set internal encoding to UTF-8
utf8.encode('UTF-8');
global.strlen = (string) => {
    return string.length;
}
global.strpos = (string, needle, offset = 0) => {
    return string.indexOf(needle, offset);
}
global.strrpos = (string, needle, offset = 0) => {
    return string.lastIndexOf(needle, offset === 0 ? undefined : offset);
}
global.substr = (string, offset, length = undefined) => {
    return string.slice(offset, length !== undefined ? offset + length : undefined);
}
global.strtoupper = (string) => {
    return string.toUpperCase();
}
global.strtolower = (string) => {
    return string.toLowerCase();
}