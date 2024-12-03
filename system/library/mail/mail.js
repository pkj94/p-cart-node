const nodemailer = require('nodemailer');

module.exports = class Mail {
    
    async send() {

        this.transporter = nodemailer.createTransport({
            // Configure the mail transport service (e.g., SMTP, sendmail)
            host: this.smtp_hostname || 'localhost',
            port: this.smtp_port ? Number(this.smtp_port) : 25,
            secure: this.secure || false, // true for 465, false for other ports
            auth: {
                user: this.smtp_username,
                pass: this.smtp_password
            }
        });
        const attachments = this.attachments.map(filePath => {
            return {
                filename: expressPath.basename(filePath),
                path: filePath,
                contentType: 'application/octet-stream'
            };
        });

        const mailOptions = {
            from: `"${this.sender}" <${this.from}>`,
            to: this.to.join(','),
            replyTo: this.reply_to || this.from,
            subject: this.subject,
            text: this.text,
            html: this.html,
            attachments: attachments
        };

        try {
            let info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
