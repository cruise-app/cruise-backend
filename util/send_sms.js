require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function sendSMS(phoneNumber, otp, subject) {
  try {
    await client.messages.create({
      from: "+12679362284",
      to: phoneNumber,
      subject: subject,
      body: `Your OTP is ${otp}`,
    });
    console.log("Inner log: OTP sent successfully");
    return true;
  } catch (error) {
    console.log("Inner log: Error Sending SMS: ", error);
    throw new Error("Failed to send OTP via SMS");
  }
}

module.exports = sendSMS;
