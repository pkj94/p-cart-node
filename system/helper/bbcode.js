/**
 * BBCode Converter that converts BBCode written for OpenCart
 * @param {string} string - The input string containing BBCode
 * @returns {string} The decoded string with HTML tags
 */
global.oc_bbcode_decode = (string) => {
    const patterns = [
        // Bold
        { pattern: /\[b\](.*?)\[\/b\]/is, replace: '<strong>$1</strong>' },
        // Italic
        { pattern: /\[i\](.*?)\[\/i\]/is, replace: '<em>$1</em>' },
        // Underlined
        { pattern: /\[u\](.*?)\[\/u\]/is, replace: '<u>$1</u>' },
        // Quote
        { pattern: /\[quote\](.*?)\[\/quote]/is, replace: '<blockquote>$1</blockquote>' },
        // Code
        { pattern: /\[code\](.*?)\[\/code\]/is, replace: '<code>$1</code>' },
        // Strikethrough
        { pattern: /\[s\](.*?)\[\/s\]/is, replace: '<s>$1</s>' },
        // List Item
        { pattern: /\[\*\]([\w\W]+?)\n?(?=(?:(?:\[\*\])|(?:\[\/list\])))/g, replace: '<li>$1</li>' },
        // List
        { pattern: /\[list\](.*?)\[\/list\]/is, replace: '<ul>$1</ul>' },
        // Ordered List
        { pattern: /\[list\=(1|A|a|I|i)\](.*?)\[\/list\]/is, replace: '<ol type="$1">$2</ol>' },
        // Image
        { pattern: /\[img\](.*?)\[\/img\]/is, replace: '<img src="$1" alt="" class="img-fluid" />' },
        // URL
        { pattern: /\[url\](.*?)\[\/url\]/is, replace: '<a href="$1" rel="nofollow" target="_blank">$1</a>' },
        // URL (named)
        { pattern: /\[url\=([^\[]+?)\](.*?)\[\/url\]/is, replace: '<a href="$1" rel="nofollow" target="_blank">$2</a>' },
        // Font Size
        { pattern: /\[size\=([\-\+]?\d+)\](.*?)\[\/size\]/is, replace: '<span style="font-size: $1%;">$2</span>' },
        // Font Color
        { pattern: /\[color\=(#[0-9a-f]{3}|#[0-9a-f]{6}|[a-z\-]+)\](.*?)\[\/color\]/is, replace: '<span style="color: $1;">$2</span>' },
        // YouTube
        { pattern: /\[youtube\](.*?)\[\/youtube\]/is, replace: '<iframe width="560" height="315" src="http://www.youtube.com/embed/$1" allowfullscreen></iframe>' }
    ];
    patterns.forEach(({ pattern, replace }) => {
        string = string.replace(new RegExp(pattern, 'g'), replace);
    });
    return string;
}
