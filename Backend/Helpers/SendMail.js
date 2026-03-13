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

export const sendOTPEmail = async (to, otp, subject = "Important: Your Verification Code for ElectriciToys Hub", title = "Verify Your Account") => {
  try {
    const transporter = createTransporter();
    const userEmail = (process.env.EMAIL_USER || "").trim();
    
    const mailOptions = {
      from: `"ElectriciToys Hub" <${userEmail}>`,
      to: (to || "").toLowerCase().trim(),
      subject: `${otp} is your ElectriciToys verification code`,
      replyTo: userEmail,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        "Importance": "High",
      },
      text: `Hello, Your verification code for ElectriciToys is: ${otp}. This code expires in 10 minutes. If you did not request this code, please ignore this email.`,
      html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f4f4f4; min-height: 100%;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
            <div style="background-color: #C78023; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">ElectriciToys Hub</h1>
            </div>
            
            <div style="padding: 40px 35px;">
              <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Confirm Your Email</h2>
              <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 30px;">
                Hello, <br/><br/>
                We received a request to verify your email address for your ElectriciToys account. Please use the following one-time password (OTP) to proceed:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <div style="background-color: #f8f9fa; border: 2px dashed #C78023; border-radius: 12px; padding: 25px; display: inline-block;">
                  <span style="font-size: 38px; font-weight: 800; color: #C78023; letter-spacing: 10px; font-family: monospace;">${otp}</span>
                </div>
                <p style="font-size: 13px; color: #888; margin-top: 15px;">Valid for the next 10 minutes only.</p>
              </div>

              <div style="background-color: #fff9f2; border-left: 4px solid #C78023; padding: 15px; margin-bottom: 30px;">
                <p style="font-size: 14px; color: #7a5a30; margin: 0;">
                  <strong>Security Note:</strong> Never share this code with anyone. Our team will never ask for your OTP via phone or chat.
                </p>
              </div>

              <p style="font-size: 14px; color: #666; line-height: 1.5;">
                If you didn't create an account, you can safely ignore this email. No further action is required.
              </p>
            </div>

            <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">
                Sent by ElectriciToys Hub &bull; Leading Toy Innovation
              </p>
              <p style="font-size: 11px; color: #aaa; margin: 0; line-height: 1.4;">
                123 Toy Street, Innovation Park, <br/>
                Digital City, 411001
              </p>
              <div style="margin-top: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px;">
                <p style="font-size: 11px; color: #bbb; margin: 0;">
                  &copy; ${new Date().getFullYear()} ElectriciToys Hub. All rights reserved.
                </p>
              </div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 11px; color: #bbb;">
              This is an automated transactional email.
            </p>
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
