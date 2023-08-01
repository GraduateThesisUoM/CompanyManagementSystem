const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
   user: process.env.DEMO_EMAIL,
   pass: process.env.DEMO_EMAIL_KEY
   }
});

async function sendEmail(email, token) {
  const resetLink = `http://${process.env.DOMAIN}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: 'process.env.DEMO_EMAIL',
      to: email,
      subject: 'Password Reset Link',
      text: `Click on the following link to reset your password: ${resetLink}`,
    });
  } catch (err) {
    console.error('Error sending email:', err);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
}

module.exports = sendEmail;
