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
global.htmlspecialchars_decode = (text) => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
global.trim = (string) => {
    return string.trim();
}
global.preg_match = (patern, keyword) => {
    return new RegExp(patern).test(keyword);
}
global.str_replace = (find, replace, string) => {
    if (Array.isArray(find)) {
        for (let f of find)
            string = string.replace(f, replace || '');
    }
    return string.replace(new RegExp(find), replace || '');
}
global.multiSort = (array, sortObject = [], sort = 'ASC') => {
    const sortKeys = sortObject;

    // Return array if no sort object is supplied.
    if (!sortKeys.length) {
        return array;
    }

    const keySort = (a, b, direction) => {
        direction = direction !== null ? direction : 1;

        if (a === b) { // If the values are the same, do not switch positions.
            return 0;
        }

        // If b > a, multiply by -1 to get the reverse direction.
        return a > b ? direction : -1 * direction;
    };

    return array.sort((a, b) => {
        let sorted = 0;
        let index = 0;

        // Loop until sorted (-1 or 1) or until the sort keys have been processed.
        while (sorted === 0 && index < sortKeys.length) {
            const key = sortKeys[index];

            if (key) {
                const direction = sort ? sort == 'ASC' ? 1 : -1 : 0;

                sorted = keySort(a[key], b[key], direction);
                index++;
            }
        }

        return sorted;
    });
}