const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "c01015118963@gmail.com",
    pass: "btbjdlserqbzhelb",
  },
});

async function sendEmail(email, otp, subject) {
  try {
    const info = await mailTransporter.sendMail({
      from: "c01015118963@gmail.com",
      to: email,
      subject: subject,
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`,
    });

    console.log(`Message sent`);
    return info;
  } catch (error) {
    throw new Error("Failed to send OTP email");
  }
}

module.exports = sendEmail;
