const nodemailer = require('nodemailer');

// Set up ethereal email for testing
const getTransporter = async () => {
  // If no pass in env, use ethereal test account
  let account;
  try {
    account = await nodemailer.createTestAccount();
  } catch (err) {
    console.error("Failed to create ethereal account", err);
  }

  const transporter = nodemailer.createTransport({
    host: account ? account.smtp.host : 'smtp.ethereal.email',
    port: account ? account.smtp.port : 587,
    secure: account ? account.smtp.secure : false, 
    auth: {
      user: process.env.EMAIL_USER || account?.user,
      pass: process.env.EMAIL_PASS || account?.pass,
    },
  });

  return transporter;
};

const sendDeadlineAlert = async (userEmail, userName, appToAlert) => {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: '"Placement Tracker" <noreply@placementtracker.xyz>', 
      to: userEmail,
      subject: "Action Required: Upcoming Application Deadline!",
      text: `Hi ${userName},\n\nYou have an upcoming deadline for ${appToAlert.companyName} (${appToAlert.role}). The deadline is ${new Date(appToAlert.deadline).toLocaleDateString()}.\n\nDon't forget to apply!\n\nBest,\nPlacement Tracker Team`,
      html: `<b>Hi ${userName},</b><br/><br/>You have an upcoming deadline for <b>${appToAlert.companyName}</b> (${appToAlert.role}).<br/>The deadline is <b>${new Date(appToAlert.deadline).toLocaleDateString()}</b>.<br/><br/>Don't forget to apply!<br/><br/>Best,<br/>Placement Tracker Team`,
    });

    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = { sendDeadlineAlert };
