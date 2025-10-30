// utils/notify.js
import nodemailer from "nodemailer";

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export const sendNotification = async ({
  to,
  subject,
  message,
  type = "email",
}) => {
  try {
    if (type === "email") {
      if (transporter) {
        // ✅ Real Email Notification
        await transporter.sendMail({
          from: `"CRM Helpdesk" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 10px;">
              <h3>${subject}</h3>
              <p>${message}</p>
              <br/>
              <p style="font-size: 12px; color: #888;">This is an automated message from CRM Helpdesk.</p>
            </div>
          `,
        });
        console.log(`📧 Email sent successfully to ${to}`);
      } else {
        // 🧪 Mock Email Notification (if no credentials)
        console.log("========================================");
        console.log(`📧 MOCK EMAIL`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        console.log("========================================");
      }
    } else if (type === "sms") {
      // We'll integrate Twilio later in Step 5
      console.log("========================================");
      console.log(`📱 MOCK SMS`);
      console.log(`To: ${to}`);
      console.log(`Message: ${message}`);
      console.log("========================================");
    }
  } catch (error) {
    console.error(`Notification Error (${type}):`, error.message);
  }
};
