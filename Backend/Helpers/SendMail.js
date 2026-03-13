import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp, subject = "Verify Your Account - OTP", title = "Account Verification") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true, // Log to console
      debug: true,  // Include debug output
    });

    const mailOptions = {
      from: `"ElectriciToys Hub" <${process.env.EMAIL_USER}>`, // Official display name
      to,
      subject,
      text: `Your OTP for account verification is ${otp}. This code is valid for 10 minutes.`, // Text fallback for better delivery
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #C78023;">Account Verification</h2>
          <p>Thank you for registering with ElectriciToys. Use the following OTP to complete your verification:</p>
          <h1 style="color: #333; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This OTP is valid for <b>10 minutes</b>.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP Email Sent Successfully to:", to);
    return true;

  } catch (error) {
    console.error("Critical Email Error (OTP):", error);
    throw new Error("Failed to send OTP email. Please check your email address or try again later.");
  }
};

export const sendContactEmail = async (adminEmail, contactData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ElectriciToys Contact" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Contact Transmission from ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #C78023; text-transform: uppercase;">New Transmission Received</h2>
          <p>You have received a new message from the contact form on your website.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <div style="margin-bottom: 10px;">
            <strong>Full Name:</strong> ${contactData.name}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Email Address:</strong> ${contactData.email}
          </div>
          <div style="margin-bottom: 20px;">
            <strong>Message:</strong>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; font-style: italic;">
              ${contactData.message}
            </p>
          </div>
          <p style="font-size: 12px; color: #888;">This email was sent from the Electrici-Toys contact form.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Contact Email Sent Successfully to Admin");
    return true;
  } catch (error) {
    console.log("Contact Email Error:", error);
    throw error;
  }
};
