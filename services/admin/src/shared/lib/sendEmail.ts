import { Logger } from 'src/shared/lib/Logger';

const nodemailer = require('nodemailer');

export async function sendEmail(
  to: string,
  bcc: string | string[] | null,
  subject: string,
  content: string,
  type = 'HTML',
) {
  if (!to) {
    throw new Error('to is required');
  }
  if (!subject) {
    throw new Error('subject is required');
  }
  if (!content) {
    throw new Error('content is required');
  }
  if (!type) {
    throw new Error('type is required');
  }

  const payload: {
    from: string;
    to: string;
    subject: string;
    bcc?: string | string[];
    html?: string;
    text?: string;
  } = {
    from: process.env.EMAIL_FROM || '',
    to,
    subject,
  };

  if (bcc) {
    payload.bcc = bcc;
  }
  if (type === 'HTML') {
    payload.html = content;
  } else {
    payload.text = content;
  }

  if (!process.env.EMAIL_SMTP_HOST || !process.env.EMAIL_FROM) {
    if (process.env.NODE_ENV !== 'test') {
      Logger.debug(
        `Emails are disabled. Please configure EMAIL_SMTP_HOST and EMAIL_FROM on .env`,
      );
      Logger.debug(payload);
    }
    return;
  }

  Logger.debug(`Sending email to ${to} - ${type}`);

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT || 587,
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASSWORD,
    },
  });

  let info = await transporter.sendMail(payload);
  Logger.debug(`Email sent: ${info.messageId}`);
  return info;
}
