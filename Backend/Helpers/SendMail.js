import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Reusable transporter helper
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: (process.env.EMAIL_USER || "").trim(),
      pass: (process.env.EMAIL_PASS || "").trim(),
    },
  });
};

export const sendOTPEmail = async (to, otp, subject = "Verify Your Account - OTP", title = "Account Verification") => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"ElectriciToys Hub" <${(process.env.EMAIL_USER || "").trim()}>`,
      to: (to || "").toLowerCase().trim(),
      subject,
      replyTo: (process.env.EMAIL_USER || "").trim(),
      text: `Your OTP for account verification is ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 600px; margin: auto; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
             <h2 style="color: #C78023; margin: 0; font-size: 24px;">${title}</h2>
             <div style="width: 60px; height: 3px; background-color: #C78023; margin: 10px auto;"></div>
          </div>
          <div style="padding: 10px 0;">
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">Use the following One-Time Password (OTP) to complete your verification with <strong>ElectriciToys</strong>:</p>
            <div style="text-align: center; margin: 35px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 8px; background: #f8f8f8; padding: 15px 25px; border-radius: 10px; border: 1px solid #ddd; display: inline-block;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #d9534f; text-align: center; font-weight: bold;">This OTP is valid for 10 minutes.</p>
            <p style="font-size: 13px; color: #777; text-align: center;">For security reasons, do not share this code with anyone.</p>
          </div>
          <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="font-size: 12px; color: #999; margin-bottom: 5px;">If you did not request this, please ignore this email.</p>
            <p style="font-size: 12px; color: #999; margin: 0;">&copy; ${new Date().getFullYear()} ElectriciToys Hub. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] ID: ${info.messageId} to ${to}`);
    return true;

  } catch (error) {
    console.error("Critical Email Error:", error.message);
    throw new Error("Failed to send verification email. Please try again later.");
  }
};

export const sendContactEmail = async (adminEmail, contactData) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"ElectriciToys Contact" <${(process.env.EMAIL_USER || "").trim()}>`,
      to: (adminEmail || "").toLowerCase().trim(),
      replyTo: (contactData.email || "").trim(),
      subject: `New Message from ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
          <h2 style="color: #C78023; border-bottom: 2px solid #C78023; padding-bottom: 10px;">New Contact Received</h2>
          <div style="margin-top: 20px; color: #333;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <div style="background: #ffffff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-top: 15px;">
              <strong>Message:</strong><br/>
              <p style="margin-top: 10px; line-height: 1.5; white-space: pre-wrap;">${contactData.message}</p>
            </div>
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 25px; text-align: center;">Message sent from ElectriciToys Contact Form</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Contact Email Sent] to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error("Contact Email Error:", error.message);
    throw error;
  }
};
