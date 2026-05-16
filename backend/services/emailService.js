const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

const sendOTP = async (email, otp, type) => {
  const subject = type === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
  const message = type === 'verification' 
    ? `Your verification code is: ${otp}` 
    : `Your password reset code is: ${otp}`;

  try {
    console.log(`[${new Date().toISOString()}] Attempting to send OTP email to ${email}`);
    
    await transporter.sendMail({
      from: `"MovieVault" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#E50914">MovieVault</h2>
          <p style="font-size:16px">${message}</p>
          <h1 style="font-size:48px;letter-spacing:12px;color:#111">${otp}</h1>
          <p style="color:#666;font-size:13px">
            This code expires in 10 minutes.<br/>
            If you did not request this, ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`[${new Date().toISOString()}] Successfully sent OTP to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in sendOTP service:`, error.message);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

module.exports = { sendOTP };
