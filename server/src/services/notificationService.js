import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';

let transporter = null;

// Initialize email transporter if SMTP credentials exist
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an in-app notification and optionally an email
 */
export const sendNotification = async ({
  userId,
  userEmail,
  title,
  titleTa = '',
  message,
  messageTa = '',
  type = 'SYSTEM',
  metadata = {},
}) => {
  try {
    // 1. Create in-app notification in DB
    const notification = await Notification.create({
      userId,
      title,
      titleTa,
      message,
      messageTa,
      type,
      metadata,
    });

    // 2. Dispatch email if transporter is configured and email is provided
    if (transporter && userEmail) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@smartpds.gov.in',
          to: userEmail,
          subject: `[Smart PDS] ${title}`,
          text: `${message}\n\n[தமிழ்]\n${messageTa || message}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
              <div style="background-color: #1e3a8a; padding: 12px; border-radius: 6px; color: white; text-align: center;">
                <h2 style="margin: 0;">Smart Public Distribution System</h2>
                <p style="margin: 4px 0 0 0; font-size: 14px;">தமிழ்நாடு பொது விநியோகத் திட்டம்</p>
              </div>
              <div style="padding: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">${title}</h3>
                <p style="color: #475569; line-height: 1.6;">${message}</p>
                <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 20px 0;" />
                <h4 style="color: #1e293b; margin-top: 0;">${titleTa || title}</h4>
                <p style="color: #475569; line-height: 1.6;">${messageTa || message}</p>
              </div>
              <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; font-size: 12px; color: #64748b; text-align: center;">
                This is an automated notification from the Smart PDS platform.
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.warn('[Notification Service] Email dispatch skipped/failed:', mailError.message);
      }
    }

    return notification;
  } catch (error) {
    console.error('[Notification Service] Error creating notification:', error.message);
  }
};
