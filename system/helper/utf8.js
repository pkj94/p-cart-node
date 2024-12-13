// Import required libraries
const utf8 = require('utf8');
// Set internal encoding to UTF-8
utf8.encode('UTF-8');
global.utf8_strlen = (string) => {
    return string.length;
}
global.utf8_strpos = (string, needle, offset = 0) => {
    return string.indexOf(needle, offset);
}
global.utf8_strrpos = (string, needle, offset = 0) => {
    return string.lastIndexOf(needle, offset === 0 ? undefined : offset);
}
global.utf8_substr = (string, offset, length = undefined) => {
    return string.slice(offset, length !== undefined ? offset + length : undefined);
}
global.utf8_strtoupper = (string) => {
    return string.toUpperCase();
}
global.utf8_strtolower = (string) => {
    return string.toLowerCase();
}