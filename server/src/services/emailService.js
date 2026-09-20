import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.js';

export const sendJobApplicationEmail = async ({
  user,
  to,
  recipientName,
  subject,
  body,
  attachmentPath,
  attachmentName,
}) => {
  const provider = user?.emailConfig?.provider || ENV.EMAIL_PROVIDER || 'mock';
  const senderName = user?.emailConfig?.senderName || user?.name || 'Applicant';
  const senderEmail = user?.emailConfig?.senderEmail || user?.email || ENV.EMAIL_FROM;

  // Prepare attachments array
  const attachments = [];
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    attachments.push({
      filename: attachmentName || 'Resume.pdf',
      path: attachmentPath,
    });
  }

  // 1. MOCK PROVIDER
  if (provider === 'mock' || !user?.emailConfig?.smtpUser && !ENV.SMTP_USER && !user?.emailConfig?.resendApiKey && !ENV.RESEND_API_KEY) {
    const mockMessageId = `mock-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.log(`\n======================================================`);
    console.log(`[MOCK EMAIL DISPATCHER]`);
    console.log(`From: "${senderName}" <${senderEmail}>`);
    console.log(`To: "${recipientName || 'HR'}" <${to}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Attachment: ${attachments.length > 0 ? attachments[0].filename : 'None'}`);
    console.log(`Body:\n${body}`);
    console.log(`MessageId: ${mockMessageId}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      messageId: mockMessageId,
      provider: 'mock',
      deliveredAt: new Date(),
    };
  }

  // 2. RESEND API PROVIDER
  const resendApiKey = user?.emailConfig?.resendApiKey || ENV.RESEND_API_KEY;
  if (provider === 'resend' && resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [to],
          subject,
          text: body,
          attachments: attachments.map(a => ({
            filename: a.filename,
            content: fs.readFileSync(a.path).toString('base64'),
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send via Resend');
      }

      return {
        success: true,
        messageId: data.id || `resend-${Date.now()}`,
        provider: 'resend',
        deliveredAt: new Date(),
      };
    } catch (err) {
      console.error('[Resend Provider Error]', err);
      throw err;
    }
  }

  // 3. SMTP PROVIDER (Gmail App Password / Custom SMTP)
  const host = user?.emailConfig?.smtpHost || ENV.SMTP_HOST || 'smtp.gmail.com';
  const port = user?.emailConfig?.smtpPort || ENV.SMTP_PORT || 587;
  const userAuth = user?.emailConfig?.smtpUser || ENV.SMTP_USER;
  const passAuth = user?.emailConfig?.smtpPass || ENV.SMTP_PASS;
  const secure = user?.emailConfig?.smtpSecure ?? (port === 465);

  if (!userAuth || !passAuth) {
    throw new Error('SMTP credentials (Sender Email and App Password) are required. Please configure your email credentials in Settings.');
  }

  console.log(`[Email Service] Dispatching real email via SMTP (${host}:${port})`);
  console.log(`[Email Service] From: "${senderName}" <${userAuth || senderEmail}> -> To: <${to}>`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: userAuth,
      pass: passAuth,
    },
  });

  const mailOptions = {
    from: `"${senderName}" <${userAuth || senderEmail}>`,
    to,
    subject,
    text: body,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] ✓ Email successfully sent! MessageId: ${info.messageId}`);
  
  return {
    success: true,
    messageId: info.messageId || `smtp-${Date.now()}`,
    provider: 'smtp',
    deliveredAt: new Date(),
  };
};
