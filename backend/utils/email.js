const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(to, otp, type) {
  let subject, heading;

  switch (type) {
    case "delivery":
      subject = "TrackFlow - Delivery OTP Verification";
      heading = "Delivery Verification Code";
      break;
    case "pickup":
      subject = "TrackFlow - Pickup OTP Verification";
      heading = "Pickup Verification Code";
      break;
    case "signup":
      subject = "TrackFlow - Verify Your Email";
      heading = "Email Verification Code";
      break;
    default:
      subject = "TrackFlow - OTP Verification";
      heading = "Verification Code";
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f5f7fb; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2563eb; font-size: 28px; margin: 0;">🚚 TrackFlow</h1>
        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Smart Logistics Platform</p>
      </div>

      <div style="background: white; border-radius: 14px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <h2 style="color: #111827; text-align: center; margin-bottom: 10px;">${heading}</h2>
        <p style="color: #6b7280; text-align: center; font-size: 14px; margin-bottom: 25px;">
          Use the following OTP to verify your ${type === "signup" ? "email" : type}:
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="
            display: inline-block;
            font-size: 42px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: 10px;
            padding: 15px 30px;
            background: #eff6ff;
            border-radius: 12px;
            border: 2px dashed #2563eb;
          ">${otp}</span>
        </div>

        <p style="color: #9ca3af; text-align: center; font-size: 13px; margin-top: 20px;">
          This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

        <p style="color: #9ca3af; text-align: center; font-size: 12px;">
          This email was sent from TrackFlow. If you didn't request this, please ignore.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TrackFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.messageId);
  return info;
}

module.exports = { sendOTPEmail };
