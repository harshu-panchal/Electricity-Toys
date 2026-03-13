import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim(),
            pass: (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").trim(),
        },
    });
};

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();
        const fromEmail = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
        
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'ElectriciToys Hub'}" <${fromEmail}>`,
            to: (to || "").toLowerCase().trim(),
            subject,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #C78023; padding: 20px; text-align: center; color: white;">
                        <h2 style="margin: 0;">ElectriciToys Hub</h2>
                    </div>
                    <div style="padding: 30px; line-height: 1.6; color: #333;">
                        ${html}
                    </div>
                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 11px; color: #888;">
                        &copy; ${new Date().getFullYear()} ElectriciToys Hub. All rights reserved.<br/>
                        123 Toy Street, Innovation Park, Digital City
                    </div>
                </div>
            `,
        });

        console.log(`[System Email Sent] ID: ${info.messageId} to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending system email:", error.message);
        return false;
    }
};
