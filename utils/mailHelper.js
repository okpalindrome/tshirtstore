const nodemailer = require("nodemailer")

const mailHelper = async (option) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_POST,
        // secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    
    const message = {
        from: process.env.SMTP_SENDER, // Add, even if it shows disabled on your mailtrap.io testing account
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
        // html: "<a></a>", // html body
    }
    
    // send mail with defined transport object
    await transporter.sendMail(message);
}

module.exports = mailHelper