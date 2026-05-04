import nodemailer from 'nodemailer';

export class EmailService {
  static transporter = null;

  static initialize() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  static async sendLoginAlert(email, firstName) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `${process.env.APP_NAME} - Login Alert`,
        html: `
          <h2>Login Alert</h2>
          <p>Hello ${firstName},</p>
          <p>Your account was accessed at ${new Date().toLocaleString()}</p>
          <p>If this wasn't you, please secure your account immediately.</p>
        `,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  static async sendTransferAlert(email, firstName, fromAccount, toAccount, amount) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `${process.env.APP_NAME} - Transfer Confirmation`,
        html: `
          <h2>Transfer Completed</h2>
          <p>Hello ${firstName},</p>
          <p>A transfer of $${amount} has been completed:</p>
          <ul>
            <li>From: ${fromAccount}</li>
            <li>To: ${toAccount}</li>
            <li>Time: ${new Date().toLocaleString()}</li>
          </ul>
        `,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  static async sendFailureAlert(email, firstName, reason) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `${process.env.APP_NAME} - Transaction Failed`,
        html: `
          <h2>Transaction Failed</h2>
          <p>Hello ${firstName},</p>
          <p>A transaction failed with the following reason:</p>
          <p><strong>${reason}</strong></p>
          <p>Time: ${new Date().toLocaleString()}</p>
        `,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }
}
