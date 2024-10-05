const bcrypt = require('bcrypt');

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
global.ucfirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
global.microtime = (get_as_float = false) => {
    const hrTime = process.hrtime();
    if (get_as_float) {
        return hrTime[0] + hrTime[1] / 1e9;
    } else {
        return (hrTime[0] + hrTime[1] / 1e9) + ' ' + hrTime[0];
    }
}
global.password_hash = (string, saltRounds = 10) => {
    return bcrypt.hash(password, saltRounds)
}
global.http_build_query = (params = {}) => {
    return new URLSearchParams(params).toString();
}
global.isValidIP = (ip) => {
    // Simple IP validation regex
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}