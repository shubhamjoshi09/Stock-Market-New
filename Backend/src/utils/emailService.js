import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Check if Gmail credentials are provided
    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_USER !== "your_email@gmail.com" &&
      process.env.EMAIL_PASS !== "your_app_password_here"
    ) {
      console.log(
        `📧 Email service initialized with Gmail SMTP for ${process.env.EMAIL_USER}`
      );

      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      console.log(
        "📧 Email service initialized (development mode - OTP will be shown in console)"
      );
      console.log(
        "⚠️  To enable real emails, configure EMAIL_USER and EMAIL_PASS in .env file"
      );
      return null; // No transporter for development
    }
  }

  async sendOTPEmail(email, otp, firstName) {
    try {
      // If real transporter is available, send actual email
      if (this.transporter) {
        const mailOptions = {
          from: `"Stock Market Platform" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Email Verification - Your OTP Code",
          html: this.getOTPEmailTemplate(otp, firstName),
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email sent successfully to ${email}`);
        console.log(`📧 Message ID: ${info.messageId}`);

        return { success: true, messageId: info.messageId };
      } else {
        // Fallback to console logging for development
        console.log(`
📧 =============== OTP EMAIL ===============
👤 To: ${email} (${firstName})
🔐 OTP Code: ${otp}
⏰ Valid for: 10 minutes
🎯 Use this code to verify your email address
⚠️  Configure EMAIL_USER and EMAIL_PASS to send real emails
==========================================
        `);

        return { success: true, messageId: "dev-mode-" + Date.now() };
      }
    } catch (error) {
      console.error("❌ Error sending OTP email:", error.message);

      // Fallback to console in case of error
      console.log(`
📧 =============== OTP EMAIL (FALLBACK) ===============
👤 To: ${email} (${firstName})
🔐 OTP Code: ${otp}
⏰ Valid for: 10 minutes
❌ Email sending failed, but OTP is shown here for testing
====================================================
      `);

      return { success: true, messageId: "fallback-mode" }; // Don't fail signup if email fails
    }
  }

  getOTPEmailTemplate(otp, firstName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .title { font-size: 28px; color: #1f2937; margin-bottom: 10px; }
          .subtitle { color: #6b7280; font-size: 16px; }
          .otp-section { text-align: center; margin: 40px 0; padding: 30px; background-color: #f8fafc; border-radius: 8px; border: 2px dashed #e5e7eb; }
          .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 20px 0; }
          .instructions { color: #374151; line-height: 1.6; margin: 30px 0; }
          .warning { background-color: #fef3cd; padding: 15px; border-radius: 6px; color: #92400e; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📈 Stock Market Platform</div>
            <h1 class="title">Email Verification</h1>
            <p class="subtitle">Please verify your email address to complete registration</p>
          </div>

          <p class="instructions">
            Hello <strong>${firstName}</strong>,<br><br>
            Welcome to Stock Market Platform! To complete your account registration, please verify your email address using the OTP code below:
          </p>

          <div class="otp-section">
            <p style="margin: 0; color: #374151; font-weight: 600;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">This code will expire in 10 minutes</p>
          </div>

          <div class="instructions">
            <strong>How to use this code:</strong>
            <ol style="color: #374151;">
              <li>Return to the registration page</li>
              <li>Enter this 6-digit code in the verification field</li>
              <li>Click "Verify Email" to complete your registration</li>
            </ol>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this verification, please ignore this email. Never share this code with anyone.
          </div>

          <div class="footer">
            <p>© 2025 Stock Market Platform. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Alternative: Simple Gmail configuration (for production)
  createGmailTransporter(user, pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass, // Use App Password for Gmail
      },
    });
  }
}

export default new EmailService();
