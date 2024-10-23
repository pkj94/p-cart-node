const nodemailer = require('nodemailer');

module.exports = class Smtp {
    constructor(option = {}) {
        this.option = option;
        this.transporter = nodemailer.createTransport({
            host: this.option.smtp_hostname || 'localhost',
            port: this.option.smtp_port ? Number(this.option.smtp_port) : 25,
            secure: this.option.secure || false, // true for 465, false for other ports
            auth: {
                user: this.option.smtp_username,
                pass: this.option.smtp_password
            }
        });
        
    }

    async send() {
        let { to, from, sender, reply_to, subject, text, html, attachments = [] } = this.option;

        if (!to) throw new Error('Error: E-Mail to required!');
        if (!from) throw new Error('Error: E-Mail from required!');
        if (!sender) throw new Error('Error: E-Mail sender required!');
        if (!subject) throw new Error('Error: E-Mail subject required!');
        if (!text && !html) throw new Error('Error: E-Mail message required!');

        let mailOptions = {
            from: `${sender} <${from}>`,
            to: Array.isArray(to) ? to.join(',') : to,
            replyTo: reply_to || `${sender} <${from}>`,
            subject: subject,
            text: text,
            html: html,
            attachments: attachments.map(filename => ({
                path: filename
            }))
        };

        try {
            let info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.log(error)
            throw new Error(`Error: Could not send mail! Message: ${error.message}`);
        }
    }
}


