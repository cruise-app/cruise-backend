const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
require("dotenv").config(); // Load environment variables

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

async function sendEmail(email, otp, subject) {
  try {
    const info = await transporter.sendMail({
      from: "mohamedkilany070@gmail.com",
      to: email,
      subject: subject,
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`,
    });

    console.log(`Message sent`);
    return;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
