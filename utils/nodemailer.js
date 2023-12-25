const nodemailer = require("nodemailer");
const ErrorHandler = require("./errorHandler");


exports.sendmail = (req, res, next, otp) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_EMAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: "akash's chat app",
        to: req.body.email,
        subject: "Password Reset Link",
        // Text: "Do not share this link to anyone",
        html: `<h1>${otp}</h1>
               <h3>Here is your one time password</h3>`
    };

    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            return next(new ErrorHandler(err, 500));
        }
        console.log(info)
        return res.status(200).json({
            message: "mail send succesfully",
            otp
        })
    })

}