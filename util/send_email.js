const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
// const sgMail = require("@sendgrid/mail");
const { text } = require("body-parser");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
