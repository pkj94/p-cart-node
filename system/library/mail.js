/**
 * @package		OpenCart
 * @author		Daniel Kerr
 * @copyright	Copyright (c) 2005 - 2017, OpenCart, Ltd. (https://www.opencart.com/)
 * @license		https://opensource.org/licenses/GPL-3.0
 * @link		https://www.opencart.com
*/

/**
* Mail class
*/
module.exports = class Mail {


    /**
     * Constructor
     *
     * @param	string	adaptor
     *
      */
    constructor(adaptor = 'mail') {
        let className = 'Mail' + ucfirst(adaptor);
        if (global[className]) {
            this.adaptor = new global[className]();
            this.attachments = [];
        } else {
            throw new Error(`Error: Could not load mail adaptor ${adaptor}!`);
        }

    }

    /**
     * 
     *
     * @param	mixed	to
     */
    async setTo(to) {
        this.to = to;
    }

    /**
     * 
     *
     * @param	string	from
     */
    async setFrom(from) {
        this.from = from;
    }

    /**
     * 
     *
     * @param	string	sender
     */
    async setSender(sender) {
        this.sender = sender;
    }

    /**
     * 
     *
     * @param	string	reply_to
     */
    async setReplyTo(reply_to) {
        this.reply_to = reply_to;
    }

    /**
     * 
     *
     * @param	string	subject
     */
    async setSubject(subject) {
        this.subject = subject;
    }

    /**
     * 
     *
     * @param	string	text
     */
    async setText(text) {
        this.text = text;
    }

    /**
     * 
     *
     * @param	string	html
     */
    async setHtml(html) {
        this.html = html;
    }

    /**
     * 
     *
     * @param	string	filename
     */
    async addAttachment(filename) {
        this.attachments.push(filename);
    }

    /**
     * 
     *
     */
    async send() {
        if (!this.to) {
            throw new Error('Error: E-Mail to required!');
        }

        if (!this.from) {
            throw new Error('Error: E-Mail from required!');
        }

        if (!this.sender) {
            throw new Error('Error: E-Mail sender required!');
        }

        if (!this.subject) {
            throw new Error('Error: E-Mail subject required!');
        }

        if ((!this.text) && (!this.html)) {
            throw new Error('Error: E-Mail message required!');
        }

        for (let [key, value] of Object.entries(this)) {
            this.adaptor.key = value;
        }

        await this.adaptor.send();
    }
}