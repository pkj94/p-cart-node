const bcrypt = require('bcrypt');
const htmlEntity = require('html-entities');
// Import required libraries
const crypto = require('crypto');
const md5 = require('locutus/php/strings/md5');

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
global.password_hash = async (string, saltRounds = 10) => {
    return await bcrypt.hash(string, saltRounds)
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
global.str_replace = (find, replace, string = '') => {
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
global.html_entity_decode = (encodedString = '') => {
    return htmlEntity.decode(encodedString);
}
global.html_entity_encode = (encodedString = '') => {
    return htmlEntity.encode(encodedString);
}
global.rtrim = (string) => {
    return string.replace(/\/*$/, '')
}
global.ltrim = (string) => {
    return string.replace(/^\/*/, '')
}
global.uploadFile = (file, save) => {
    return new Promise((resolve, reject) => {
        file.mv(save, function (err) {
            if (err)
                reject(true);
            else
                resolve(save)
        })
    })
}
global.md5 = (string) => {
    return md5(string)
}
global.strip_tags = (input, allowed) => {
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
    var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
    })
}
global.hash_hmac = (string, secret) => {
    return crypto.createHmac('sha1', secret)
        .update(string)
        .digest('hex')
}
global.isEmailValid = (email) => {
    var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (!email)
        return false;

    if (email.length > 254)
        return false;

    var valid = emailRegex.test(email);
    if (!valid)
        return false;

    // Further checking of some things regex can't handle
    var parts = email.split("@");
    if (parts[0].length > 64)
        return false;

    var domainParts = parts[1].split(".");
    if (domainParts.some(function (part) { return part.length > 63; }))
        return false;

    return true;
}
global.time = () => {
    return Math.floor(Date.now() / 1000);
}
global.createStream = (file, position) => {
    return new Promise((resolve, reject) => {
        const handle = fs.createReadStream(file, { start: position });
        let chunk = ''
        handle.on('data', (chunk) => {
            chunk = chunk.toString();
            handle.close();
        });

        handle.on('end', () => {
            resolve(chunk)
        });
        handle.on('error', (err) => {
            reject(err);
        });
    })
}
global.getAllMethods = (obj) => {
    let properties = new Set();
    let currentObj = obj;
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}
global.bin2hex = (length = 26) => {
    return crypto.randomBytes(26).toString('hex').substring(0, length);
}
global.is_file = (file) => {
    return fs.existsSync(file) ? fs.statSync(file).isFile() : false;
}
global.is_dir = (file) => {
    return fs.existsSync(file) ? fs.statSync(file).isDirectory() : false;
}