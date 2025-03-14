const accountSid = "ACe844238cbc41ac543ece643d7fd7b996";
const authToken = "d0dc2c4d614f745f3e245ca0b604f8d3";
const client = require("twilio")(accountSid, authToken);

async function sendSMS(phoneNumber, otp, subject) {
  try {
    await client.messages.create({
      from: "+12629882324",
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
