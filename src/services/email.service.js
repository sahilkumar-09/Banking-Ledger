import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendRegistrationEmail = async(userEmail, name) => {
    const subject = 'Welcome to Backend Ledger'
    const text = `Hello ${name}, \n\nThank you for registering at Backend Ledger. We're exited to have you on board!\n\nBest regards, \nThe Backend Ledger Team`
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger. We're exited to have you on board!</p><p>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html)
}

const sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
  const subject = "Transaction Successful!"
  const text = `Hello ${name}, \n\nYour transaction of ₹${amount} to account ${toAccount} was successful. \n\nBest regards, \nThe Backend Ledger Team`
  const html = `<p>Hello ${name}, </p><p>Your transaction of ₹${amount} to account ${toAccount} was successful. </p><p>Best regards, </p>The Backend Ledger Team`

  await sendEmail(userEmail, subject, text, html)
}

const sendTransactionFailureEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
  reason,
) => {
  const subject = "Transaction Failed ❌";

  const text = `Hello ${name},

Unfortunately, your transaction of ₹${amount} to account ${toAccount} has failed.

Reason: ${reason}

Please try again or contact support if the issue persists.

Best regards,
The Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Unfortunately, your transaction of <strong>₹${amount}</strong> to account 
    <strong>${toAccount}</strong> has failed.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Please try again or contact support if the issue persists.</p>
    <p>Best regards,<br/>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
};

export {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
}