// Import required libraries
const crypto = require('crypto');
// String
global.oc_strlen = (string) => {
    return string.length;
}
global.oc_strpos = (string, needle, offset = 0) => {
    return string.indexOf(needle, offset);
}
global.oc_strrpos = (string, needle, offset = 0) => {
    return string.lastIndexOf(needle, offset === 0 ? undefined : offset);
}
global.oc_substr = (string, offset, length = undefined) => {
    return string.slice(offset, length !== undefined ? offset + length : undefined);
}
global.oc_strtoupper = (string) => {
    return string.toUpperCase();
}
global.oc_strtolower = (string) => {
    return string.toLowerCase();
}
// Other
global.oc_token = (length = 32) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}
