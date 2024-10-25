module.exports = class Mail {
    constructor(adaptor = 'mail', option = {}) {
        let className = 'Opencart\System\Library\Mail' + ucfirst(adaptor);

        if (global[className]) {
            this.option = option;
            this.adaptor = new global[className](option);
        } else {
            throw new Error(`Error: Could not load template adaptor ${adaptor}!`);
        }
    }

    setTo(to) {
        this.option.to = to;
    }

    setFrom(from) {
        this.option.from = from;
    }

    setSender(sender) {
        this.option.sender = sender;
    }

    setReplyTo(reply_to) {
        this.option.reply_to = reply_to;
    }

    setSubject(subject) {
        this.option.subject = subject;
    }

    setText(text) {
        this.option.text = text;
    }

    setHtml(html) {
        this.option.html = html;
    }

    addAttachment(filename) {
        this.option.attachments = this.option.attachments || [];
        this.option.attachments.push(filename);
    }

    send() {
        if (!this.option.to) {
            throw new Error('Error: E-Mail to required!');
        }

        if (!this.option.from) {
            throw new Error('Error: E-Mail from required!');
        }

        if (!this.option.sender) {
            throw new Error('Error: E-Mail sender required!');
        }

        if (!this.option.subject) {
            throw new Error('Error: E-Mail subject required!');
        }

        if (!this.option.text && !this.option.html) {
            throw new Error('Error: E-Mail message required!');
        }

        return this.adaptor.send();
    }
}


