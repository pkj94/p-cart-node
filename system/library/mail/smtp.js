const nodemailer = require('nodemailer');

module.exports = class Smtp {
    constructor() {
        this.to = '';
        this.from = '';
        this.sender = '';
        this.reply_to = '';
        this.subject = '';
        this.text = '';
        this.html = '';
        this.attachments = [];
        this.parameter = '';
    }



    async send() {
        if (!this.to) throw new Error('Error: E-Mail to required!');
        if (!this.from) throw new Error('Error: E-Mail from required!');
        if (!this.sender) throw new Error('Error: E-Mail sender required!');
        if (!this.subject) throw new Error('Error: E-Mail subject required!');
        if (!this.text && !this.html) throw new Error('Error: E-Mail message required!');

        const transporter = nodemailer.createTransport({
            host: this.smtp_hostname,
            port: this.smtp_port,
            secure: this.smtp_port === 465, // true for 465, false for other ports
            auth: {
                user: this.smtp_username,
                pass: this.smtp_password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"${this.sender}" <${this.from}>`,
            to: Array.isArray(this.to) ? this.to.join(',') : this.to,
            replyTo: this.reply_to || this.from,
            subject: this.subject,
            text: this.text,
            html: this.html,
            attachments: this.attachments
        };

        try {
            let info = await transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
