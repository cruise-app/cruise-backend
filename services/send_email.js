const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email from environment variables
    pass: process.env.EMAIL_PASS, // App Password from environment variables
  },
});

async function sendEmail(email, otp, subject) {
  try {
    const info = await transporter.sendMail({
      from: '"CRUISE" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: subject,
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`,
    });

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
